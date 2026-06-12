import type { PitchDocument } from "@/lib/mock-pitches";

/**
 * Infer file extension from a URL.
 * Returns the lowercased extension without leading dot, or "file" if unknown.
 */
function extOf(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  if (dot < 0 || dot === clean.length - 1) return "file";
  return clean.slice(dot + 1).toLowerCase();
}

function FileIcon({ ext, locked }: { ext: string; locked?: boolean }) {
  // Subtle color theming per file type.
  const tone =
    ext === "pdf"
      ? "text-rose-300/90 bg-rose-500/10"
      : ext === "xlsx" || ext === "csv"
        ? "text-emerald-300/90 bg-emerald-500/10"
        : ext === "doc" || ext === "docx"
          ? "text-sky-300/90 bg-sky-500/10"
          : "text-amber-300/90 bg-amber-500/10";

  return (
    <span
      aria-hidden="true"
      className={`size-11 rounded-xl grid place-items-center ring-1 ring-white/5 ${tone}`}
    >
      {locked ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      )}
    </span>
  );
}

export function DocumentCard({ doc }: { doc: PitchDocument }) {
  const ext = extOf(doc.url);
  const isInteractive = !doc.comingSoon;

  const inner = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <FileIcon ext={ext} locked={doc.locked} />
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{doc.label}</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
            {ext.toUpperCase()}
            {doc.size ? ` · ${doc.size}` : ""}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 text-[10px] font-mono uppercase tracking-widest transition-colors ${
          doc.comingSoon
            ? "text-muted-foreground"
            : doc.locked
              ? "text-[color:var(--gold)]"
              : "text-muted-foreground group-hover:text-[color:var(--gold)]"
        }`}
      >
        {doc.comingSoon ? "Coming soon" : doc.locked ? "Request →" : "Open ↗"}
      </span>
    </>
  );

  const baseClass =
    "group flex items-center justify-between gap-4 p-4 rounded-xl bg-card ring-1 ring-[color:var(--border)] transition-all";

  if (!isInteractive) {
    return (
      <div
        aria-disabled="true"
        className={`${baseClass} opacity-70 cursor-not-allowed select-none`}
      >
        {inner}
      </div>
    );
  }

  if (doc.locked) {
    return (
      <button
        type="button"
        className={`${baseClass} text-left hover:ring-[color:var(--gold)]/30 hover:shadow-sm cursor-pointer w-full`}
        onClick={() => {
          // For the demo we just acknowledge the request — Phase 6 wires real
          // access requests through Firestore.
          if (typeof window !== "undefined") {
            window.alert(
              "Request submitted. The inventor will review your access request to " +
                doc.label +
                ".",
            );
          }
        }}
      >
        {inner}
      </button>
    );
  }

  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} hover:ring-[color:var(--gold)]/30 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer`}
    >
      {inner}
    </a>
  );
}
