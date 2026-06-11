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

  return (
    <div>
      {step !== 'confirmation' && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Pitch</h1>
            <span className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 'basic' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Pitch Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., EcoTrack - Carbon Footprint Analytics"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Tagline *</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="One-sentence hook"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.tagline.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {PITCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                    className={`p-3 rounded-lg border-2 transition text-center text-sm font-medium ${
                      formData.category === cat.value
                        ? 'border-green-600 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Tags (up to 5)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell your story. What problem are you solving? Why are you unique?"
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            <button
              type="button"
              onClick={() => setStep('video')}
              disabled={!formData.title || !formData.tagline || !formData.description}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Upload Video
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Video Upload */}
      {step === 'video' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Pitch Video</h2>
          <p className="text-gray-600 mb-6">Maximum 60 seconds, up to 100MB</p>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-input"
              />
              <label htmlFor="video-input" className="cursor-pointer block">
                <div className="text-4xl mb-2">🎥</div>
                <p className="font-semibold text-gray-900 mb-1">Upload your pitch video</p>
                <p className="text-sm text-gray-600">Drag and drop or click to select</p>
              </label>
            </div>

            {videoPreview && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Preview</p>
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video src={videoPreview} controls className="w-full h-full" />
                </div>
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                  className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove Video
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('basic')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('documents')}
                disabled={!videoFile}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 'documents' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
          <p className="text-gray-600 mb-6">PDFs only, up to 10 files, 25MB each (optional)</p>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleDocumentSelect}
                className="hidden"
                id="docs-input"
              />
              <label htmlFor="docs-input" className="cursor-pointer block">
                <div className="text-4xl mb-2">📄</div>
                <p className="font-semibold text-gray-900 mb-1">Upload your documents</p>
                <p className="text-sm text-gray-600">Business plan, financials, deck, etc.</p>
              </label>
            </div>

            {documents.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Uploaded Documents ({documents.length}/10)
                </p>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('video')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('funding')}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Next: Funding Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Funding */}
      {step === 'funding' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Details</h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Funding Goal (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600">$</span>
                  <input
                    type="number"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleInputChange}
                    placeholder="500000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Minimum Investment (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600">$</span>
                  <input
                    type="number"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleInputChange}
                    placeholder="10000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Equity Offered (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="equityOffered"
                    value={formData.equityOffered}
                    onChange={handleInputChange}
                    placeholder="12"
                    step="0.1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                  <span className="absolute right-4 top-3 text-gray-600">%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('documents')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={!formData.fundingGoal || !formData.minimumInvestment || !formData.equityOffered}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Pitch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 'review' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Pitch</h2>

          <div className="space-y-6">
            <div className="border-t border-b border-gray-200 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-semibold text-gray-900">{formData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {formData.category.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tagline</p>
                  <p className="font-semibold text-gray-900">{formData.tagline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Video</p>
                  <p className="font-semibold text-gray-900">{videoFile?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funding Goal</p>
                  <p className="font-semibold text-gray-900">${formData.fundingGoal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equity Offered</p>
                  <p className="font-semibold text-gray-900">{formData.equityOffered}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min. Investment</p>
                  <p className="font-semibold text-gray-900">${formData.minimumInvestment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="font-semibold text-gray-900">{documents.length} file(s)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('funding')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Payment — real Stripe listing fee */}
      {step === 'payment' && realPayments && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">💳 Pitch Listing Fee</h3>
              <p className="text-green-700 mb-4">
                A one-time fee to publish your pitch to all investors on Bamboo.
              </p>
              <div className="flex justify-between py-3 border-t border-green-200">
                <span className="font-semibold text-green-900">Total</span>
                <span className="font-bold text-green-900 text-lg">
                  ${(LISTING_FEE_CENTS / 100).toFixed(2)}
                </span>
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {payError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {payError}
                  </p>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    disabled={loading}
                    className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={startListingPayment}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Preparing...'
                      : `Continue to Payment — $${(LISTING_FEE_CENTS / 100).toFixed(0)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Payment — demo / Stripe-not-configured fallback */}
      {step === 'payment' && !realPayments && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💳 Pitch Listing Fee</h3>
              <p className="text-blue-700 mb-4">
                Listing pricing is being finalised.{' '}
                <Link href="/contact" className="underline font-semibold hover:text-blue-900">
                  Contact us
                </Link>{' '}
                to publish your pitch to investors.
              </p>
              <div className="flex justify-between py-3 border-t border-blue-200">
                <span className="font-semibold text-blue-900">Total</span>
                <Link
                  href="/contact"
                  className="font-bold text-blue-900 text-lg underline hover:text-blue-700"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                🔒 Payment processed securely. This is a demo — no real charge will be made.
              </p>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{uploadStatus}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing...' : 'Complete & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pitch Created Successfully!</h2>
          <p className="text-gray-600 mb-8">
            {realPayments
              ? 'Payment received — your pitch is going live to investors right now.'
              : "Your pitch has been submitted and is now under review. You'll be notified once it's approved and visible to investors."}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
            <p className="text-sm text-gray-600 mb-2">Next Steps:</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              {realPayments ? (
                <li>Your pitch appears in Discover within a few moments</li>
              ) : (
                <>
                  <li>Your pitch is reviewed by our team (24–48 hours)</li>
                  <li>Once approved, it goes live to all investors</li>
                </>
              )}
              <li>Track investor interest from your dashboard</li>
              <li>
                Optional: Upgrade to Verified Badge (
                <Link href="/contact" className="underline text-green-700 hover:text-green-800">
                  Contact Us
                </Link>
                ) for extra credibility
              </li>
            </ol>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setStep('basic');
                setFormData({
                  title: '', tagline: '', description: '',
                  category: 'technology', tags: [],
                  fundingGoal: '', minimumInvestment: '', equityOffered: '',
                });
                setVideoFile(null);
                setVideoPreview('');
                setDocuments([]);
                setClientSecret('');
                setPayError('');
                setCreatedPitchId('');
              }}
              className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Create Another Pitch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
