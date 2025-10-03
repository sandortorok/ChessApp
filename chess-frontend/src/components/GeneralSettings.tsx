import { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";

export default function GeneralSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setDisplayName(firebaseUser?.displayName || "");
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateName = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName });
      alert("Name updated successfully!");
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-white">Profile</h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-400">
            This information will be displayed publicly so be careful what you share.
          </p>
        </div>

        <div className="mt-6 border-t border-gray/10">
          <dl className="divide-y divide-white/10">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">Full name</dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0 flex justify-between items-center">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mr-4 rounded border px-2 py-1 text-gray-400"
                />
                <button
                  onClick={handleUpdateName}
                  className="font-medium text-teal-400 hover:text-teal-300"
                >
                  Update
                </button>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">Email address</dt>
              <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">{user?.email}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
