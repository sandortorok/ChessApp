interface AuthAlertProps {
  type: 'error' | 'success';
  message: string;
  details?: string;
}

export function AuthAlert({ type, message, details }: AuthAlertProps) {
  const isError = type === 'error';
  const iconColor = isError ? 'text-red-400' : 'text-green-400';
  const bgColor = isError ? 'bg-red-500/10' : 'bg-green-500/10';
  const borderColor = isError ? 'border-red-500/20' : 'border-green-500/20';
  const textColor = isError ? 'text-red-400' : 'text-green-400';

  return (
    <div
      className={`rounded-lg ${bgColor} border ${borderColor} px-4 py-3 flex items-start gap-3`}
    >
      <svg
        className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        {isError ? (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <div>
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        {details && <p className={`text-xs ${textColor}/70 mt-1`}>{details}</p>}
      </div>
    </div>
  );
}
