import { isDemoMode, DEMO_PLANS } from "@/lib/demo-data";

export default function PricingPage() {
  const plans = DEMO_PLANS;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      {isDemoMode() && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Demo Mode</strong> — Stripe checkout simulated. Connect real Stripe keys for live payments.
        </div>
      )}
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="mt-2 text-lg text-gray-600">Choose the plan that fits your team</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-xl border-2 p-8 ${plan.popular ? "border-blue-500 shadow-lg" : "border-gray-200"}`}>
            {plan.popular && <span className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Most Popular</span>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-2">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-gray-500">/{plan.interval}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`mt-8 w-full rounded-lg px-4 py-3 font-medium ${plan.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}>
              {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
