
import { getCurrentUser } from '@/lib/auth-guard';
import { getActiveSubscriptionByUserId, getSettings } from '@/lib/db/queries';
import Link from 'next/link';
import { VoucherApplication } from '@/components/voucher-application';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { CopySubscriptionIdButton } from '@/components/copy-subscription-id-button';
import { BillingPlansSwitcher } from '@/components/billing-plans-switcher';

type Plan = {
  id: string;
  name: string;
  price: number; // in smallest currency unit or major for IDR
  currency?: string; // e.g., IDR
  description?: string;
  features?: string[];
  popular?: boolean;
  contact?: boolean; // contact sales instead of direct subscribe
};

function formatPrice(amount: number, currency?: string) {
  if (!currency || currency.toUpperCase() === 'IDR') return `IDR ${amount.toLocaleString()}`;
  return `${currency.toUpperCase()} ${amount / 100}`;
}

function formatPlanId(id: string | null | undefined) {
  if (!id) return '';
  return id
    .split(/[_-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-sm">Please sign in to manage your subscription.</p>
      </div>
    );
  }

  const [active, settings] = await Promise.all([
    getActiveSubscriptionByUserId({ userId: user.id }),
    getSettings(),
  ]);

  const pricing = (settings?.pricingPlans as any) || {};
  const monthly: Plan[] = Array.isArray(pricing.monthly)
    ? pricing.monthly
    : [
      // Core — monthly
      {
        id: 'core_monthly',
        name: 'Core',
        price: 299000,
        currency: 'IDR',
        description: 'For individuals — essential capabilities',
        features: [
          '1 user account',
          '~ 2,000 basic messages',
          '~ 200 thinker messages',
          'Advanced multi-expert system',
          'Fine-tuned for business',
          'Basic customer support',
        ],
      },
      // Growth — monthly (Popular)
      {
        id: 'growth_monthly',
        name: 'Growth',
        price: 1999000,
        currency: 'IDR',
        description: 'For startups — advanced tools and analytics',
        features: [
          'More usage*',
          '5 user accounts',
          '~ 4,000 basic messages',
          '~ 400 thinker messages',
          'Priority customer support',
        ],
        popular: true,
      },
      // Enterprise — monthly (Contact sales)
      {
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 0,
        currency: 'IDR',
        description: 'For corporations — comprehensive tools',
        features: [
          'More usage*',
          'Unlimited user accounts',
          'Unlimited messages',
          'Customized multi-expert system',
          'Customized fine-tuning support',
          'Direct customer support',
        ],
        contact: true,
      },
    ];
  const annual: Plan[] = Array.isArray(pricing.annual)
    ? pricing.annual
    : [
      // Core — annual
      {
        id: 'core_annual',
        name: 'Core (Annual)',
        price: 2870400,
        currency: 'IDR',
        description: 'For individuals — billed yearly',
        features: [
          '1 user account',
          '~ 2,000 basic messages',
          '~ 200 thinker messages',
          'Advanced multi-expert system',
          'Fine-tuned for business',
          'Basic customer support',
        ],
      },
      // Growth — annual (Popular)
      {
        id: 'growth_annual',
        name: 'Growth (Annual)',
        price: 19190400,
        currency: 'IDR',
        description: 'For startups — billed yearly',
        features: [
          'More usage*',
          '5 user accounts',
          '~ 4,000 basic messages',
          '~ 400 thinker messages',
          'Priority customer support',
        ],
        popular: true,
      },
      // Enterprise — annual (Contact sales)
      {
        id: 'enterprise_annual',
        name: 'Enterprise (Annual)',
        price: 0,
        currency: 'IDR',
        description: 'For corporations — billed yearly',
        features: [
          'More usage*',
          'Unlimited user accounts',
          'Unlimited messages',
          'Customized multi-expert system',
          'Customized fine-tuning support',
          'Direct customer support',
        ],
        contact: true,
      },
    ];

  return (
    <div className="mx-auto w-full max-w-[800px]">
      {/*<div>
        <h1 className="text-xl font-semibold">Your Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Manage your plan, billing, and vouchers.
        </p>
      </div>*/}

      {/* Current Subscription Status */}
      <div className="mx-auto max-w-3xl space-y-4 py-10">
        <div className="rounded-xl border p-4">

          <div className="flex items-center justify-between">
            <h2 className="font-medium">Current Plan</h2>
            <Badge
              variant={active?.status === 'active' ? 'default' : 'secondary'}
              className={active?.status === 'active' ? 'bg-green-600' : ''}
            >
              {active?.status ? 'Active' : active?.status === 'canceled' ? 'Canceled' : 'Expired'}
            </Badge>
          </div>
          {active ? (
            <div className="flex mt-2">
              <div className='flex justify-between w-full'>
                <p className='text-3xl font-bold '>
                  {formatPlanId(active.planId)}
                </p>
                {active.externalId && (
                  <CopySubscriptionIdButton id={active.externalId} />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className='text-2xl font-bold '>
                  Free Plan
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;re on the free plan. Upgrade to Premium for higher limits, priority support, and advanced features.
              </p>
            </div>
          )}
          {active?.currentPeriodEnd && (
            <p className='text-sm'>
              <span className="font-medium">
                {active.status === 'active' ? 'Renews' : 'Expires'}:
              </span>{' '}
              {new Date(active?.currentPeriodEnd).toLocaleString()}
            </p>
          )}
        </div>

        {/* Voucher Application */}
        <VoucherApplication refreshOnApplied />

        <BillingPlansSwitcher monthly={monthly} annual={annual} />

        {/* Support Information */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            After payment, you&apos;ll be redirected to a confirmation page.
            You can revisit this page anytime to see your updated subscription
            status.
          </p>
          <p>
            Have a voucher? Enter it above to redeem discounts or activate free
            subscriptions.
          </p>
          <p>
            Need help?{' '}
            <Link className="underline" href="/">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Billing',
  openGraph: {
    images: [{ url: '/og?title=Billing&subtitle=Manage%20your%20subscription&emoji=%F0%9F%92%B3&theme=brand' }],
  },
  twitter: {
    images: [{ url: '/og?title=Billing&subtitle=Manage%20your%20subscription&emoji=%F0%9F%92%B3&theme=brand' }],
  },
};
