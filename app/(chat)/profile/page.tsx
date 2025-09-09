'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

type Profile = {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
  timezone?: string | null;
  locale?: string | null;
  role?: 'user' | 'admin';
  botTraits?: string[];
  onboarded?: boolean;
};

export default function ProfilePage() {
  const { mutate } = useSWRConfig();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState<string[]>([]);

  const displayName = useMemo(() => {
    if (!profile) return '';
    return profile.name?.trim() || profile.email || 'User';
  }, [profile]);

  const avatarSrc = useMemo(() => {
    if (profile?.image?.trim()) return profile.image.trim();
    const seed = encodeURIComponent(profile?.email || profile?.id || 'user');
    return `https://avatar.vercel.sh/${seed}`;
  }, [profile?.email, profile?.id, profile?.image]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to load profile');
      }
      setProfile(data as Profile);
      if (Array.isArray((data as any).botTraits)) setTraits((data as any).botTraits);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;
    setTraits(profile.botTraits || []);
  }, [profile]);


  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {/*<div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View and update your account details. Changes are saved per user.
        </p>
      </div>*/}

      <div className="rounded-xl border">
        {loading && (
          <div className="p-4 pt-0 sm:p-4 sm:pt-0">
            <div className="grid gap-3">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-72 bg-muted rounded animate-pulse" />
              <div className="h-20 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 p-3 sm:p-4 rounded-xl border">
        <div className='flex flex-col'>
          <div className="font-medium font-serif">Preferred Bot Traits</div>
          <div className="text-xs text-muted-foreground">Pick the assistant traits you prefer. These influence tone and style.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: 'friendly', label: 'Friendly' },
            { id: 'concise', label: 'Concise' },
            { id: 'curious', label: 'Curious' },
            { id: 'empathetic', label: 'Empathetic' },
            { id: 'direct', label: 'Direct' },
            { id: 'supportive', label: 'Supportive' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`text-left rounded border p-3 hover:bg-accent ${traits.includes(t.id) ? 'border-primary' : 'border-muted'
                }`}
              onClick={() =>
                setTraits((prev) =>
                  prev.includes(t.id)
                    ? prev.filter((x) => x !== t.id)
                    : [...prev, t.id],
                )
              }
            >
              <div className="font-medium">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* App Tour controls */}
      <div className="rounded-xl border">
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <div>
            <h2 className="font-medium">App Tour</h2>
            <p className="text-sm text-muted-foreground">Restart the guided tour if you want to see it again.</p>
          </div>

          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch('/api/tour', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tour: false }),
                });
                if (!res.ok) throw new Error('Failed to reset tour');
                toast.success('Tour reset. It will show on home.');
              } catch (e: any) {
                toast.error(e?.message || 'Failed to reset tour');
              }
            }}
          >
            Restart Tour
          </Button>
        </div>
      </div>
    </div>
  );
}
