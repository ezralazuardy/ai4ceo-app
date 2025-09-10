import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user as userTable } from '@/lib/db/schema';

const seeding = [
  {
    name: 'Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@ai4.ceo',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin12345',
    role: 'admin' as const,
  },
];

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL missing');

  const existing = await db.select().from(userTable).limit(1);
  if (existing.length > 0) {
    console.log('Users already present; skipping seeding.');
  } else {
    for (const s of seeding) {
      const res = await auth.api.signUpEmail({
        body: {
          email: s.email,
          password: s.password,
          name: s.name,
          role: s.role,
        },
      })
      console.log(res, `Created ${s.role} ${s.email}`);
    }
  }

  console.log('User seeding completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
