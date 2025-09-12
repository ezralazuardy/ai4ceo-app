'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { IconPlus, IconStar, IconTrash, IconMail } from '@tabler/icons-react';

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

type PricingPlans = { monthly: Plan[]; annual: Plan[] };

function getCurrencySymbol(code?: string) {
  switch ((code || 'IDR').toUpperCase()) {
    case 'IDR':
      return 'Rp';
    case 'USD':
      return '$';
    case 'SGD':
      return 'S$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'AUD':
      return 'A$';
    case 'CAD':
      return 'C$';
    case 'INR':
      return '₹';
    case 'CNY':
      return '¥';
    case 'HKD':
      return 'HK$';
    default:
      return (code || '').toUpperCase();
  }
}

const PlanSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().int().nonnegative('Price must be >= 0'),
  currency: z.string().optional().default('IDR'),
  description: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  popular: z.boolean().optional().default(false),
  contact: z.boolean().optional().default(false),
  contactUrl: z.string().optional(),
});
const PlanSchemaWithRules = PlanSchema.superRefine((data, ctx) => {
  if (data.contact) {
    if (!data.contactUrl || !data.contactUrl.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactUrl'],
        message:
          'Contact destination is required when Contact sales is enabled',
      });
    }
  }
});
const PricingPlansSchema = z.object({
  monthly: z.array(PlanSchema),
  annual: z.array(PlanSchema),
});

function emptyPlan(): Plan {
  return {
    id: '',
    name: '',
    price: 0,
    currency: 'IDR',
    description: '',
    features: [],
    popular: false,
    contact: false,
    contactUrl: '',
  };
}

function PlansEditor({
  title,
  plans,
  onChange,
  errors,
}: {
  title: string;
  plans: Plan[];
  onChange: (next: Plan[]) => void;
  errors?: Record<number, Record<string, string>>;
}) {
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            Manage {title.toLowerCase()} pricing plans.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...(plans || []), emptyPlan()])}
          className="gap-1"
        >
          <IconPlus size={16} /> Add Plan
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {plans && plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(plans || []).map((p, idx) => {
              const err = errors?.[idx] || {};
              const displayName = p.name?.trim() || 'New Plan';
              return (
                <Card key={idx} className="border bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 justify-between w-full">
                        <CardTitle className="text-sm">{displayName}</CardTitle>
                        {!!p.popular && (
                          <Badge
                            className="gap-1 py-0.5"
                            title="Marked as popular"
                          >
                            <IconStar size={14} /> Popular
                          </Badge>
                        )}
                        {!!p.contact && (
                          <Badge
                            variant="secondary"
                            className="gap-1 py-0.5"
                            title="Contact sales plan"
                          >
                            <IconMail size={14} /> Contact
                          </Badge>
                        )}
                      </div>
                      {/*<div className="text-xs text-muted-foreground">
                        {p.id ? `ID: ${p.id}` : 'No ID'}
                      </div>*/}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`id-${title}-${idx}`}>ID</Label>
                        <Input
                          id={`id-${title}-${idx}`}
                          value={p.id}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], id: e.target.value };
                            onChange(next);
                          }}
                        />
                        {err.id && (
                          <p className="text-xs text-red-600 mt-1">{err.id}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`name-${title}-${idx}`}>Name</Label>
                        <Input
                          id={`name-${title}-${idx}`}
                          value={p.name}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], name: e.target.value };
                            onChange(next);
                          }}
                        />
                        {err.name && (
                          <p className="text-xs text-red-600 mt-1">
                            {err.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select
                          value={p.currency || 'IDR'}
                          onValueChange={(v) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], currency: v };
                            onChange(next);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IDR">IDR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="SGD">SGD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="CNY">CNY</SelectItem>
                            <SelectItem value="HKD">HKD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`price-${title}-${idx}`}>Price</Label>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-9 items-center rounded-md border px-2 text-sm bg-muted">
                            {getCurrencySymbol(p.currency)}
                          </span>
                          <Input
                            id={`price-${title}-${idx}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="flex-1"
                            value={(p.price ?? 0).toLocaleString('en-US')}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              const num = Number(raw || 0);
                              const next = [...plans];
                              next[idx] = { ...next[idx], price: num };
                              onChange(next);
                            }}
                          />
                        </div>
                        {err.price && (
                          <p className="text-xs text-red-600 mt-1">
                            {err.price}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`desc-${title}-${idx}`}>
                        Description
                      </Label>
                      <Input
                        id={`desc-${title}-${idx}`}
                        placeholder="Short marketing blurb"
                        value={p.description ?? ''}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = {
                            ...next[idx],
                            description: e.target.value,
                          };
                          onChange(next);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`features-${title}-${idx}`}>
                        Features (one per line)
                      </Label>
                      <Textarea
                        id={`features-${title}-${idx}`}
                        className="font-mono"
                        rows={4}
                        placeholder={'e.g.\nHigher limits\nPriority support'}
                        value={(p.features || []).join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const next = [...plans];
                          next[idx] = { ...next[idx], features: lines };
                          onChange(next);
                        }}
                      />
                    </div>

                    {p.contact && (
                      <div className="flex-1 min-w-[240px]">
                        <Label htmlFor={`contact-${title}-${idx}`}>
                          Contact destination (URL or mailto:)
                        </Label>
                        <Input
                          id={`contact-${title}-${idx}`}
                          placeholder="/contact-sales or mailto:sales@example.com"
                          value={p.contactUrl ?? ''}
                          onChange={(e) => {
                            const next = [...plans];
                            next[idx] = {
                              ...next[idx],
                              contactUrl: e.target.value,
                            };
                            onChange(next);
                          }}
                        />
                        {err.contactUrl && (
                          <p className="text-xs text-red-600 mt-1">
                            {err.contactUrl}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <Switch
                          checked={!!p.popular}
                          onCheckedChange={(checked) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], popular: !!checked };
                            onChange(next);
                          }}
                        />
                        <span className='text-xs'>Popular</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <Switch
                          checked={!!p.contact}
                          onCheckedChange={(checked) => {
                            const next = [...plans];
                            next[idx] = { ...next[idx], contact: !!checked };
                            onChange(next);
                          }}
                        />
                        <span className='text-xs'>Contact sales</span>
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50 gap-1"
                      onClick={() => {
                        const next = plans.filter((_, i) => i !== idx);
                        onChange(next);
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No plans yet.
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onChange([...(plans || []), emptyPlan()])}
              >
                <IconPlus size={16} /> Add your first plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PricingPlansForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const [data, setData] = useState<PricingPlans>({ monthly: [], annual: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/admin/api/settings');
        const json = await res.json();
        const pricing = (json?.pricingPlans as PricingPlans) || {
          monthly: [],
          annual: [],
        };
        if (mounted)
          setData({
            monthly: pricing.monthly || [],
            annual: pricing.annual || [],
          });
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const validate = (): { ok: boolean; parsed?: PricingPlans } => {
    setFieldErrors({});
    setError(null);
    const res = PricingPlansSchema.superRefine((d, ctx) => {
      d.monthly?.forEach((p, i) => {
        const r = PlanSchemaWithRules.safeParse(p);
        if (!r.success) {
          r.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ['monthly', i, ...(issue.path || [])] as any,
            });
          });
        }
      });
      d.annual?.forEach((p, i) => {
        const r = PlanSchemaWithRules.safeParse(p);
        if (!r.success) {
          r.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ['annual', i, ...(issue.path || [])] as any,
            });
          });
        }
      });
    }).safeParse(data);
    if (!res.success) {
      const fieldErrs: Record<string, any> = { monthly: {}, annual: {} };
      for (const issue of res.error.issues) {
        const [bucket, index, key] = issue.path as any[];
        if (bucket === 'monthly' || bucket === 'annual') {
          const idx = Number(index);
          if (!fieldErrs[bucket][idx]) fieldErrs[bucket][idx] = {};
          fieldErrs[bucket][idx][key as string] = issue.message;
        }
      }
      setFieldErrors(fieldErrs);
      setError('Please fix the highlighted fields.');
      return { ok: false };
    }
    return { ok: true, parsed: res.data };
  };

  const handleSave = async () => {
    const v = validate();
    if (!v.ok || !v.parsed) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.set('key', 'pricingPlans');
      fd.set('value', JSON.stringify(v.parsed));
      const res = await fetch('/admin/api/settings', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed');
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 p-2 text-sm">
          {error}
        </div>
      )}

      <PlansEditor
        title="Monthly"
        plans={data.monthly}
        onChange={(next) => setData((d) => ({ ...d, monthly: next }))}
        errors={fieldErrors.monthly}
      />

      <PlansEditor
        title="Annual"
        plans={data.annual}
        onChange={(next) => setData((d) => ({ ...d, annual: next }))}
        errors={fieldErrors.annual}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={saving}
        >
          Reset
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
