import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Menu, X, Heart, LayoutDashboard, LogIn, LogOut, Shield, Home, Building2, PlusCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export default function Navigation() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const { data: isAdmin } = useIsCallerAdmin();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const isHomePage = currentPath === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Properties', icon: Building2 },
    { to: '/post-property', label: 'Post Property', icon: PlusCircle },
  ];

  const isTransparent = isHomePage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-obsidian/95 backdrop-blur-md shadow-lg'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/generated/aventra-logo.dim_320x120.png"
              alt="Aventra Estates"
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2">
              <span className="font-serif text-xl font-bold text-gold">Aventra</span>
              <span className="font-serif text-xl font-light text-ivory">Estates</span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-serif text-lg font-bold text-gold">Aventra</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPath === to
                    ? 'text-gold'
                    : 'text-ivory/80 hover:text-gold'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPath === '/dashboard' ? 'text-gold' : 'text-ivory/80 hover:text-gold'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wishlist"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPath === '/wishlist' ? 'text-gold' : 'text-ivory/80 hover:text-gold'
                  }`}
                >
                  Wishlist
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPath.startsWith('/admin') ? 'text-gold' : 'text-ivory/80 hover:text-gold'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isAuthenticated
                  ? 'border border-gold/50 text-gold hover:bg-gold/10'
                  : 'gold-gradient text-obsidian hover:opacity-90 shadow-gold'
              } disabled:opacity-50`}
            >
              {isLoggingIn ? (
                <span className="animate-pulse">Connecting...</span>
              ) : isAuthenticated ? (
                <><LogOut size={15} /> Logout</>
              ) : (
                <><LogIn size={15} /> Login</>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-ivory hover:text-gold transition-colors">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-obsidian border-gold/20 w-72">
              <div className="flex flex-col h-full pt-6">
                <div className="mb-8">
                  <span className="font-serif text-2xl font-bold text-gold">Aventra</span>
                  <span className="font-serif text-2xl font-light text-ivory"> Estates</span>
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        to={to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          currentPath === to
                            ? 'bg-gold/10 text-gold'
                            : 'text-ivory/80 hover:bg-gold/5 hover:text-gold'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                  {isAuthenticated && (
                    <>
                      <SheetClose asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-ivory/80 hover:bg-gold/5 hover:text-gold transition-colors"
                        >
                          <LayoutDashboard size={18} />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-ivory/80 hover:bg-gold/5 hover:text-gold transition-colors"
                        >
                          <Heart size={18} />
                          Wishlist
                        </Link>
                      </SheetClose>
                      {isAdmin && (
                        <SheetClose asChild>
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-ivory/80 hover:bg-gold/5 hover:text-gold transition-colors"
                          >
                            <Shield size={18} />
                            Admin Panel
                          </Link>
                        </SheetClose>
                      )}
                    </>
                  )}
                </nav>
                <div className="pb-6">
                  <button
                    onClick={handleAuth}
                    disabled={isLoggingIn}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all ${
                      isAuthenticated
                        ? 'border border-gold/50 text-gold hover:bg-gold/10'
                        : 'gold-gradient text-obsidian'
                    } disabled:opacity-50`}
                  >
                    {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
