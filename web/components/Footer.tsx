export function Footer() {
  return (
    <footer
      className="py-12 border-t"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" style={{ color: "var(--text-tertiary)" }}>
          <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            BAMBOO
          </p>
          <p>&copy; 2026 Bamboo Investing Platform. Move Markets. Build Empires.</p>
        </div>
      </div>
    </footer>
  );
}
