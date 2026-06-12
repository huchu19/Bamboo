'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useDraftPitches } from '@/lib/draft-pitches-store';
import { isStripeEnabled } from '@/lib/stripe/client';
import { LISTING_FEE_CENTS } from '@/lib/fees';
import { PaymentStep } from '@/components/bamboo/PaymentStep';
import type { PitchCategory, PitchStatus } from '@/types';

const PITCH_CATEGORIES: { value: PitchCategory; label: string; emoji: string }[] = [
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'health', label: 'Health & Wellness', emoji: '🏥' },
  { value: 'fintech', label: 'Fintech', emoji: '💳' },
  { value: 'sustainability', label: 'Sustainability', emoji: '🌱' },
  { value: 'food-beverage', label: 'Food & Beverage', emoji: '🍽️' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'real-estate', label: 'Real Estate', emoji: '🏠' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'consumer-goods', label: 'Consumer Goods', emoji: '🛍️' },
  { value: 'b2b-saas', label: 'B2B SaaS', emoji: '⚙️' },
];

export default function CreatePitchPage() {
  const router = useRouter();
  const { firebaseUser, user, devBypass } = useAuth();
  const { save: saveDraft } = useDraftPitches();

  const [step, setStep] = useState<
    'basic' | 'video' | 'documents' | 'funding' | 'review' | 'payment' | 'confirmation'
  >('basic');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'technology' as PitchCategory,
    tags: [] as string[],
    fundingGoal: '',
    minimumInvestment: '',
    equityOffered: '',
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [payError, setPayError] = useState('');
  const [createdPitchId, setCreatedPitchId] = useState('');

  // Real listing-fee payments need Stripe keys AND real Firestore (the webhook
  // flips the pitch live server-side). Otherwise the demo flow stays in place.
  const realPayments = isStripeEnabled() && !devBypass;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Video must be less than 100MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocs = Array.from(files).filter(
        (f) => f.type === 'application/pdf' && f.size < 25 * 1024 * 1024
      );
      setDocuments((prev) => [...prev, ...newDocs].slice(0, 10));
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;
    setLoading(true);

    // Dev-bypass: persist to localStorage instead of Firebase. The wizard's
    // visible behaviour (progress bar, confirmation step) stays identical.
    if (devBypass) {
      try {
        setUploadStatus('Saving draft locally…');
        setUploadProgress(40);
        await new Promise((r) => setTimeout(r, 250));
        setUploadProgress(80);
        saveDraft({
          title: formData.title,
          tagline: formData.tagline,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          fundingGoalCents: parseInt(formData.fundingGoal || '0', 10) * 100,
          minimumInvestmentCents: parseInt(formData.minimumInvestment || '0', 10) * 100,
          equityOffered: parseFloat(formData.equityOffered || '0'),
          videoFileName: videoFile?.name,
          documentFileNames: documents.map((d) => d.name),
        });
        setUploadProgress(100);
        setStep('confirmation');
      } catch (error) {
        console.error('Failed to save draft pitch:', error);
        alert('Could not save your pitch locally. Please try again.');
      } finally {
        setLoading(false);
        setUploadStatus('');
      }
      return;
    }

    try {
      await uploadAndCreatePitch({ status: 'pending_review', listingFeePaid: true });
      setUploadProgress(100);
      setStep('confirmation');
    } catch (error) {
      console.error('Failed to create pitch:', error);
      alert('Failed to create pitch. Please try again.');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  /** Upload media + create the Firestore pitch doc; returns the new pitch id. */
  const uploadAndCreatePitch = async (opts: {
    status: PitchStatus;
    listingFeePaid: boolean;
  }): Promise<string> => {
    if (!firebaseUser) throw new Error('Not signed in.');
    const { collection, doc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');
    if (!db) throw new Error('Firebase is not configured.');
    const { createPitch } = await import('@/lib/firebase/firestore');
    const {
      uploadPitchVideo,
      uploadPitchDocument,
      waitForUpload,
    } = await import('@/lib/firebase/storage');

    const pitchId = doc(collection(db, 'pitches')).id;
    let videoURL = '';
    const pitchDocuments: { name: string; url: string; type: string; uploadedAt: number }[] = [];

    // Upload video
    if (videoFile) {
      setUploadStatus('Uploading video...');
      const videoTask = uploadPitchVideo(pitchId, videoFile, ({ progress }) => {
        setUploadProgress(Math.round(progress * 0.7)); // 0-70% for video
      });
      videoURL = await waitForUpload(videoTask);
    }

    // Upload documents
    if (documents.length > 0) {
      setUploadStatus('Uploading documents...');
      for (let i = 0; i < documents.length; i++) {
        const docTask = uploadPitchDocument(pitchId, documents[i]);
        const url = await waitForUpload(docTask);
        pitchDocuments.push({
          name: documents[i].name,
          url,
          type: documents[i].type,
          uploadedAt: Date.now(),
        });
        setUploadProgress(70 + Math.round(((i + 1) / documents.length) * 20));
      }
    }

    // Save pitch to Firestore
    setUploadStatus('Saving pitch...');
    setUploadProgress(95);

    const now = Date.now();
    await createPitch(pitchId, {
      inventorId: firebaseUser.uid,
      inventorName: user?.displayName || firebaseUser.displayName || 'Unknown',
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      videoURL,
      documents: pitchDocuments,
      fundingGoal: parseInt(formData.fundingGoal) * 100,
      minimumInvestment: parseInt(formData.minimumInvestment) * 100,
      equityOffered: parseFloat(formData.equityOffered),
      amountRaised: 0,
      status: opts.status,
      isVerified: false,
      viewCount: 0,
      watchlistCount: 0,
      investorCount: 0,
      listingFeePaid: opts.listingFeePaid,
      verifiedBadgePaid: false,
      createdAt: now,
      updatedAt: now,
      // publishedAt is set by the webhook when the listing fee clears (real
      // payments) or here when we publish directly (demo / no-Stripe flow).
      ...(opts.status === 'pending_payment' ? {} : { publishedAt: now }),
    });

    return pitchId;
  };

  /**
   * Real listing-fee flow: create the pitch as `pending_payment` (invisible to
   * discovery, which only lists `live`), then open a Stripe PaymentIntent.
   * The webhook flips the pitch to `live` when the payment succeeds, so a
   * failed/abandoned payment leaves no visible pitch behind.
   */
  const startListingPayment = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    setPayError('');

    try {
      // Re-use the already-created pitch if the user retries after a failure,
      // so we don't re-upload media or leave orphaned docs behind.
      let pitchId = createdPitchId;
      if (!pitchId) {
        pitchId = await uploadAndCreatePitch({ status: 'pending_payment', listingFeePaid: false });
        setCreatedPitchId(pitchId);
      }

      setUploadStatus('Preparing payment...');
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'listing_fee',
          pitchId,
          inventorId: firebaseUser.uid,
          email: user?.email ?? firebaseUser.email ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Could not start payment.');
      }
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('Failed to start listing payment:', error);
      setPayError(error.message || 'Could not start payment. Please try again.');
    } finally {
      setLoading(false);
      setUploadStatus('');
      setUploadProgress(0);
    }
  };

  const steps = ['basic', 'video', 'documents', 'funding', 'review', 'payment', 'confirmation'] as const;
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Shared class fragments
  const inputCls = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder:text-white/25 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:border-[color:var(--gold)] transition-all';
  const labelCls = 'block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2';
  const hintCls = 'text-[10px] font-mono text-white/30 mt-1.5';
  const btnPrimary = 'flex-1 py-3.5 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all';
  const btnSecondary = 'flex-1 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-40';

  return (
    <div className="min-h-screen bg-[color:var(--ink)] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header + progress */}
        {step !== 'confirmation' && (
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-4">
              <h1 className="font-display text-3xl text-white tracking-tight">Plant Your Pitch</h1>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
            {/* Step dots */}
            <div className="flex gap-1.5 mb-1">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentStepIndex ? 'bg-[color:var(--gold)]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Basic Info ── */}
        {step === 'basic' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 1</p>
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>

            <div>
              <label className={labelCls}>Pitch Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., EcoTrack — Carbon Footprint Analytics"
                maxLength={100}
                className={inputCls}
              />
              <p className={hintCls}>{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label className={labelCls}>Tagline *</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="One-sentence hook"
                maxLength={100}
                className={inputCls}
              />
              <p className={hintCls}>{formData.tagline.length}/100 characters</p>
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PITCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                    className={`py-3 px-2 rounded-xl border transition-all text-center ${
                      formData.category === cat.value
                        ? 'border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.emoji}</div>
                    <span className="text-[10px] font-mono leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Tags (up to 5)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
                  }}
                  placeholder="Add a tag and press Enter"
                  className={inputCls + ' flex-1'}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-3 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 text-[color:var(--gold)] px-3 py-1 rounded-full text-[11px] font-mono"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="opacity-60 hover:opacity-100">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell your story. What problem are you solving? Why are you unique?"
                rows={6}
                maxLength={2000}
                className={inputCls + ' resize-none'}
              />
              <p className={hintCls}>{formData.description.length}/2000 characters</p>
            </div>

            <button
              type="button"
              onClick={() => setStep('video')}
              disabled={!formData.title || !formData.tagline || !formData.description}
              className={btnPrimary + ' w-full flex items-center justify-center gap-2 group'}
            >
              Next: Upload Video
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}

        {/* ── Step 2: Video ── */}
        {step === 'video' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 2</p>
              <h2 className="text-xl font-bold text-white">Pitch Video</h2>
              <p className="text-[11px] font-mono text-white/40 mt-1">Max 60 seconds · up to 100 MB · optional</p>
            </div>

            <label
              htmlFor="video-input"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 rounded-xl p-10 cursor-pointer hover:border-[color:var(--gold)]/50 hover:bg-white/5 transition-all group"
            >
              <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" id="video-input" />
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[color:var(--gold)] transition-colors">
                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <p className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">Click to select your video</p>
              <p className="text-[10px] font-mono text-white/30">Drag &amp; drop also works</p>
            </label>

            {videoPreview && (
              <div>
                <p className={labelCls}>Preview</p>
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden ring-1 ring-white/10">
                  <video src={videoPreview} controls className="w-full h-full" />
                </div>
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                  className="mt-2 text-[11px] font-mono text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Remove video
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('basic')} className={btnSecondary}>← Back</button>
              <button
                type="button"
                onClick={() => setStep('documents')}
                className={btnPrimary + ' flex items-center justify-center gap-2 group'}
              >
                {videoFile ? 'Next: Documents' : 'Skip for now'}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Documents ── */}
        {step === 'documents' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 3</p>
              <h2 className="text-xl font-bold text-white">Supporting Documents</h2>
              <p className="text-[11px] font-mono text-white/40 mt-1">PDFs only · up to 10 files · 25 MB each · optional</p>
            </div>

            <label
              htmlFor="docs-input"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 rounded-xl p-10 cursor-pointer hover:border-[color:var(--gold)]/50 hover:bg-white/5 transition-all group"
            >
              <input type="file" multiple accept=".pdf" onChange={handleDocumentSelect} className="hidden" id="docs-input" />
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[color:var(--gold)] transition-colors">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">Click to upload documents</p>
              <p className="text-[10px] font-mono text-white/30">Business plan, financials, deck…</p>
            </label>

            {documents.length > 0 && (
              <div className="space-y-2">
                <p className={labelCls}>Uploaded ({documents.length}/10)</p>
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-lg ring-1 ring-white/10">
                    <span className="text-[11px] font-mono text-white/70 truncate">{doc.name}</span>
                    <button type="button" onClick={() => handleRemoveDocument(idx)} className="text-red-400/60 hover:text-red-400 text-xs ml-3 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('video')} className={btnSecondary}>← Back</button>
              <button
                type="button"
                onClick={() => setStep('funding')}
                className={btnPrimary + ' flex items-center justify-center gap-2 group'}
              >
                Next: Funding
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Funding ── */}
        {step === 'funding' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 4</p>
              <h2 className="text-xl font-bold text-white">Funding Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Funding Goal (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--gold)] font-mono text-sm">$</span>
                  <input
                    type="number"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleInputChange}
                    placeholder="500000"
                    className={inputCls + ' pl-8'}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Min. Investment (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--gold)] font-mono text-sm">$</span>
                  <input
                    type="number"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleInputChange}
                    placeholder="10000"
                    className={inputCls + ' pl-8'}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Equity Offered *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="equityOffered"
                    value={formData.equityOffered}
                    onChange={handleInputChange}
                    placeholder="12"
                    step="0.1"
                    className={inputCls + ' pr-8'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--gold)] font-mono text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('documents')} className={btnSecondary}>← Back</button>
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={!formData.fundingGoal || !formData.minimumInvestment || !formData.equityOffered}
                className={btnPrimary + ' flex items-center justify-center gap-2 group'}
              >
                Review Pitch
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Review ── */}
        {step === 'review' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 5</p>
              <h2 className="text-xl font-bold text-white">Review Your Pitch</h2>
            </div>

            <dl className="rounded-xl bg-white/5 ring-1 ring-white/10 divide-y divide-white/10 overflow-hidden">
              {[
                ['Title', formData.title],
                ['Tagline', formData.tagline],
                ['Category', formData.category.replace(/-/g, ' ')],
                ['Tags', formData.tags.join(', ') || '—'],
                ['Video', videoFile?.name || '—'],
                ['Documents', `${documents.length} file(s)`],
                ['Funding Goal', `$${formData.fundingGoal}`],
                ['Min. Investment', `$${formData.minimumInvestment}`],
                ['Equity Offered', `${formData.equityOffered}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-3 gap-4">
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-white/40 shrink-0">{k}</dt>
                  <dd className="text-sm font-semibold text-white/90 text-right truncate capitalize">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('funding')} className={btnSecondary}>← Back</button>
              <button
                type="button"
                onClick={() => setStep('payment')}
                className={btnPrimary + ' flex items-center justify-center gap-2 group'}
              >
                Continue to Payment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Payment (real Stripe) ── */}
        {step === 'payment' && realPayments && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 6</p>
              <h2 className="text-xl font-bold text-white">Listing Fee</h2>
            </div>

            <div className="rounded-xl bg-[color:var(--gold)]/10 ring-1 ring-[color:var(--gold)]/30 px-5 py-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">One-time fee</p>
              <p className="text-white/70 text-sm mb-3">Publishes your pitch to every investor on Bamboo.</p>
              <div className="flex justify-between items-center pt-3 border-t border-[color:var(--gold)]/20">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Total</span>
                <span className="font-display text-2xl text-[color:var(--gold)]">${(LISTING_FEE_CENTS / 100).toFixed(2)}</span>
              </div>
            </div>

            {clientSecret ? (
              <PaymentStep
                clientSecret={clientSecret}
                amount={LISTING_FEE_CENTS / 100}
                variant="light"
                onSuccess={() => setStep('confirmation')}
                onBack={() => setClientSecret('')}
              />
            ) : (
              <>
                {loading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-white/40">
                      <span>{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div className="bg-[color:var(--gold)] h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {payError && (
                  <p className="text-[10px] font-mono text-red-300/90 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">{payError}</p>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('review')} disabled={loading} className={btnSecondary}>← Back</button>
                  <button
                    type="button"
                    onClick={startListingPayment}
                    disabled={loading}
                    className={btnPrimary + ' flex items-center justify-center gap-2'}
                  >
                    {loading ? 'Preparing…' : `Pay $${(LISTING_FEE_CENTS / 100).toFixed(0)} & Publish`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 6: Payment (demo fallback) ── */}
        {step === 'payment' && !realPayments && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-1">Step 6</p>
              <h2 className="text-xl font-bold text-white">Listing Fee</h2>
            </div>

            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-5 py-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Pricing</p>
              <p className="text-white/70 text-sm mb-3">
                Listing pricing is being finalised.{' '}
                <Link href="/contact" className="text-[color:var(--gold)] underline-offset-2 underline hover:opacity-80">Contact us</Link>{' '}
                to publish your pitch to investors.
              </p>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Total</span>
                <Link href="/contact" className="font-bold text-[color:var(--gold)] hover:opacity-80 transition-opacity">Contact Us →</Link>
              </div>
            </div>

            <p className="text-[10px] font-mono text-white/30 text-center">Demo mode — no real funds move</p>

            {loading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>{uploadStatus}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-[color:var(--gold)] h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('review')} disabled={loading} className={btnSecondary}>← Back</button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={btnPrimary + ' flex items-center justify-center gap-2'}
              >
                {loading ? 'Publishing…' : 'Complete & Publish'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 7: Confirmation ── */}
        {step === 'confirmation' && (
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[color:var(--gold)]/15 ring-1 ring-[color:var(--gold)]/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <h2 className="font-display text-3xl text-white mb-2">Pitch Planted</h2>
              <p className="text-white/50 text-sm font-mono">
                {realPayments
                  ? 'Payment received — your pitch is going live to investors right now.'
                  : 'Your pitch is under review. We\'ll notify you once it\'s live.'}
              </p>
            </div>

            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-5 py-4 text-left">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">Next Steps</p>
              <ol className="space-y-2">
                {(realPayments
                  ? ['Your pitch appears in Discover within moments']
                  : ['Our team reviews your pitch (24–48 h)', 'Once approved, it goes live to all investors']
                ).concat([
                  'Track investor interest from your dashboard',
                  'Upgrade to Verified Badge for extra credibility',
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[11px] font-mono text-white/60">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[color:var(--gold)]/20 text-[color:var(--gold)] flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className={btnPrimary + ' flex items-center justify-center gap-2'}
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => {
                  setStep('basic');
                  setFormData({ title: '', tagline: '', description: '', category: 'technology', tags: [], fundingGoal: '', minimumInvestment: '', equityOffered: '' });
                  setVideoFile(null);
                  setVideoPreview('');
                  setDocuments([]);
                  setClientSecret('');
                  setPayError('');
                  setCreatedPitchId('');
                }}
                className={btnSecondary}
              >
                Create Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
