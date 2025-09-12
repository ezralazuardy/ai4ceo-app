'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingSubscribeClient } from '@/components/billing-subscribe.client';

type Plan = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  contact?: boolean;
  contactUrl?: string;
};

function formatPrice(amount: number, currency?: string) {
  if (!currency || currency.toUpperCase() === 'IDR') return `IDR ${amount.toLocaleString()}`;
  return `${currency.toUpperCase()} ${amount / 100}`;
}

export function BillingPlansSwitcher({
  monthly,
  annual,
  defaultTab = 'monthly',
}: { monthly: Plan[]; annual: Plan[]; defaultTab?: 'monthly' | 'annual' }) {
  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="space-y-1">
        <h2 className="font-medium">Available Plans</h2>
        <p className="text-sm text-muted-foreground">Choose monthly or annual billing. You can switch plans anytime.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="grid md:grid-cols-2 gap-4">
            {monthly.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border p-4 ${p.popular ? 'ring-1 ring-primary' : ''} ${p.contact ? 'md:col-span-2' : ''}`}
              >
                {p.popular && (
                  <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">Most Popular</div>
                )}
                <div>
                  <div className="text-lg font-medium font-serif">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.description || '—'}</div>
                </div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={`${f}`}>• {f}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {!p.contact && (
                    <>
                      <div className="text-2xl font-semibold">{formatPrice(p.price, p.currency)}</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </>
                  )}
                  <div>
                    {p.contact ? (
                      <a href={p.contactUrl || '/contact'} className="inline-block" target={p.contactUrl && !p.contactUrl.startsWith('/') ? '_blank' : undefined} rel={p.contactUrl && !p.contactUrl.startsWith('/') ? 'noopener noreferrer' : undefined}>
                        <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm">Contact Sales</span>
                      </a>
                    ) : (
                      <BillingSubscribeClient planId={p.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annual">
          <div className="grid md:grid-cols-2 gap-4">
            {annual.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border p-4 ${p.popular ? 'ring-1 ring-primary' : ''} ${p.contact ? 'md:col-span-2' : ''}`}
              >
                {p.popular && (
                  <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">Best Value</div>
                )}
                <div>
                  <div className="text-lg font-medium font-serif">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.description || '—'}</div>
                </div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={`${f}`}>• {f}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {!p.contact && (
                    <>
                      <div className="text-2xl font-semibold">{formatPrice(p.price, p.currency)}</div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </>
                  )}
                  <div>
                    {p.contact ? (
                      <a href={p.contactUrl || '/contact'} className="inline-block" target={p.contactUrl && !p.contactUrl.startsWith('/') ? '_blank' : undefined} rel={p.contactUrl && !p.contactUrl.startsWith('/') ? 'noopener noreferrer' : undefined}>
                        <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm">Contact Sales</span>
                      </a>
                    ) : (
                      <BillingSubscribeClient planId={p.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
