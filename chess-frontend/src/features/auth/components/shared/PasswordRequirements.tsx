interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    { text: 'At least 6 characters', met: password.length >= 6 },
    { text: 'One uppercase letter (recommended)', met: /[A-Z]/.test(password) },
    {
      text: 'One number or special character (recommended)',
      met: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="mt-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
      <p className="text-xs font-medium text-gray-300 mb-2">
        Password requirements:
      </p>
      <ul className="space-y-1 text-xs text-gray-400">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
              •
            </span>
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
