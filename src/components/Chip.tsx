'use client';

interface ChipProps {
  label: string;
  icon: string;
  onRemove: () => void;
  variant?: 'dataSource' | 'channel';
}

export default function Chip({ label, icon, onRemove, variant = 'dataSource' }: ChipProps) {
  const variantStyles = {
    dataSource: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
    channel: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
  };

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${variantStyles[variant]}`}>
      <span className="mr-2 text-base">{icon}</span>
      <span className="mr-2">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
