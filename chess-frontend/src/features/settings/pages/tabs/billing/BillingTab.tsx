import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function BillingTab() {
  return (
    <div className="bg-slate-800/60 border border-emerald-600/30 rounded-lg p-8 text-center">
      <CreditCardIcon className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold text-white mb-2">Billing & Payments</h3>
      <p className="text-slate-400">Manage your billing information</p>
    </div>
  );
}
