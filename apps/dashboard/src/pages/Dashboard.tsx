import React from 'react';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { ChartWidget } from '@/components/dashboard/ChartWidget';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats, useUserGrowth } from '@/hooks/useApi';
import {
  Users,
  FileText,
  Eye,
  DollarSign,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useDashboardStats();
  const { data: userGrowthData, isLoading: growthLoading } = useUserGrowth();

  const isLoading = statsLoading || growthLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your CMS.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change={stats?.userGrowth}
          icon={Users}
          description="Active users this month"
          isLoading={isLoading}
        />
        <MetricsCard
          title="Total Content"
          value={stats?.totalContent?.toLocaleString() || '0'}
          change={stats?.contentGrowth}
          icon={FileText}
          description="Published content pieces"
          isLoading={isLoading}
        />
        <MetricsCard
          title="Page Views"
          value={stats?.totalViews?.toLocaleString() || '0'}
          change={stats?.viewsGrowth}
          icon={Eye}
          description="Views this month"
          isLoading={isLoading}
        />
        <MetricsCard
          title="Revenue"
          value={`$${stats?.revenue?.toLocaleString() || '0'}`}
          change={stats?.revenueGrowth}
          icon={DollarSign}
          description="Monthly recurring revenue"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ChartWidget
            title="User Growth"
            type="area"
            data={userGrowthData}
            dataKey="users"
            color="#3b82f6"
            isLoading={growthLoading}
          />
          <ChartWidget
            title="Content Performance"
            type="bar"
            data={userGrowthData}
            dataKey="content"
            color="#10b981"
            isLoading={growthLoading}
          />
        </div>
        
        <div className="space-y-6">
          <ActivityFeed />
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Online Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Sessions</span>
                <span className="font-medium">5,678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Load</span>
                <span className="font-medium text-green-600">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="font-medium">42.1 GB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}