import { db } from '@/lib/db';
import { setting } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL missing');

  const existingPricing = await db
    .select({ key: setting.key })
    .from(setting)
    .where(eq(setting.key, 'pricingPlans'));
  const hasPricing = Array.isArray(existingPricing) && existingPricing.some((r: any) => r.key === 'pricingPlans');

  // if (!hasPricing) {
  const defaultPlans = {
    monthly: [
      {
        id: 'core_monthly',
        name: 'Core',
        price: 299000,
        currency: 'IDR',
        description: 'Best for individual users who want essential capabilities.',
        features: [
          '1 user account',
          '~ 2,000 basic messages',
          '~ 200 thinker messages',
          'Advanced multi-expert system',
          'Fine-tuned for business',
          'Basic customer support',
        ],
        popular: false,
        contact: false,
        usersIncluded: 1,
      },
      {
        id: 'growth_monthly',
        name: 'Growth',
        price: 1999000,
        currency: 'IDR',
        description:
          'Tailored for expanding businesses, this tier offers advanced tools and analytics.',
        features: [
          'More usage*',
          '5 user accounts',
          '~ 4,000 basic messages',
          '~ 400 thinker messages',
          'Priority customer support',
        ],
        popular: true,
        contact: false,
        usersIncluded: 5,
      },
      {
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 0,
        currency: 'IDR',
        description: 'Designed for established businesses, providing comprehensive tools.',
        features: [
          'More usage*',
          'Unlimited user accounts',
          'Unlimited messages',
          'Customized multi-expert system',
          'Customized fine-tuning support',
          'Direct customer support',
        ],
        popular: false,
        contact: true,
        contactUrl: 'https://www.ai4.ceo/contact',
      },
    ],
    annual: [
      {
        id: 'core_annual',
        name: 'Core (Annual)',
        price: 2870400, // 20% off vs monthly * 12
        currency: 'IDR',
        description: 'Save with annual billing',
        features: [
          '1 user account',
          '~ 2,000 basic messages',
          '~ 200 thinker messages',
          'Advanced multi-expert system',
          'Fine-tuned for business',
          'Basic customer support',
        ],
        popular: false,
        contact: false,
        usersIncluded: 1,
      },
      {
        id: 'growth_annual',
        name: 'Growth (Annual)',
        price: 19190400, // 20% off vs monthly * 12
        currency: 'IDR',
        description: 'Best value for growing teams',
        features: [
          'More usage*',
          '5 user accounts',
          '~ 4,000 basic messages',
          '~ 400 thinker messages',
          'Priority customer support',
        ],
        popular: true,
        contact: false,
        usersIncluded: 5,
      },
      {
        id: 'enterprise_annual',
        name: 'Enterprise (Annual)',
        price: 0,
        currency: 'IDR',
        description: 'Customized enterprise solutions and support',
        features: [
          'More usage*',
          'Unlimited user accounts',
          'Unlimited messages',
          'Customized multi-expert system',
          'Customized fine-tuning support',
          'Direct customer support',
        ],
        popular: false,
        contact: true,
        contactUrl: 'https://www.ai4.ceo/contact',
      },
    ],
  } as const;
  await db
    .insert(setting)
    .values({ key: 'pricingPlans', value: defaultPlans as any, updatedAt: new Date() })
    .onConflictDoUpdate({ target: setting.key, set: { value: defaultPlans as any, updatedAt: new Date() } });
  console.log('Seeded default pricing plans (Core/Growth).');
  // }
  // else {
  //   console.log('Pricing plans already present; skipping.');
  // }
  //
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
