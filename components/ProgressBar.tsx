interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
        Question {current} of {total} ({percentage}%)
      </div>
    </div>
  );
}

