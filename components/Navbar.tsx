'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link } from '../i18n/routing'
import { Button } from '../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Menu, X, User, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [dashboardPath, setDashboardPath] = useState('')
  const [supportPath, setSupportPath] = useState('')
  const [profilePath, setProfilePath] = useState('')
  const pathname = usePathname()
  const t = useTranslations('Navbar')
  const locale = useLocale()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getBaseUrl = () =>
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://newmtaxproject-production.up.railway.app/'

  useEffect(() => {
    if (session?.user) {
      const role = session.user.role
      setDashboardPath(role === 'admin' ? '/dashboard/admin' : `/dashboard/${session.user.id}`)
      setSupportPath(role === 'admin' ? '/support/admin' : `/support/${session.user.id}`)
      setProfilePath('/profile')

      const expires_session = new Date(session.expires).getTime()
      if (expires_session < Date.now()) {
        signOut({ callbackUrl: `${getBaseUrl()}/` })
      }
    }
  }, [session])

  const getHref = (url: string) => (url.startsWith('#') && pathname !== '/' ? `/${url}` : url)

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const targetId = e.currentTarget.getAttribute('href')
    if (pathname === '/' && targetId?.startsWith('#')) {
      e.preventDefault()
      document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'th' : 'en'
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`))
  }

  const links = [
    { id: 1, title: t('home'), url: '/' },
    { id: 2, title: t('about'), url: '#about' },
    { id: 3, title: t('services'), url: '#service' },
    { id: 4, title: t('knowledge'), url: '/blog' },
    { id: 5, title: t('contact'), url: '#contact' },
    { id: 6, title: t('appointment'), url: '/appointment' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">M</span>
                <span className="text-red-600">tax</span>
              </span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {links.map((link) => (
              <Link
                key={link.id}
                href={getHref(link.url)}
                onClick={smoothScroll}
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out border-transparent text-gray-800 hover:border-blue-500 hover:text-blue-600"
              >
                {link.title}
              </Link>
            ))}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button onClick={toggleLanguage} variant="outline" size="sm" className="mr-4">
              {locale === 'en' ? 'EN' : 'TH'}
            </Button>
            {status === 'authenticated' && session.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{session.user.company}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                    <Link href={profilePath} className="w-full">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                    <Link href={dashboardPath} className="w-full">{t('dashboard')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                    <Link href={supportPath} className="w-full">{t('support')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200" onClick={() => signOut({ callbackUrl: `${getBaseUrl()}/` })}>
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button>{t('login')}</Button>
              </Link>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.id}
              href={getHref(link.url)}
              onClick={(e) => {
                smoothScroll(e)
                setIsMenuOpen(false)
              }}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ease-in-out border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
            >
              {link.title}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4 space-x-3">
            <Button onClick={toggleLanguage} variant="outline" size="sm">
              {locale === 'en' ? 'EN' : 'TH'}
            </Button>
            {status === 'authenticated' && session.user ? (
              <div className="flex-shrink-0">
                <span className="inline-flex rounded-md">
                  <Button
                    onClick={() => setIsMenuOpen(false)}
                    variant="ghost"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-base font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <User className="h-5 w-5 mr-2" />
                    {session.user.company}
                  </Button>
                </span>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button>{t('login')}</Button>
              </Link>
            )}
          </div>
          {status === 'authenticated' && session.user && (
            <div className="mt-3 space-y-1">
              <Link
                href={dashboardPath}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                {t('dashboard')}
              </Link>
              <Link
                href={supportPath}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                {t('support')}
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut({ callbackUrl: `${getBaseUrl()}/` })
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}