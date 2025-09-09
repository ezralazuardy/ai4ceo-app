'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { IconCopy, IconCopyCheckFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface CopySubscriptionIdButtonProps {
  /**
   * The subscription (external) identifier to copy.
   */
  id: string;
  /**
   * Optional className applied to the root button.
   */
  className?: string;
  /**
   * Text shown before copy.
   * @default "Copy Subscription ID"
   */
  copyLabel?: string;
  /**
   * Text shown after successful copy (briefly).
   * @default "Copied!"
   */
  copiedLabel?: string;
  /**
   * Duration (ms) to show the copied state.
   * @default 2000
   */
  copiedStateDuration?: number;
  /**
   * Whether to include the leading icon.
   * @default true
   */
  showIcon?: boolean;
  /**
   * Callback fired after a successful copy.
   */
  onCopied?: (id: string) => void;
  /**
   * Button variant passthrough. Defaults to outline to stay unobtrusive.
   */
  variant?: React.ComponentProps<typeof Button>['variant'];
  /**
   * Button size passthrough.
   */
  size?: React.ComponentProps<typeof Button>['size'];
}

/**
 * Client component to copy a subscription ID to the clipboard.
 * Keeps all client logic isolated so that server components can remain pure.
 */
export function CopySubscriptionIdButton({
  id,
  className,
  copyLabel = 'Copy Subscription ID',
  copiedLabel = 'Copied!',
  copiedStateDuration = 2000,
  showIcon = true,
  onCopied,
  variant = 'outline',
  size = 'sm',
}: CopySubscriptionIdButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!id) return;

    const runFallback = () => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = id;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const ok = runFallback();
        if (!ok) throw new Error('Clipboard unsupported');
      }
      setCopied(true);
      onCopied?.(id);
      window.setTimeout(() => setCopied(false), copiedStateDuration);
    } catch (err) {
      // Intentionally silent (avoid noisy UI). Could integrate toast if desired.
      console.error('Failed to copy subscription id', err);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        type="button"
        onClick={handleCopy}
        variant={variant}
        size={size}
        className={cn('text-xs', className)}
        aria-live="polite"
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <span className="inline-flex items-center gap-2">
            {showIcon && <IconCopyCheckFilled />}
            {copiedLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            {showIcon && <IconCopy />}
            {copyLabel}
          </span>
        )}
      </Button>
      {/* Visually hidden live region for screen readers to announce copy success */}
      <span
        aria-live="assertive"
        className="sr-only"
      >
        {copied ? `${copiedLabel}.` : ''}
      </span>
    </div>
  );
}

export default CopySubscriptionIdButton;
