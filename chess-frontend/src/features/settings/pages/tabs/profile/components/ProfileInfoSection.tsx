import { useState, useEffect } from "react";
import type { User } from "firebase/auth";

interface ProfileInfoSectionProps {
  user: User | null;
  onUpdateName: (name: string) => Promise<void>;
}

export default function ProfileInfoSection({ user, onUpdateName }: ProfileInfoSectionProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update displayName when user prop changes
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    
    setIsSaving(true);
    try {
      await onUpdateName(displayName);
      setIsEditingName(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditingName(false);
    setDisplayName(user?.displayName || "");
  };

  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
        <p className="mt-1 text-sm text-emerald-300/70">
          Update your account profile information
        </p>
      </div>

      <div className="divide-y divide-emerald-600/20">
        {/* Full Name */}
        <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
          <label className="text-sm font-medium text-emerald-300 mb-3 block">Full Name</label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditingName}
                className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isEditingName
                    ? "bg-slate-700/50 border border-emerald-500/50 text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400"
                    : "bg-slate-900/50 border border-emerald-600/20 text-white cursor-default"
                }`}
                placeholder="Enter your name"
              />
            </div>
            {!isEditingName ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all whitespace-nowrap"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-all whitespace-nowrap"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg border border-slate-600/30 transition-all whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="px-6 py-6 hover:bg-slate-700/30 transition-colors">
          <label className="text-sm font-medium text-emerald-300 mb-3 block">Email Address</label>
          <div className="px-4 py-2.5 bg-slate-900/50 border border-emerald-600/20 text-white rounded-lg font-medium">
            {user?.email || "Not set"}
          </div>
          <p className="mt-2 text-xs text-slate-400">Contact support to change your email</p>
        </div>
      </div>
    </div>
  );
}
