import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { PricingPlansForm } from '@/components/admin/pricing-plans-form.client';

export default async function AdminPlansPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="p-4 text-sm text-red-500">Unauthorized: Admin only.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Pricing Plans</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage monthly and annual plans. Use badges to highlight
          popular plans or route to sales.
        </p>
      </div>
      <PricingPlansForm />
    </div>
  );
}
