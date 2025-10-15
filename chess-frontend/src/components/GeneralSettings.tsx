import { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";

export default function GeneralSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setDisplayName(firebaseUser?.displayName || "");
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateName = async () => {
    if (!user || !displayName.trim()) return;
    
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName });
      setSuccessMessage("Name updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update name:", error);
      setSuccessMessage("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg animate-pulse">
            {successMessage}
          </div>
        )}

        <section className="space-y-6">
          {/* Header */}
          <div className="border-b border-emerald-600/30 pb-6">
            <h2 className="text-3xl font-bold text-white">Settings</h2>
            <p className="mt-2 text-emerald-300/70">Manage your profile and preferences</p>
          </div>

          {/* Profile Section */}
          <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-emerald-600/20">
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              <p className="mt-1 text-sm text-emerald-300/70">
                This information will be displayed publicly so be careful what you share.
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
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
                        isEditing
                          ? "bg-slate-700/50 border border-emerald-500/50 text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400"
                          : "bg-slate-900/50 border border-emerald-600/20 text-white cursor-default"
                      }`}
                      placeholder="Enter your name"
                    />
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 font-medium rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all whitespace-nowrap"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateName}
                        disabled={isSaving}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-all whitespace-nowrap"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user?.displayName || "");
                        }}
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
        </section>
      </div>
    </div>
  );
}