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
      { id: 'core_monthly', name: 'Core', price: 299000, currency: 'IDR', description: 'For individuals — essential capabilities', features: ['Essential features', 'Reasonable usage limits'], popular: true, contact: false },
      { id: 'growth_monthly', name: 'Growth', price: 1999000, currency: 'IDR', description: 'For startups — advanced tools and analytics', features: ['Higher limits', 'Priority support'], popular: false, contact: false },
    ],
    annual: [
      { id: 'core_annual', name: 'Core (Annual)', price: 2870400, currency: 'IDR', description: 'Save with annual billing', features: ['Essential features', 'Reasonable usage limits'], popular: true, contact: false },
      { id: 'growth_annual', name: 'Growth (Annual)', price: 19190400, currency: 'IDR', description: 'Best value for teams', features: ['Higher limits', 'Priority support'], popular: false, contact: false },
    ],
  };
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
