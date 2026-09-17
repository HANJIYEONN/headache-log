export default function BlogIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4.5h10a2 2 0 0 1 2 2V19H7a2 2 0 0 1-2-2V4.5Z" />
      <path d="M7 19a2 2 0 0 1 2-2h8" />
      <path d="M9 8h4M9 11h5" />
      <path d="m15.5 13.5 3.8-3.8a1.1 1.1 0 0 1 1.6 1.6l-3.8 3.8-2.1.5.5-2.1Z" />
    </svg>
  );
}
