import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartWidget } from '@/components/dashboard/ChartWidget';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance and gain insights into your content and users.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Page Views"
          value="125,432"
          change={12.5}
          icon={Eye}
          description="Total views this month"
        />
        <MetricsCard
          title="Unique Visitors"
          value="42,318"
          change={8.2}
          icon={Users}
          description="Unique users this month"
        />
        <MetricsCard
          title="Bounce Rate"
          value="32.4%"
          change={-5.1}
          icon={TrendingUp}
          description="Average bounce rate"
        />
        <MetricsCard
          title="Conversion Rate"
          value="3.2%"
          change={15.3}
          icon={BarChart3}
          description="Goal conversion rate"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartWidget
          title="Traffic Overview"
          type="area"
          dataKey="value"
          color="#3b82f6"
        />
        <ChartWidget
          title="User Engagement"
          type="line"
          dataKey="users"
          color="#10b981"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWidget
            title="Content Performance"
            type="bar"
            dataKey="content"
            color="#f59e0b"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Getting Started Guide', views: '12.3k' },
              { title: 'Advanced Features', views: '8.7k' },
              { title: 'API Documentation', views: '6.2k' },
              { title: 'Best Practices', views: '4.9k' },
              { title: 'Troubleshooting', views: '3.1k' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.title}</span>
                <span className="text-sm font-medium">{item.views}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}