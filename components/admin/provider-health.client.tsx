'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ServerIcon,
  InfoIcon,
  ClockIcon
} from 'lucide-react';

interface ProviderHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  configured: boolean;
  error?: string;
  details?: Record<string, any>;
}

interface HealthResponse {
  timestamp: string;
  status: 'operational' | 'degraded' | 'offline';
  providers: ProviderHealth[];
  summary: {
    total: number;
    healthy: number;
    configured: number;
    unconfigured: number;
  };
}

export function ProviderHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/providers/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch health data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'unconfigured':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      case 'unconfigured':
        return <Badge variant="secondary">Not Configured</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            AI Provider Health
          </CardTitle>
          <CardDescription>
            Monitor the status and configuration of AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Checking provider health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ServerIcon className="h-5 w-5" />
              AI Provider Health
            </CardTitle>
            <CardDescription>
              Monitor the status and configuration of AI providers
            </CardDescription>
          </div>
          <Button
            onClick={fetchHealthData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {healthData && (
          <>
            {/* Overall Status */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">System Status</h3>
                <Badge
                  variant={healthData.status === 'operational' ? 'default' : healthData.status === 'degraded' ? 'secondary' : 'destructive'}
                  className={healthData.status === 'operational' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                >
                  {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Providers</span>
                  <div className="font-medium">{healthData.summary.total}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Healthy</span>
                  <div className="font-medium text-green-600">{healthData.summary.healthy}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Configured</span>
                  <div className="font-medium">{healthData.summary.configured}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Unconfigured</span>
                  <div className="font-medium text-yellow-600">{healthData.summary.unconfigured}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Provider Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Provider Details</h3>
              {healthData.providers.map((provider, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(provider.status)}
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {provider.configured ? 'Environment variables configured' : 'Missing configuration'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(provider.status)}
                  </div>

                  {provider.error && (
                    <Alert variant="destructive">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>{provider.error}</AlertDescription>
                    </Alert>
                  )}

                  {provider.details && Object.keys(provider.details).length > 0 && (
                    <div className="bg-muted/30 rounded p-3 space-y-2">
                      <h5 className="text-sm font-medium">Details:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(provider.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="font-mono text-xs bg-background px-2 py-1 rounded">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                <ClockIcon className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </>
        )}

        {!healthData && !loading && (
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Failed to load provider health data. Please try refreshing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
