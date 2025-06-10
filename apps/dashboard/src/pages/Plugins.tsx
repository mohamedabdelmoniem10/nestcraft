import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PluginCard } from '@/components/plugins/PluginCard';
import { usePlugins } from '@/hooks/useApi';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function Plugins() {
  const { data: plugins, isLoading, refetch } = usePlugins();
  const [search, setSearch] = useState('');

  const installedPlugins = plugins?.filter(p => p.installed) || [];
  const availablePlugins = plugins?.filter(p => !p.installed) || [];

  const filteredPlugins = (pluginList: typeof plugins) => {
    if (!search) return pluginList;
    return pluginList?.filter(plugin =>
      plugin.name.toLowerCase().includes(search.toLowerCase()) ||
      plugin.description.toLowerCase().includes(search.toLowerCase()) ||
      plugin.category.toLowerCase().includes(search.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Plugin Management</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Management</h1>
          <p className="text-muted-foreground">
            Extend your CMS with powerful plugins and integrations.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Plugins
            <Badge variant="secondary" className="ml-2">
              {plugins?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="installed">
            Installed
            <Badge variant="secondary" className="ml-2">
              {installedPlugins.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="available">
            Available
            <Badge variant="secondary" className="ml-2">
              {availablePlugins.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlugins(plugins)?.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlugins(installedPlugins)?.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlugins(availablePlugins)?.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}