import { auth } from '@/lib/auth';
import { ChatSDKError } from '@/lib/errors';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== 'admin') {
    return new ChatSDKError('forbidden:auth').toResponse();
  }

  const resourceName = process.env.AZURE_RESOURCE_NAME;
  const apiKey = process.env.AZURE_API_KEY;
  const apiVersion = process.env.AZURE_API_VERSION || '2024-02-01';

  if (!resourceName || !apiKey) {
    return Response.json(
      {
        models: [
          { id: 'gpt-4.1', name: 'GPT-4.1' },
        ],
        warning: 'AZURE_RESOURCE_NAME or AZURE_API_KEY not set; using defaults',
      },
      { status: 200 },
    );
  }

  try {
    const url = `https://${resourceName}.openai.azure.com/openai/deployments?api-version=${apiVersion}`;
    const res = await fetch(url, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;

      try {
        const errorData = await res.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Ignore JSON parsing errors for error responses
      }

      return Response.json(
        {
          models: [
            { id: 'gpt-4.1', name: 'GPT-4.1' },
          ],
          error: `Azure API Error: ${errorMessage}`,
          warning: 'Using fallback models due to API error',
        },
        { status: 200 },
      );
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.data)) {
      return Response.json(
        {
          models: [
            { id: 'gpt-4.1', name: 'GPT-4.1' },
          ],
          warning: 'Unexpected API response format, using fallback models',
        },
        { status: 200 },
      );
    }

    const models = data.data
      .map((deployment: any) => {
        const id = String(deployment.id || deployment.model || deployment.name || '');
        const name = deployment.model || deployment.id || deployment.name || id;

        if (!id) return null;

        return {
          id: id.trim(),
          name: String(name).trim(),
        };
      })
      .filter(Boolean);

    if (models.length === 0) {
      return Response.json(
        {
          models: [
            { id: 'gpt-4.1', name: 'GPT-4.1' },
          ],
          warning: 'No deployments found in Azure OpenAI resource, using fallback models',
        },
        { status: 200 },
      );
    }

    return Response.json({ models }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return Response.json(
      {
        models: [
          { id: 'gpt-4.1', name: 'GPT-4.1' },
        ],
        error: `Failed to query Azure OpenAI deployments: ${errorMessage}`,
        warning: 'Using fallback models due to connection error',
      },
      { status: 200 },
    );
  }
}
