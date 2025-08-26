import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  CreditCard,
  UserPlus,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: "admin" | "staff";
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
  status: "active" | "inactive";
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
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  /** Fetch staff */
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "staff")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /** Fetch bank details */
  const fetchAllBankDetails = async () => {
    try {
      let query = supabase
        .from("bank_details")
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
        .order("created_at", { ascending: false });

      if (selectedStaffId !== "all") {
        query = query.eq("staff_id", selectedStaffId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setBankDetails(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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

  /** Create staff via API */
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const staffData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "staff",
      };

      const res = await fetch("/api/client-create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create staff");

      toast({
        title: "✅ Success",
        description: "Staff member added successfully.",
      });

      setFormData({ email: "", password: "", fullName: "" });
      setIsStaffDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /** Helpers */
  const getStatusBadge = (status: string) =>
    status === "active" ? (
      <Badge className="bg-success text-success-foreground">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );

  const getMerchantDisplay = (merchant: string) => {
    const merchants = {
      googlepay: "Google Pay",
      bharatpe: "BharatPe",
      pinelab: "Pine Labs",
      axis: "Axis",
    };
    return merchants[merchant as keyof typeof merchants] || merchant;
  };

  const getTotalBalance = () =>
    bankDetails.reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getActiveTotalBalance = () =>
    bankDetails
      .filter((detail) => detail.status === "active")
      .reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getInactiveTotalBalance = () =>
    bankDetails
      .filter((detail) => detail.status === "inactive")
      .reduce((sum, detail) => sum + detail.freeze_balance, 0);

  const getActiveAccountsCount = () =>
    bankDetails.filter((detail) => detail.status === "active").length;

  const getInactiveAccountsCount = () =>
    bankDetails.filter((detail) => detail.status === "inactive").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
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
                  {loading ? "Creating..." : "Create Staff"}
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
        {/* ...cards code unchanged for brevity */}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bank-details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
        </TabsList>

        {/* Bank Details Tab */}
        <TabsContent value="bank-details" className="space-y-4">
          {/* ...bank details table code */}
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          {/* ...staff table code */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
