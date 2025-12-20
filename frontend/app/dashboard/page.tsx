'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const PageHeader: React.FC<{
  title: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
    <div>{children}</div>
  </div>
);

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Dashboard"
            description="Welcome to your dashboard"
          >
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </PageHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-medium text-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium text-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-medium text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Settings
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current session information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  You are currently logged in
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
