'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { BotIcon } from './icons'
import { Settings as SettingsIcon, Shield } from 'lucide-react'

function NavItem({ href, active, icon, label }: { href: string; active?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={[
        'flex flex-col items-center justify-center gap-1 rounded-md px-2 py-3 text-xs',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40',
      ].join(' ')}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background border">
        {icon}
      </div>
      <span className="leading-none text-center">{label}</span>
    </Link>
  )
}

export default function MainNav() {
  const pathname = usePathname()
  const { data } = authClient.useSession()
  const role = (data?.user as any)?.role as 'admin' | 'user' | undefined

  const isChat = pathname === '/' || pathname?.startsWith('/(chat)') || pathname?.startsWith('/chat')
  const isNews = pathname?.startsWith('/news')
  const isSettings = pathname?.startsWith('/settings')
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <aside
      aria-label="Main navigation"
      className="fixed left-0 top-0 z-20 flex h-svh w-20 flex-col items-stretch border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="flex items-center justify-center h-[79px] border-b">
        <Link href="/" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent">
          <Image src="/images/logo-4.svg" alt="AI4CEO" width={32} height={32} className="h-8 w-auto" />
          <span className="sr-only">AI4CEO</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto py-2 space-y-1">
        <NavItem href="/" active={isChat} icon={<BotIcon />} label="Chat" />
        {/*<NavItem href="/news" active={isNews} icon={<Newspaper size={18} />} label="News" />*/}
        <NavItem href="/settings/profile" active={isSettings} icon={<SettingsIcon size={18} />} label="Settings" />
        {role === 'admin' && (
          <NavItem href="/admin" active={isAdmin} icon={<Shield size={18} />} label="Admin" />
        )}
      </nav>

      <div className="h-4" />
    </aside>
  )
}
