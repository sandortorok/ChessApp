import { useState } from "react";
import { Lock } from "lucide-react";

interface SecuritySectionProps {
  onPasswordChange: (newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SecuritySection({ onPasswordChange }: SecuritySectionProps) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError("");
    setIsChanging(true);

    try {
      const result = await onPasswordChange(newPassword, confirmPassword);
      
      if (result.success) {
        setShowPasswordChange(false);
        setNewPassword("");
        setConfirmPassword("");
      } else if (result.error) {
        setPasswordError(result.error);
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    setShowPasswordChange(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Security
        </h3>
      </div>

      <div className="px-6 py-6">
        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-emerald-300 mb-2 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-emerald-300 mb-2 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-emerald-500/50 text-white rounded-lg focus:outline-none focus:border-emerald-400"
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                disabled={isChanging}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-all"
              >
                {isChanging ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg border border-slate-600/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
