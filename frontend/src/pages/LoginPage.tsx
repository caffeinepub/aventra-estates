import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, User, Mail, Phone } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile !== null) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, navigate]);

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!profileForm.name.trim()) errs.name = 'Name is required';
    if (!profileForm.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) errs.email = 'Enter a valid email';
    if (!profileForm.phone.trim()) errs.phone = 'Phone is required';
    return errs;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    try {
      await saveProfile.mutateAsync(profileForm);
      toast.success('Profile saved! Welcome to Aventra Estates.');
      navigate({ to: '/dashboard' });
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold text-gold">Aventra</span>
          <span className="font-serif text-3xl font-light text-foreground"> Estates</span>
          <p className="text-muted-foreground text-sm mt-2">Your Trusted Property Partner</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 luxury-shadow">
          {!isAuthenticated ? (
            /* Login Screen */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
                <LogIn size={28} className="text-obsidian" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Sign in to access your dashboard, post properties, and manage your listings.
              </p>
              <button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full gold-gradient text-obsidian font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {isLoggingIn ? (
                  <span className="animate-pulse">Connecting to Internet Identity...</span>
                ) : (
                  <><LogIn size={18} /> Sign In with Internet Identity</>
                )}
              </button>
              <p className="text-muted-foreground text-xs mt-4">
                Secure, decentralized authentication powered by the Internet Computer.
              </p>
            </div>
          ) : showProfileSetup ? (
            /* Profile Setup */
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                  <User size={24} className="text-obsidian" />
                </div>
                <h1 className="font-serif text-xl font-bold text-foreground mb-1">Complete Your Profile</h1>
                <p className="text-muted-foreground text-sm">Tell us a bit about yourself to get started.</p>
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="profile-name" className="text-sm flex items-center gap-1.5 mb-1.5">
                    <User size={13} className="text-gold" /> Full Name *
                  </Label>
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your full name"
                    className={profileErrors.name ? 'border-destructive' : ''}
                  />
                  {profileErrors.name && <p className="text-destructive text-xs mt-1">{profileErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="profile-email" className="text-sm flex items-center gap-1.5 mb-1.5">
                    <Mail size={13} className="text-gold" /> Email Address *
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className={profileErrors.email ? 'border-destructive' : ''}
                  />
                  {profileErrors.email && <p className="text-destructive text-xs mt-1">{profileErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="profile-phone" className="text-sm flex items-center gap-1.5 mb-1.5">
                    <Phone size={13} className="text-gold" /> Phone Number *
                  </Label>
                  <Input
                    id="profile-phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={profileErrors.phone ? 'border-destructive' : ''}
                  />
                  {profileErrors.phone && <p className="text-destructive text-xs mt-1">{profileErrors.phone}</p>}
                </div>
                <button
                  type="submit"
                  disabled={saveProfile.isPending}
                  className="w-full gold-gradient text-obsidian font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm mt-2"
                >
                  {saveProfile.isPending ? 'Saving...' : 'Save Profile & Continue'}
                </button>
              </form>
            </div>
          ) : (
            /* Loading state */
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading your profile...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
