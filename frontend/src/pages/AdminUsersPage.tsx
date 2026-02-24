import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAllUsers, useAssignRole } from '../hooks/useQueries';
import { ArrowLeft, User, Shield, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Role } from '../backend';
import { Principal } from '@dfinity/principal';

export default function AdminUsersPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: users, isLoading } = useGetAllUsers();
  const assignRole = useAssignRole();

  if (!identity || (!adminLoading && !isAdmin)) return <AccessDeniedScreen />;

  const handleToggleAdmin = async (principal: Principal, currentRole: Role) => {
    const newRole = currentRole === Role.admin ? Role.user : Role.admin;
    const label = newRole === Role.admin ? 'admin' : 'user';
    if (!confirm(`Change this user's role to ${label}?`)) return;
    try {
      await assignRole.mutateAsync({ user: principal, role: newRole });
      toast.success(`User role updated to ${label}.`);
    } catch {
      toast.error('Failed to update user role.');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-border hover:border-gold hover:text-gold transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${users?.length ?? 0} registered users`}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading || adminLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="p-12 text-center">
              <User size={48} className="text-gold/30 mx-auto mb-4" />
              <p className="font-serif text-lg text-muted-foreground">No users registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">User</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">
                      Principal
                    </th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr
                      key={user.principal.toString()}
                      className="hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shrink-0">
                            <span className="font-serif font-bold text-obsidian text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-muted-foreground text-xs">{user.email}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{user.phone}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-muted-foreground text-xs font-mono">
                          {user.principal.toString().slice(0, 12)}...
                        </span>
                      </td>
                      <td className="p-4">
                        {user.role === Role.admin ? (
                          <Badge className="bg-gold/10 text-gold border-gold/30">
                            <Shield size={11} className="mr-1" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <User size={11} className="mr-1" /> User
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleToggleAdmin(user.principal, user.role)}
                            disabled={assignRole.isPending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
                              user.role === Role.admin
                                ? 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
                                : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
                            }`}
                            title={user.role === Role.admin ? 'Remove Admin' : 'Make Admin'}
                          >
                            {user.role === Role.admin ? (
                              <><ShieldOff size={13} /> Remove Admin</>
                            ) : (
                              <><Shield size={13} /> Make Admin</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
