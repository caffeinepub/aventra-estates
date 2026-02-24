import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useListApprovals, useSetApproval } from '../hooks/useQueries';
import { ArrowLeft, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export default function AdminApprovalsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();

  if (!identity || (!adminLoading && !isAdmin)) return <AccessDeniedScreen />;

  const handleApprove = async (principal: Principal) => {
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.approved });
      toast.success('User approved successfully.');
    } catch {
      toast.error('Failed to approve user.');
    }
  };

  const handleReject = async (principal: Principal) => {
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.rejected });
      toast.success('User rejected.');
    } catch {
      toast.error('Failed to reject user.');
    }
  };

  const pendingCount = approvals?.filter((a) => a.status === ApprovalStatus.pending).length ?? 0;

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
            <h1 className="font-serif text-2xl font-bold text-foreground">User Approvals</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading || adminLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck size={48} className="text-gold/30 mx-auto mb-4" />
              <p className="font-serif text-lg text-muted-foreground mb-1">No approval requests</p>
              <p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Principal ID</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {approvals.map((approval) => (
                    <tr
                      key={approval.principal.toString()}
                      className="hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <UserCheck size={16} className="text-muted-foreground" />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {approval.principal.toString().slice(0, 20)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {approval.status === ApprovalStatus.pending && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Clock size={11} className="mr-1" /> Pending
                          </Badge>
                        )}
                        {approval.status === ApprovalStatus.approved && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle size={11} className="mr-1" /> Approved
                          </Badge>
                        )}
                        {approval.status === ApprovalStatus.rejected && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle size={11} className="mr-1" /> Rejected
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {approval.status !== ApprovalStatus.approved && (
                            <button
                              onClick={() => handleApprove(approval.principal)}
                              disabled={setApproval.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {approval.status !== ApprovalStatus.rejected && (
                            <button
                              onClick={() => handleReject(approval.principal)}
                              disabled={setApproval.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          )}
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
