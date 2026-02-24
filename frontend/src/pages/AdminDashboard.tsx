import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAnalyticsSummary } from '../hooks/useQueries';
import { Building2, Users, Clock, MessageSquare, List, UserCheck, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummary();

  if (!identity) return <AccessDeniedScreen />;
  if (adminLoading) {
    return (
      <div className="pt-20 container mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (!isAdmin) return <AccessDeniedScreen />;

  const stats = [
    { icon: Building2, label: 'Total Properties', value: analytics ? Number(analytics.totalProperties) : '-', color: 'text-gold' },
    { icon: Users, label: 'Total Users', value: analytics ? Number(analytics.totalUsers) : '-', color: 'text-blue-500' },
    { icon: Clock, label: 'Pending Approvals', value: analytics ? Number(analytics.pendingApprovals) : '-', color: 'text-amber-500' },
    { icon: MessageSquare, label: 'Total Enquiries', value: analytics ? Number(analytics.totalEnquiries) : '-', color: 'text-green-500' },
  ];

  const adminLinks = [
    { to: '/admin/listings', icon: List, label: 'Manage Listings', desc: 'Approve, reject, and feature properties' },
    { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View and manage registered users' },
    { to: '/admin/approvals', icon: UserCheck, label: 'User Approvals', desc: 'Approve or reject user access requests' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <LayoutDashboard size={18} className="text-obsidian" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your real estate platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={color} />
              </div>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="font-serif text-3xl font-bold text-foreground">{value}</p>
              )}
              <p className="text-muted-foreground text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to as '/admin/listings' | '/admin/users' | '/admin/approvals'}
              className="bg-card rounded-xl border border-border p-6 hover:border-gold/40 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{label}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-gold transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
