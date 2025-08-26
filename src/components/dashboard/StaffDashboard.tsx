import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, CreditCard, AlertCircle } from 'lucide-react';

interface BankDetail {
  id: string;
  ac_holder_name: string;
  bank_name: string;
  acc_number: string;
  mobile_number: string;
  merchant_name: 'googlepay' | 'bharatpe' | 'pinelab' | 'axis';
  status: 'active' | 'inactive';
  freeze_reason?: string;
  freeze_balance: number;
  created_at: string;
}

const StaffDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<BankDetail | null>(null);
  const [formData, setFormData] = useState({
    ac_holder_name: '',
    bank_name: '',
    acc_number: '',
    mobile_number: '',
    merchant_name: '' as 'googlepay' | 'bharatpe' | 'pinelab' | 'axis' | '',
    status: 'active' as 'active' | 'inactive',
    freeze_reason: '',
    freeze_balance: 0,
  });

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .eq('staff_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankDetails(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchBankDetails();
    }
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDetail) {
        const updateData = {
          ...formData,
          merchant_name: formData.merchant_name as 'googlepay' | 'bharatpe' | 'pinelab' | 'axis'
        };
        const { error } = await supabase
          .from('bank_details')
          .update(updateData)
          .eq('id', editingDetail.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Bank details updated successfully.' });
      } else {
        const insertData = {
          ...formData,
          merchant_name: formData.merchant_name as 'googlepay' | 'bharatpe' | 'pinelab' | 'axis',
          staff_id: profile?.id
        };
        const { error } = await supabase
          .from('bank_details')
          .insert(insertData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Bank details added successfully.' });
      }

      setIsDialogOpen(false);
      setEditingDetail(null);
      setFormData({
        ac_holder_name: '',
        bank_name: '',
        acc_number: '',
        mobile_number: '',
        merchant_name: '' as 'googlepay' | 'bharatpe' | 'pinelab' | 'axis' | '',
        status: 'active' as 'active' | 'inactive',
        freeze_reason: '',
        freeze_balance: 0,
      });
      fetchBankDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (detail: BankDetail) => {
    setEditingDetail(detail);
    setFormData({
      ac_holder_name: detail.ac_holder_name,
      bank_name: detail.bank_name,
      acc_number: detail.acc_number,
      mobile_number: detail.mobile_number,
      merchant_name: detail.merchant_name,
      status: detail.status,
      freeze_reason: detail.freeze_reason || '',
      freeze_balance: detail.freeze_balance,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank detail?')) return;

    try {
      const { error } = await supabase
        .from('bank_details')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Bank detail deleted successfully.' });
      fetchBankDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-success text-success-foreground">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  const getMerchantDisplay = (merchant: string) => {
    const merchants = {
      googlepay: 'Google Pay',
      bharatpe: 'BharatPe',
      pinelab: 'Pine Labs',
      axis: 'Axis'
    };
    return merchants[merchant as keyof typeof merchants] || merchant;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bank Details Management</h2>
          <p className="text-muted-foreground">Manage your banking information and merchant accounts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDetail(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Detail
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDetail ? 'Edit Bank Detail' : 'Add New Bank Detail'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ac_holder_name">Account Holder Name</Label>
                <Input
                  id="ac_holder_name"
                  value={formData.ac_holder_name}
                  onChange={(e) => setFormData({ ...formData, ac_holder_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="acc_number">Account Number</Label>
                <Input
                  id="acc_number"
                  value={formData.acc_number}
                  onChange={(e) => setFormData({ ...formData, acc_number: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="merchant_name">Merchant Name</Label>
                <Select
                  value={formData.merchant_name}
                  onValueChange={(value) => setFormData({ ...formData, merchant_name: value as 'googlepay' | 'bharatpe' | 'pinelab' | 'axis' })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="googlepay">Google Pay</SelectItem>
                    <SelectItem value="bharatpe">BharatPe</SelectItem>
                    <SelectItem value="pinelab">Pine Labs</SelectItem>
                    <SelectItem value="axis">Axis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freeze_balance">Freeze Balance</Label>
                <Input
                  id="freeze_balance"
                  type="number"
                  step="0.01"
                  value={formData.freeze_balance}
                  onChange={(e) => setFormData({ ...formData, freeze_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freeze_reason">Freeze Reason (Optional)</Label>
                <Textarea
                  id="freeze_reason"
                  value={formData.freeze_reason}
                  onChange={(e) => setFormData({ ...formData, freeze_reason: e.target.value })}
                  placeholder="Enter reason if account is frozen"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : editingDetail ? 'Update' : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bank Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Your Bank Details
          </CardTitle>
          <CardDescription>
            View and manage all your banking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bank details...</p>
            </div>
          ) : bankDetails.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bank details found. Add your first bank detail to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Holder</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">{detail.ac_holder_name}</TableCell>
                      <TableCell>{detail.bank_name}</TableCell>
                      <TableCell className="font-mono">{detail.acc_number}</TableCell>
                      <TableCell>{detail.mobile_number}</TableCell>
                      <TableCell>{getMerchantDisplay(detail.merchant_name)}</TableCell>
                      <TableCell>{getStatusBadge(detail.status)}</TableCell>
                      <TableCell className="font-mono">₹{detail.freeze_balance.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(detail)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(detail.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;