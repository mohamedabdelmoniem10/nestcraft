import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plugin } from '@/types';
import { Star, Download, DollarSign, Settings } from 'lucide-react';
import { useInstallPlugin, useEnablePlugin, useDisablePlugin } from '@/hooks/useApi';

interface PluginCardProps {
  plugin: Plugin;
}

export function PluginCard({ plugin }: PluginCardProps) {
  const installMutation = useInstallPlugin();
  const enableMutation = useEnablePlugin();
  const disableMutation = useDisablePlugin();

  const handleInstall = () => {
    if (!plugin.installed) {
      installMutation.mutate(plugin.id);
    }
  };

  const handleToggle = () => {
    if (plugin.installed) {
      if (plugin.active) {
        disableMutation.mutate(plugin.id);
      } else {
        enableMutation.mutate(plugin.id);
      }
    }
  };

  const isLoading = installMutation.isPending || enableMutation.isPending || disableMutation.isPending;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {plugin.icon || plugin.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-base">{plugin.name}</CardTitle>
              <p className="text-sm text-muted-foreground">by {plugin.author}</p>
            </div>
          </div>
          <Badge variant={plugin.installed ? 'default' : 'secondary'}>
            v{plugin.version}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plugin.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{plugin.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>{plugin.downloads.toLocaleString()}</span>
            </div>
            {plugin.price > 0 && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>{plugin.price}</span>
              </div>
            )}
          </div>
          <Badge variant="outline">{plugin.category}</Badge>
        </div>
        
        <div className="flex space-x-2">
          {!plugin.installed ? (
            <Button
              onClick={handleInstall}
              disabled={isLoading}
              className="flex-1"
              size="sm"
            >
              {installMutation.isPending ? 'Installing...' : 'Install'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleToggle}
                disabled={isLoading}
                variant={plugin.active ? 'default' : 'outline'}
                className="flex-1"
                size="sm"
              >
                {enableMutation.isPending || disableMutation.isPending
                  ? 'Updating...'
                  : plugin.active
                  ? 'Disable'
                  : 'Enable'
                }
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}