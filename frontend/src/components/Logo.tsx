export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3z" fill="url(#logo-grad)" />
        <path
          d="M16.7 8.3a1 1 0 0 0-1.4 0L10.6 13l-1.9-1.9a1 1 0 1 0-1.4 1.4l2.6 2.6a1 1 0 0 0 1.4 0l5.4-5.4a1 1 0 0 0 0-1.4z"
          fill="#fff"
        />
      </svg>
    </div>
  );
}
