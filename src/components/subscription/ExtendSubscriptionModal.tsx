import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { extendSubscription } from '@/services/subscriptionTimerService';

interface ExtendSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  currentEndDate: Date | null;
  onSuccess?: () => void;
}

/**
 * Modal for extending school subscription
 */
export const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
  open,
  onOpenChange,
  schoolId,
  currentEndDate,
  onSuccess,
}) => {
  const [extensionType, setExtensionType] = useState<'preset' | 'manual'>('preset');
  const [presetDays, setPresetDays] = useState(30);
  const [manualDays, setManualDays] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const presetOptions = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '60 days', days: 60 },
    { label: '90 days', days: 90 },
  ];

  const calculateNewDate = (daysToAdd: number) => {
    if (!currentEndDate) return null;
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    return newDate;
  };

  const daysToAdd = extensionType === 'preset' ? presetDays : parseInt(manualDays || '0');
  const newEndDate = calculateNewDate(daysToAdd);

  const handleExtend = async () => {
    if (daysToAdd <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number of days',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await extendSubscription(schoolId, daysToAdd, reason);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setExtensionType('preset');
        setPresetDays(30);
        setManualDays('');
        setReason('');
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
        description: 'Failed to extend subscription',
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
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Add more time to the school's subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current End Date */}
          {currentEndDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Current End Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentEndDate.toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Extension Type Selection */}
          <div className="space-y-3">
            <Label>Extension Method</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="extensionType"
                  value="preset"
                  checked={extensionType === 'preset'}
                  onChange={() => setExtensionType('preset')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Preset Duration</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="extensionType"
                  value="manual"
                  checked={extensionType === 'manual'}
                  onChange={() => setExtensionType('manual')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Manual Days</span>
              </label>
            </div>
          </div>

          {/* Preset Options */}
          {extensionType === 'preset' && (
            <div className="space-y-3">
              <Label>Select Duration</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetOptions.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setPresetDays(option.days)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      presetDays === option.days
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Days Input */}
          {extensionType === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="manualDays">Number of Days</Label>
              <Input
                id="manualDays"
                type="number"
                min="1"
                value={manualDays}
                onChange={(e) => setManualDays(e.target.value)}
                placeholder="Enter number of days"
              />
            </div>
          )}

          {/* New End Date Preview */}
          {newEndDate && daysToAdd > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">New End Date</div>
              <div className="text-lg font-semibold text-green-700">
                {newEndDate.toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                +{daysToAdd} {daysToAdd === 1 ? 'day' : 'days'}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you extending this subscription?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExtend}
              disabled={isLoading || daysToAdd <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Extending...' : 'Extend Subscription'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
