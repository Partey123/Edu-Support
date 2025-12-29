import React, { useState } from 'react';
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
import { Plus, Copy, RefreshCw, Filter } from 'lucide-react';

interface CodeRecord {
  id: string;
  code: string;
  type: 'promo' | 'invoice' | 'access';
  status: 'active' | 'used' | 'expired';
  description: string;
  value?: number; // For promo codes (discount percentage/amount)
  createdAt: string;
  usedBy?: string;
  expiresAt?: string;
}

const CodesPage: React.FC = () => {
  const [codes, setCodes] = useState<CodeRecord[]>([
    {
      id: '1',
      code: 'PROMO2025',
      type: 'promo',
      status: 'active',
      description: '20% discount for new schools',
      value: 20,
      createdAt: '2025-12-20',
      expiresAt: '2026-12-31',
    },
    {
      id: '2',
      code: 'SCHOOL001ACC',
      type: 'access',
      status: 'active',
      description: 'School activation code',
      createdAt: '2025-12-25',
      usedBy: 'Accra High School',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const generateCode = (type: 'promo' | 'invoice' | 'access') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const typePrefix = {
      promo: 'PROMO',
      invoice: 'INV',
      access: 'ACC',
    };
    const newCode = `${typePrefix[type]}${timestamp}${random}`;

    const newRecord: CodeRecord = {
      id: (codes.length + 1).toString(),
      code: newCode,
      type,
      status: 'active',
      description: '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCodes([...codes, newRecord]);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const filteredCodes = codes.filter((code) => {
    const typeMatch = filterType === 'all' || code.type === filterType;
    const statusMatch = filterStatus === 'all' || code.status === filterStatus;
    const searchMatch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'promo':
        return 'bg-purple-100 text-purple-800';
      case 'invoice':
        return 'bg-orange-100 text-orange-800';
      case 'access':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => generateCode('promo')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Promo Code
            </Button>
            <Button
              onClick={() => generateCode('invoice')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Invoice Code
            </Button>
            <Button
              onClick={() => generateCode('access')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Access Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="promo">Promo Codes</SelectItem>
                <SelectItem value="invoice">Invoice Codes</SelectItem>
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
        <CardHeader>
          <CardTitle>Generated Codes</CardTitle>
          <CardDescription>{filteredCodes.length} codes found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No codes found. Generate a new code to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">{code.code}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(code.type)}>
                          {code.type.charAt(0).toUpperCase() + code.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(code.status)}>
                          {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{code.description || '-'}</TableCell>
                      <TableCell className="text-sm">{code.createdAt}</TableCell>
                      <TableCell className="text-sm">{code.usedBy || '-'}</TableCell>
                      <TableCell className="text-sm">{code.expiresAt || '-'}</TableCell>
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
