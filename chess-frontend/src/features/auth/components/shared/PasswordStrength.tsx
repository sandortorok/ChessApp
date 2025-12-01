interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor =
    passwordStrength >= 75
      ? 'bg-green-500'
      : passwordStrength >= 50
        ? 'bg-yellow-500'
        : passwordStrength >= 25
          ? 'bg-orange-500'
          : 'bg-red-500';

  const strengthText =
    passwordStrength >= 75
      ? 'Strong password'
      : passwordStrength >= 50
        ? 'Good password'
        : passwordStrength >= 25
          ? 'Weak password'
          : 'Very weak password';

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${passwordStrength}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{strengthText}</p>
    </div>
  );
}
