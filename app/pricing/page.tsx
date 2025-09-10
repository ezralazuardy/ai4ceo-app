import { getSettings } from '@/lib/db/queries';
import { BillingSubscribeClient } from '@/components/billing-subscribe.client';
import type { Metadata } from 'next';

type Plan = {
  id: string;
  name: string;
  price: number; // in smallest currency unit (e.g., cents)
  currency?: string; // e.g., IDR
  description?: string;
  features?: string[];
  popular?: boolean;
  contact?: boolean;
  contactUrl?: string;
};

function formatPrice(amount: number, currency?: string) {
  // Assume amount in major for display if currency is IDR (no cents)
  if (!currency || currency.toUpperCase() === 'IDR') return `IDR ${amount.toLocaleString()}`;
  return `${currency.toUpperCase()} ${amount / 100}`;
}

export default async function PricingPage() {
  const settings = await getSettings();
  const pricing = (settings?.pricingPlans as any) || {};
  const monthly: Plan[] = Array.isArray(pricing.monthly) ? pricing.monthly : [
    { id: 'core_monthly', name: 'Core', price: 299000, currency: 'IDR', description: 'For individuals and small teams', features: ['Essential features', 'Reasonable usage limits'], popular: true },
    { id: 'growth_monthly', name: 'Growth', price: 1999000, currency: 'IDR', description: 'For growing teams', features: ['Higher limits', 'Priority support'], popular: false },
  ];
  const annual: Plan[] = Array.isArray(pricing.annual) ? pricing.annual : [
    { id: 'core_annual', name: 'Core (Annual)', price: 2870400, currency: 'IDR', description: 'Save with annual billing', features: ['Essential features', 'Reasonable usage limits'], popular: true },
    { id: 'growth_annual', name: 'Growth (Annual)', price: 19190400, currency: 'IDR', description: 'Best value for teams', features: ['Higher limits', 'Priority support'], popular: false },
  ];

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Choose your plan</h1>
        <p className="text-muted-foreground">Flexible monthly or annual billing.</p>
      </div>

      {/* Toggle hint (static for SSR). If you want client toggle, we can add one later. */}
      <div className="grid md:grid-cols-2 gap-4">
        {monthly.map((p) => (
          <div key={p.id} className={`rounded-xl border p-4 ${p.popular ? 'ring-1 ring-primary' : ''} ${p.contact ? 'md:col-span-2' : ''}`}>
            {p.popular && (
              <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">Most Popular</div>
            )}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.description || '—'}</div>
              </div>
              <div className="text-right">
                {!p.contact && (
                  <>
                    <div className="text-2xl font-semibold">{formatPrice(p.price, p.currency)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </>
                )}
              </div>
            </div>
            {Array.isArray(p.features) && p.features.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={`${f}`}>• {f}</li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              {p.contact ? (
                <a
                  href={p.contactUrl || '/contact'}
                  className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
                  target={p.contactUrl && !p.contactUrl.startsWith('/') ? '_blank' : undefined}
                  rel={p.contactUrl && !p.contactUrl.startsWith('/') ? 'noopener noreferrer' : undefined}
                >
                  Contact Sales
                </a>
              ) : (
                <BillingSubscribeClient planId={p.id} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-2">Annual Plans</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {annual.map((p) => (
            <div key={p.id} className={`rounded-xl border p-4 ${p.popular ? 'ring-1 ring-primary' : ''} ${p.contact ? 'md:col-span-2' : ''}`}>
              {p.popular && (
                <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">Best Value</div>
              )}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-lg font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.description || '—'}</div>
                </div>
                <div className="text-right">
                  {!p.contact && (
                    <>
                      <div className="text-2xl font-semibold">{formatPrice(p.price, p.currency)}</div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </>
                  )}
                </div>
              </div>
              {Array.isArray(p.features) && p.features.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={`${f}`}>• {f}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                {p.contact ? (
                  <a
                    href={p.contactUrl || '/contact'}
                    className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
                    target={p.contactUrl && !p.contactUrl.startsWith('/') ? '_blank' : undefined}
                    rel={p.contactUrl && !p.contactUrl.startsWith('/') ? 'noopener noreferrer' : undefined}
                  >
                    Contact Sales
                  </a>
                ) : (
                  <BillingSubscribeClient planId={p.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Pricing',
  openGraph: {
    images: [{ url: '/og?title=Pricing&subtitle=Flexible%20plans%20for%20every%20team&emoji=%F0%9F%92%BC&theme=brand' }],
  },
  twitter: {
    images: [{ url: '/og?title=Pricing&subtitle=Flexible%20plans%20for%20every%20team&emoji=%F0%9F%92%BC&theme=brand' }],
  },
};
