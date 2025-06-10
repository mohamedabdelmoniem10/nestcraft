import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useRecentActivity } from '@/hooks/useApi';
import { Activity, User, FileText, Puzzle, Settings } from 'lucide-react';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registered':
      return User;
    case 'content_published':
      return FileText;
    case 'plugin_installed':
      return Puzzle;
    case 'system_update':
      return Settings;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'user_registered':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400';
    case 'content_published':
      return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400';
    case 'plugin_installed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400';
    case 'system_update':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400';
  }
};

export function ActivityFeed() {
  const { data: activities, isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities?.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={getActivityColor(activity.type)}
                      >
                        {activity.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {activity.user && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}