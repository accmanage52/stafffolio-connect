import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  CreditCard,
  UserPlus,
  Building2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'staff';
  created_at: string;
}

interface BankDetail {
  id: string;
  staff_id: string;
  ac_holder_name: string;
  bank_name: string;
  acc_number: string;
  mobile_number: string;
  merchant_name: string;
  status: 'active' | 'inactive';
  freeze_reason?: string;
  freeze_balance: number;
  created_at: string;
  profiles: Profile;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<Profile[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  /** Fetch staff */
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  /** Fetch bank details */
  const fetchAllBankDetails = async () => {
    try {
      let query = supabase
        .from('bank_details')
        .select(
          `
          *,
          profiles:staff_id (
            id,
            user_id,
            full_name,
            role,
            created_at
          )
        `
        )
        .order('created_at', { ascending: false });

      if (selectedStaffId !== 'all') {
        query = query.eq('staff_id', selectedStaffId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setBankDetails(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  /** Load data on mount + staff filter change */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStaff(), fetchAllBankDetails()]);
      setLoading(false);
    };
    loadData();
  }, [selectedStaffId]);

  /** Create staff */
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: crypto.randomUUID(),
          full_name: formData.fullName,
          role: 'staff',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Staff member added successfully.',
      });

      setIsStaffDialogOpen(false);
      setFormData({ email: '', password: '', fullName: '' });
      fetchStaff();
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

  /** Helpers */
  const getStatusBadge = (status: string) =>
    status === 'active' ? (
      <Badge className="bg-success text-success-foreground">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );

  const getMerchantDisplay = (merchant: string) => {
    const merchants = {
      googlepay: 'Google Pay',
      bharatpe: 'BharatPe',
      pinelab: 'Pine Labs',
      axis: 'Axis',
    };
    return merchants[merchant as keyof typeof merchants] || merchant;
  };

  const getTotalBalance = () =>
    bankDetails.reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getActiveTotalBalance = () =>
    bankDetails
      .filter((detail) => detail.status === 'active')
      .reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getInactiveTotalBalance = () =>
    bankDetails
      .filter((detail) => detail.status === 'inactive')
      .reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getActiveAccountsCount = () =>
    bankDetails.filter((detail) => detail.status === 'active').length;

  const getInactiveAccountsCount = () =>
    bankDetails.filter((detail) => detail.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage staff and monitor all banking operations
          </p>
        </div>

        {/* Add Staff Dialog */}
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Staff'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStaffDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Staff */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>

        {/* Total Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalBalance().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        {/* Active Accounts Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{getActiveTotalBalance().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From active accounts</p>
          </CardContent>
        </Card>

        {/* Inactive Accounts Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Accounts Balance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{getInactiveTotalBalance().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From inactive accounts</p>
          </CardContent>
        </Card>

        {/* Active Accounts Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveAccountsCount()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        {/* Inactive Accounts Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Accounts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInactiveAccountsCount()}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bank-details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
        </TabsList>

        {/* Bank Details Tab */}
        <TabsContent value="bank-details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                All Bank Details
              </CardTitle>
              <CardDescription>
                Monitor all staff banking information and accounts
              </CardDescription>
              <div className="flex items-center gap-4">
                <Label htmlFor="staff-filter">Filter by Staff:</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading bank details...</p>
                </div>
              ) : bankDetails.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No bank details found for the selected criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Account Holder</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.profiles.full_name}
                          </TableCell>
                          <TableCell>{detail.ac_holder_name}</TableCell>
                          <TableCell>{detail.bank_name}</TableCell>
                          <TableCell className="font-mono">{detail.acc_number}</TableCell>
                          <TableCell>{detail.mobile_number}</TableCell>
                          <TableCell>
                            {getMerchantDisplay(detail.merchant_name)}
                          </TableCell>
                          <TableCell>{getStatusBadge(detail.status)}</TableCell>
                          <TableCell className="font-mono">
                            ₹{detail.freeze_balance.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(detail.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members
              </CardTitle>
              <CardDescription>
                Manage your team and their access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading staff...</p>
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No staff members found. Add your first staff member to get
                    started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Bank Accounts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => {
                        const memberBankAccounts = bankDetails.filter(
                          (detail) => detail.staff_id === member.id
                        ).length;

                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.full_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(member.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {memberBankAccounts} accounts
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
