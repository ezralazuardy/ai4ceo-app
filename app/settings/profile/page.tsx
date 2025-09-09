"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

export default function SettingsProfilePage() {
  const { mutate } = useSWRConfig();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('');
  const [locale, setLocale] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [traits, setTraits] = useState<string[]>([]);
  const TRAITS = [
    { id: 'friendly', label: 'Friendly', emoji: '😊', hint: 'Warm and welcoming' },
    { id: 'concise', label: 'Concise', emoji: '✂️', hint: 'Short and to the point' },
    { id: 'curious', label: 'Curious', emoji: '🔍', hint: 'Asks clarifying questions' },
    { id: 'empathetic', label: 'Empathetic', emoji: '💖', hint: 'Supportive and patient' },
    { id: 'direct', label: 'Direct', emoji: '➡️', hint: 'Clear and straightforward' },
    { id: 'supportive', label: 'Supportive', emoji: '🤝', hint: 'Encouraging and helpful' },
  ] as const;

  const displayName = useMemo(() => {
    if (!profile) return '';
    return profile.name?.trim() || profile.email || 'User';
  }, [profile]);

  const avatarSrc = useMemo(() => {
    if (filePreview) return filePreview;
    if (imageUrl?.trim()) return imageUrl.trim();
    if (profile?.image?.trim()) return profile.image.trim();
    const seed = encodeURIComponent(profile?.email || profile?.id || 'user');
    return `https://avatar.vercel.sh/${seed}`;
  }, [filePreview, imageUrl, profile?.email, profile?.id, profile?.image]);

  const arraysEqual = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) return false;
    const as = [...a].sort();
    const bs = [...b].sort();
    for (let i = 0; i < as.length; i++) if (as[i] !== bs[i]) return false;
    return true;
  };

  const isDirty = useMemo(() => {
    if (!profile) return false;
    if (file) return true; // new file always indicates change
    if ((name || '') !== (profile.name || '')) return true;
    if ((bio || '') !== (profile.bio || '')) return true;
    if ((timezone || '') !== (profile.timezone || '')) return true;
    if ((locale || '') !== (profile.locale || '')) return true;
    if ((imageUrl ?? '') !== (profile.image || '')) return true;
    if (!arraysEqual(traits || [], profile.botTraits || [])) return true;
    return false;
  }, [profile, file, name, bio, timezone, locale, imageUrl, traits]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to load profile');
      }
      const p = data as Profile;
      setProfile(p);
      setName(p.name || '');
      setBio(p.bio || '');
      setTimezone(p.timezone || '');
      setLocale(p.locale || '');
      setImageUrl(p.image || '');
      setTraits(p.botTraits || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (f: File | null) => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      let updated: Profile | null = null;

      if (file) {
        const form = new FormData();
        if (name.trim().length > 0) form.set('name', name.trim());
        else form.set('name', '');
        form.set('bio', bio || '');
        form.set('timezone', timezone || '');
        form.set('locale', locale || '');
        form.set('image', file, file.name);

        const res = await fetch('/api/profile', { method: 'PATCH', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update profile');
        updated = data?.profile as Profile;
      } else {
        const payload: Record<string, any> = {
          name: name || '',
          bio: bio || '',
          timezone: timezone || '',
          locale: locale || '',
          imageUrl: imageUrl ?? '',
          botTraits: traits,
        };
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update profile');
        updated = data?.profile as Profile;
      }

      if (updated) {
        const merged = { ...(updated as any), botTraits: traits } as Profile;
        setProfile(merged);
        mutate('/api/profile', merged, { revalidate: false });
        toast.success('Profile updated');
      } else {
        toast.success('Saved');
      }

      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border">
        <div className="p-3 sm:p-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {/*<div className="relative size-20">
              <UiAvatar className="size-20">
                <UiAvatarImage asChild>
                  <Image
                    src={avatarSrc}
                    alt={displayName || 'User avatar'}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                    unoptimized={avatarSrc.startsWith('blob:')}
                  />
                </UiAvatarImage>
                <UiAvatarFallback className="text-sm">
                  {(displayName || 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()}
                </UiAvatarFallback>
              </UiAvatar>
            </div>*/}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                {/*<div className="min-w-0">
                  <div className="text-lg font-medium truncate">{displayName || 'Profile'}</div>
                  {profile?.email && (
                    <div className="text-sm text-muted-foreground truncate">{profile.email}</div>
                  )}
                </div>*/}

                <div>
                  <div className="font-medium font-serif">Profile</div>
                  <div className="text-xs text-muted-foreground">
                    Update your personal information and profile details.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 mt-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your display name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="A short description about you"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" placeholder="e.g. America/Los_Angeles" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="locale">Locale</Label>
                    <Input id="locale" placeholder="e.g. en-US" value={locale} onChange={(e) => setLocale(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-3">
                    {/*<div className="relative size-16 shrink-0">
                      <UiAvatar className="size-16">
                        <UiAvatarImage asChild>
                          <Image
                            src={avatarSrc}
                            alt="Avatar preview"
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                            unoptimized={avatarSrc.startsWith('blob:')}
                          />
                        </UiAvatarImage>
                        <UiAvatarFallback>AV</UiAvatarFallback>
                      </UiAvatar>
                    </div>*/}
                    <div className="flex-1 grid gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          handleFileChange(f);
                        }}
                      />
                      {/*<Input
                        placeholder="Or paste image URL (used if no file selected)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={!!file}
                      />*/}
                      {/*<div className="text-xs text-muted-foreground">
                        Tip: If you select a file, it will be uploaded and used as your avatar. If no file is selected, the image URL will be saved instead.
                      </div>*/}
                    </div>
                    {file && (
                      <Button type="button" variant="ghost" className="h-8 px-2" onClick={() => handleFileChange(null)}>
                        Remove file
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

      <div className="grid gap-3 p-3 sm:p-4 rounded-xl border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium font-serif">Preferred Bot Traits</div>
            <div className="text-xs text-muted-foreground">Tune the assistant’s tone and style. Pick all that apply.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTraits([])}
              disabled={traits.length === 0}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setTraits(TRAITS.map((t) => t.id))}
              disabled={traits.length === TRAITS.length}
            >
              Select all
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TRAITS.map((t) => {
            const selected = traits.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors hover:bg-accent ${selected ? 'border-primary text-primary bg-primary/10' : 'border-muted text-foreground'
                  }`}
                onClick={() =>
                  setTraits((prev) => (prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]))
                }
                title={t.hint}
              >
                <span className="text-base leading-none">{t.emoji}</span>
                <span className="font-medium leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          Your preference helps tailor responses. You can combine multiple traits.
        </div>

        {/*{isDirty && (
          <div className="pt-1">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        )}*/}
      </div>

      {isDirty && (
        <Button onClick={handleSave} disabled={saving} className="h-8 px-3">
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      )}
    </div>
  );
}
