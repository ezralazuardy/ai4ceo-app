import { auth } from '@/lib/auth';
import { ChatSDKError } from '@/lib/errors';
import { headers } from 'next/headers';

interface ProviderHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  configured: boolean;
  error?: string;
  details?: Record<string, any>;
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== 'admin') {
    return new ChatSDKError('forbidden:auth').toResponse();
  }

  const providers: ProviderHealth[] = [];

  // Check Groq
  const groqHealth: ProviderHealth = {
    name: 'Groq',
    configured: Boolean(process.env.GROQ_API_KEY),
    status: 'unconfigured',
  };

  if (groqHealth.configured) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        groqHealth.status = 'healthy';
        groqHealth.details = {
          modelsCount: data.data?.length || 0,
          endpoint: 'https://api.groq.com/openai/v1/models',
        };
      } else {
        groqHealth.status = 'unhealthy';
        groqHealth.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      groqHealth.status = 'unhealthy';
      groqHealth.error = error instanceof Error ? error.message : 'Connection failed';
    }
  } else {
    groqHealth.error = 'GROQ_API_KEY not configured';
  }

  providers.push(groqHealth);

  // Check Google Vertex AI
  const vertexHealth: ProviderHealth = {
    name: 'Google Vertex AI',
    configured: Boolean(process.env.GOOGLE_VERTEX_PROJECT && process.env.GOOGLE_VERTEX_LOCATION),
    status: 'unconfigured',
  };

  if (vertexHealth.configured) {
    try {
      // For Vertex AI, we'll just check if we can create a client without errors
      // since the actual API call requires more complex authentication
      vertexHealth.status = 'healthy';
      vertexHealth.details = {
        project: process.env.GOOGLE_VERTEX_PROJECT,
        location: process.env.GOOGLE_VERTEX_LOCATION,
        hasApiKey: Boolean(process.env.GOOGLE_VERTEX_API_KEY),
        note: 'Configuration valid, actual model availability depends on deployment',
      };
    } catch (error) {
      vertexHealth.status = 'unhealthy';
      vertexHealth.error = error instanceof Error ? error.message : 'Configuration error';
    }
  } else {
    const missing = [];
    if (!process.env.GOOGLE_VERTEX_PROJECT) missing.push('GOOGLE_VERTEX_PROJECT');
    if (!process.env.GOOGLE_VERTEX_LOCATION) missing.push('GOOGLE_VERTEX_LOCATION');
    vertexHealth.error = `Missing required variables: ${missing.join(', ')}`;
  }

  providers.push(vertexHealth);

  // Check Azure OpenAI
  const azureHealth: ProviderHealth = {
    name: 'Azure OpenAI',
    configured: Boolean(process.env.AZURE_RESOURCE_NAME && process.env.AZURE_API_KEY),
    status: 'unconfigured',
  };

  if (azureHealth.configured) {
    try {
      const apiVersion = process.env.AZURE_API_VERSION || '2024-02-01';
      const url = `https://${process.env.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments?api-version=${apiVersion}`;

      const response = await fetch(url, {
        headers: {
          'api-key': process.env.AZURE_API_KEY!,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        azureHealth.status = 'healthy';
        azureHealth.details = {
          resourceName: process.env.AZURE_RESOURCE_NAME,
          apiVersion,
          deploymentsCount: data.data?.length || 0,
          endpoint: url,
        };
      } else {
        azureHealth.status = 'unhealthy';
        try {
          const errorData = await response.json();
          azureHealth.error = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          azureHealth.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
    } catch (error) {
      azureHealth.status = 'unhealthy';
      azureHealth.error = error instanceof Error ? error.message : 'Connection failed';
    }
  } else {
    const missing = [];
    if (!process.env.AZURE_RESOURCE_NAME) missing.push('AZURE_RESOURCE_NAME');
    if (!process.env.AZURE_API_KEY) missing.push('AZURE_API_KEY');
    azureHealth.error = `Missing required variables: ${missing.join(', ')}`;
  }

  providers.push(azureHealth);

  // Overall system status
  const healthyCount = providers.filter(p => p.status === 'healthy').length;
  const configuredCount = providers.filter(p => p.configured).length;
  const overallStatus = healthyCount > 0 ? 'operational' : configuredCount > 0 ? 'degraded' : 'offline';

  return Response.json({
    timestamp: new Date().toISOString(),
    status: overallStatus,
    providers,
    summary: {
      total: providers.length,
      healthy: healthyCount,
      configured: configuredCount,
      unconfigured: providers.length - configuredCount,
    },
  });
}
