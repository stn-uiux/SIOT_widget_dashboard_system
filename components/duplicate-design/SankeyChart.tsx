export function SankeyChart() {
  return (
    <div className="relative w-full min-h-[400px] flex-1 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flow2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flow3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flow4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flow5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flow6" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <path d="M 150 150 C 300 150, 300 90, 450 90" fill="none" stroke="url(#flow1)" strokeWidth="50" opacity="0.7" />
        <path d="M 150 150 C 300 150, 300 180, 450 180" fill="none" stroke="url(#flow2)" strokeWidth="45" opacity="0.7" />
        <path d="M 150 150 C 300 150, 300 270, 450 270" fill="none" stroke="url(#flow3)" strokeWidth="38" opacity="0.7" />
        <path d="M 550 90 C 600 90, 600 100, 650 100" fill="none" stroke="url(#flow4)" strokeWidth="50" opacity="0.7" />
        <path d="M 550 180 C 600 180, 600 190, 650 190" fill="none" stroke="url(#flow5)" strokeWidth="45" opacity="0.7" />
        <path d="M 550 270 C 600 270, 600 280, 650 280" fill="none" stroke="url(#flow6)" strokeWidth="38" opacity="0.7" />
      </svg>

      <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
        <div className="bg-[var(--primary-gradient)] rounded-xl px-8 py-6 shadow-lg border border-[var(--border-base)]">
          <div className="text-white text-sm opacity-80 mb-1">SOURCE</div>
          <div className="text-white text-2xl font-semibold">Finance</div>
        </div>
      </div>

      <div className="absolute left-[48%] top-[18%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Sales</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$84,430</div>
        </div>
      </div>

      <div className="absolute left-[48%] top-[42%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Investments</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$78,655</div>
        </div>
      </div>

      <div className="absolute left-[48%] top-[66%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Salary</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$23,987</div>
        </div>
      </div>

      <div className="absolute right-[8%] top-[20%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Main projects</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$5,873</div>
          <div className="text-[var(--text-muted)] text-xs mt-1 opacity-80">16 projects in progress</div>
        </div>
      </div>

      <div className="absolute right-[8%] top-[44%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Development</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$12,989</div>
        </div>
      </div>

      <div className="absolute right-[8%] top-[68%]">
        <div className="bg-[var(--surface)] border border-[var(--border-base)] rounded-xl px-6 py-4 shadow-lg">
          <div className="text-[var(--text-muted)] text-xs mb-1">Outsourcing</div>
          <div className="text-[var(--text-main)] text-lg font-semibold">$650</div>
        </div>
      </div>
    </div>
  );
}
