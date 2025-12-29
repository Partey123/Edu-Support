import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { terminateSubscription } from '@/services/subscriptionTimerService';
import { supabase } from '@/integrations/supabase/client';

interface TerminateSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName?: string;
  onSuccess?: () => void;
}

/**
 * Modal for terminating school subscription abruptly
 */
export const TerminateSubscriptionModal: React.FC<TerminateSubscriptionModalProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName = 'School',
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTerminate = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for termination',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await terminateSubscription(schoolId, reason, user?.id || '');

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          variant: 'default',
        });
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setReason('');
        setConfirmed(false);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to terminate subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Terminate Subscription</DialogTitle>
          <DialogDescription>
            This action is irreversible and will immediately end the school's subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="space-y-1">
                <div className="font-semibold text-red-800">Warning: This is irreversible</div>
                <div className="text-sm text-red-700">
                  Once you terminate {schoolName}'s subscription, they will lose access to all platform
                  features immediately. This action cannot be undone and will be logged in the audit trail.
                </div>
              </div>
            </div>
          </div>

          {/* School Name Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">School</div>
            <div className="text-lg font-semibold text-gray-900">{schoolName}</div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are terminating this subscription..."
              rows={4}
              className="border-gray-300 focus:border-red-500"
            />
            <div className="text-xs text-gray-500">
              Required - This will be logged and visible in the subscription history
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-1"
            />
            <span className="text-sm font-medium text-red-800">
              I understand that terminating this subscription is irreversible and {schoolName} will
              immediately lose access to all services
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTerminate}
              disabled={isLoading || !confirmed || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Terminating...' : 'Terminate Subscription'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
