import { UsersIcon } from "@heroicons/react/24/outline";

export default function FriendsTab() {
  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
      <UsersIcon className="w-12 h-12 text-pink-400 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold text-white mb-2">Friends</h3>
      <p className="text-slate-400">Manage your friends and connections</p>
    </div>
  );
}
