import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const DashboardPage = () => {
  const { profile } = useAuth();

  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StaffDashboard />;
};

export default DashboardPage;