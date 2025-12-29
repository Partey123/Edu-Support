import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, RefreshCw, Filter, Zap, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTopUpCodes, getAllTopUpCodes, generateActivationCodes } from '@/services/topupCodeService';
import type { GenerateCodeOptions } from '@/services/topupCodeService';

interface CodeRecord {
  id: number;
  code: string;
  code_type: 'TOP' | 'PROMO' | 'INV' | 'ACC';
  status: 'active' | 'used' | 'expired';
  metadata: Record<string, any> | null;
  created_at: string;
  used_by_school?: string;
  used_at?: string;
}

const CodesPage: React.FC = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Top-up code generation state
  const [topupDuration, setTopupDuration] = useState<7 | 30 | 60 | 90>(30);
  const [topupQuantity, setTopupQuantity] = useState('1');
  const [topupGenerating, setTopupGenerating] = useState(false);
  const [generatedTopupCodes, setGeneratedTopupCodes] = useState<string[]>([]);

  // Fetch codes from service (uses mock storage until migration)
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      // Use the topupCodeService which handles mock storage until migration is executed
      const allCodes = await getAllTopUpCodes();
      setCodes(allCodes as CodeRecord[]);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (type: 'PROMO' | 'INV' | 'ACC') => {
    try {
      if (type === 'ACC') {
        // For activation codes, we need a real plan ID from the database
        // Fetch the first available plan
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('is_active', true)
          .eq('is_visible', true)
          .limit(1)
          .single();

        if (plansError || !plansData?.id) {
          toast({
            title: 'Error',
            description: 'No active subscription plans available. Please create a plan first.',
            variant: 'destructive',
          });
          return;
        }

        const planId = plansData.id;
        const result = await generateActivationCodes(1, planId, 30);
        
        if (result.success && result.codes?.[0]) {
          toast({
            title: 'Success',
            description: `Activation code created: ${result.codes[0]}`,
          });
          fetchCodes();
        } else {
          throw new Error(result.message);
        }
      } else {
        // For other code types (PROMO, INV), use the existing function
        const options: GenerateCodeOptions = {
          quantity: 1,
          durationDays: 30,
          type: type,
        };
        const result = await generateTopUpCodes(options);
        
        if (result.success && result.codes?.[0]) {
          toast({
            title: 'Success',
            description: `${type} code created: ${result.codes[0].code}`,
          });
          fetchCodes();
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error('Error creating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create code',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const handleGenerateTopupCodes = async () => {
    const quantity = parseInt(topupQuantity) || 1;
    if (quantity <= 0 || quantity > 100) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a quantity between 1 and 100',
        variant: 'destructive',
      });
      return;
    }

    setTopupGenerating(true);
    try {
      const options: GenerateCodeOptions = {
        quantity,
        durationDays: topupDuration,
        type: 'TOP',
      };
      const result = await generateTopUpCodes(options);
      
      if (result.success && result.codes) {
        const newCodes = result.codes.map((c) => c.code);
        setGeneratedTopupCodes(newCodes);
        
        toast({
          title: 'Success',
          description: `Generated ${quantity} top-up code(s) for ${topupDuration} days`,
        });

        // Reset form and refresh list
        setTopupQuantity('1');
        fetchCodes();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to generate codes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating top-up codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate codes',
        variant: 'destructive',
      });
    } finally {
      setTopupGenerating(false);
    }
  };

  const filteredCodes = codes.filter((code) => {
    // Map code_type to filter type
    let codeType = 'all';
    if (code.code_type === 'TOP') codeType = 'topup';
    if (code.code_type === 'PROMO') codeType = 'promo';
    if (code.code_type === 'INV') codeType = 'invoice';
    if (code.code_type === 'ACC') codeType = 'access';

    const typeMatch = filterType === 'all' || codeType === filterType;
    const statusMatch = filterStatus === 'all' || code.status === filterStatus;
    const searchMatch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TOP':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROMO':
        return 'bg-purple-100 text-purple-800';
      case 'INV':
        return 'bg-orange-100 text-orange-800';
      case 'ACC':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TOP':
        return 'Top-Up';
      case 'PROMO':
        return 'Promo';
      case 'INV':
        return 'Invoice';
      case 'ACC':
        return 'Access';
      default:
        return type;
    }
  };

  return (
    <DashboardLayout role="super-admin">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Code Management
        </h1>
        <p className="text-muted-foreground">
          Generate and manage promo, invoice, and access codes
        </p>
      </div>

      {/* Generate New Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Code</CardTitle>
          <CardDescription>Create new codes for promotions, invoices, or school access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              onClick={() => generateCode('promo')}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Promo Code
            </Button>
            <Button
              onClick={() => generateCode('invoice')}
              className="bg-orange-600 hover:bg-orange-700 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <Button
              onClick={() => generateCode('access')}
              className="bg-cyan-600 hover:bg-cyan-700 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Access Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Top-Up Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Generate Top-Up Codes
          </CardTitle>
          <CardDescription>
            Create subscription extension codes (extends school subscriptions by specified days)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={topupDuration.toString()} onValueChange={(val) => setTopupDuration(parseInt(val) as 7 | 30 | 60 | 90)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={topupQuantity}
                onChange={(e) => setTopupQuantity(e.target.value)}
                placeholder="How many codes?"
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button
                onClick={handleGenerateTopupCodes}
                disabled={topupGenerating}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                {topupGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Codes Display */}
          {generatedTopupCodes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Generated Codes ({generatedTopupCodes.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTopupCodes.join('\n'));
                    toast({
                      title: 'Copied!',
                      description: 'All codes copied to clipboard',
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-muted/30 p-4 rounded-lg">
                {generatedTopupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-border rounded p-3 font-mono text-sm"
                  >
                    <span className="font-bold">{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Each code adds {topupDuration} days to a school's subscription when applied
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="topup">Top-Up Codes</SelectItem>
                <SelectItem value="promo">Promo Codes</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="access">Access Codes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Generated Codes</CardTitle>
            <CardDescription>{filteredCodes.length} codes found</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCodes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No codes found. Generate a new code to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-bold text-sm">{code.code}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(code.code_type)}>
                              {getTypeLabel(code.code_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(code.status)}>
                              {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(code.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {code.metadata?.duration_days ? `${code.metadata.duration_days}d` : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(code.code)}
                              title="Copy code"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View - Card Grid */}
              <div className="md:hidden space-y-3">
                {filteredCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No codes found. Generate a new code to get started.
                  </div>
                ) : (
                  filteredCodes.map((code) => (
                    <div key={code.id} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="font-mono font-bold text-sm break-all flex-1">{code.code}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                          title="Copy code"
                          className="flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(code.code_type)}>
                            {getTypeLabel(code.code_type)}
                          </Badge>
                          <Badge className={getStatusColor(code.status)}>
                            {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          <div>Created: {new Date(code.created_at).toLocaleDateString()}</div>
                          {code.metadata?.duration_days && (
                            <div>Duration: {code.metadata.duration_days} days</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Code Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {codes.filter((c) => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {codes.filter((c) => c.status === 'used').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {codes.filter((c) => c.status === 'expired').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CodesPage;
