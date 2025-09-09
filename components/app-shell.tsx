'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import MainNav from './main-nav'

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
])

export interface AppShellProps {
  children: ReactNode
  /**
   * The padding-left class applied to the content wrapper when the nav is visible.
   * Defaults to 'pl-20' to match the width of MainNav.
   */
  navPaddingClassName?: string
}

/**
 * AppShell wraps pages with the persistent MainNav except on authentication pages.
 * Replace usage of <MainNav /> + manual padding in root layout with <AppShell>.
 *
 * Example:
 *   <AppShell>
 *     {children}
 *   </AppShell>
 */
export default function AppShell({ children, navPaddingClassName = 'pl-20' }: AppShellProps) {
  const pathname = usePathname()
  const isAuth = pathname ? AUTH_PATHS.has(pathname) : false

  return (
    <div className="min-h-screen">
      {!isAuth && <MainNav />}
      <div className={!isAuth ? navPaddingClassName : undefined}>
        {children}
      </div>
    </div>
  )
}
