import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Shield, CreditCard } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Banking Panel</h1>
              <p className="text-sm text-muted-foreground">Financial Management System</p>
            </div>
          </div>
          <Link to="/auth">
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Access Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Professional Banking Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, efficient, and comprehensive banking solution for staff and administrative operations
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Comprehensive staff member management with role-based access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Role-based permissions</li>
                <li>• Staff account creation</li>
                <li>• Activity monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                Complete banking information management for all staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Account management</li>
                <li>• Merchant integration</li>
                <li>• Balance monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Enterprise-grade security with authentication and data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Secure authentication</li>
                <li>• Data encryption</li>
                <li>• Audit trails</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>
                Access your secure banking panel with your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button size="lg" className="w-full">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Banking Portal
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                Secure login required • Staff and Admin access
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
