/**
 * AI Provider Configuration
 *
 * This file configures multiple AI providers:
 * - Groq: Requires GROQ_API_KEY
 * - Google Vertex AI: Requires GOOGLE_VERTEX_PROJECT, GOOGLE_VERTEX_LOCATION, optional GOOGLE_VERTEX_API_KEY
 * - Azure OpenAI: Requires AZURE_RESOURCE_NAME, AZURE_API_KEY, optional AZURE_API_VERSION
 *
 * Environment Variables:
 * - AZURE_RESOURCE_NAME: Your Azure OpenAI resource name
 * - AZURE_API_KEY: Your Azure OpenAI API key
 * - AZURE_API_VERSION: API version (defaults to 2024-02-01)
 */
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createVertex } from '@ai-sdk/google-vertex';
import { createAzure } from '@ai-sdk/azure';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT,
  location: process.env.GOOGLE_VERTEX_LOCATION,
  headers: process.env.GOOGLE_VERTEX_API_KEY
    ? { 'x-goog-api-key': process.env.GOOGLE_VERTEX_API_KEY }
    : undefined,
});

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
});

// NOTE: getSettings is only needed dynamically to avoid importing server-only in scripts

export const myProvider = customProvider({
  languageModels: {
    'title-model': groq('openai/gpt-oss-20b'),
    'artifact-model': groq('moonshotai/kimi-k2-instruct'),
    'chat-model': groq('openai/gpt-oss-20b'),
    'chat-model-small': groq('openai/gpt-oss-20b'),
    'chat-model-large': groq('openai/gpt-oss-120b'),
    'chat-model-reasoning': wrapLanguageModel({
      model: groq('moonshotai/kimi-k2-instruct'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
  },
  // imageModels: {
  //   'small-model': xai.imageModel('grok-2-image'),
  // },
});
export type ProviderPreference = 'groq' | 'vertex' | 'azure';

const groqMap: Record<string, string> = {
  'chat-model': 'openai/gpt-oss-20b',
  'chat-model-small': 'openai/gpt-oss-20b',
  'chat-model-large': 'openai/gpt-oss-120b',
  'chat-model-reasoning': 'moonshotai/kimi-k2-instruct',
  'title-model': 'openai/gpt-oss-20b',
  'artifact-model': 'moonshotai/kimi-k2-instruct',
};

const vertexMap: Record<string, string> = {
  'chat-model': 'gemini-1.5-flash',
  'chat-model-small': 'gemini-1.5-flash',
  'chat-model-large': 'gemini-1.5-pro',
  'chat-model-reasoning': 'gemini-1.5-pro',
  'title-model': 'gemini-1.5-flash',
  'artifact-model': 'gemini-1.5-pro',
};

const azureMap: Record<string, string> = {
  'chat-model': 'gpt-4.1',
  'chat-model-small': 'gpt-4.1',
  'chat-model-large': 'gpt-4.1',
  'chat-model-reasoning': 'gpt-4.1',
  'title-model': 'gpt-4.1',
  'artifact-model': 'gpt-4.1',
};

export function getLanguageModelForId(
  id: string,
  provider: ProviderPreference,
  overrides?: Record<string, string> | null,
) {
  const map = provider === 'vertex' ? vertexMap : provider === 'azure' ? azureMap : groqMap;
  const modelId = overrides?.[id]?.trim() || map[id] || map['chat-model'];

  const model = provider === 'vertex' ? vertex(modelId) : provider === 'azure' ? azure(modelId) : groq(modelId);

  if (id === 'chat-model-reasoning') {
    return wrapLanguageModel({
      model,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    });
  }

  return model;
}

export async function getDynamicLanguageModelForId(id: string) {
  try {
    const { getSettings } = await import('@/lib/db/queries');
    const settings = await getSettings();
    const pref = (settings?.defaultProviderPreference as ProviderPreference) ?? 'groq';
    const groqOverrides = (settings?.modelOverridesGroq ?? null) as Record<string, string> | null;
    const vertexOverrides = (settings?.modelOverridesVertex ?? null) as Record<string, string> | null;
    const azureOverrides = (settings?.modelOverridesAzure ?? null) as Record<string, string> | null;
    const overrides = pref === 'groq' ? groqOverrides : pref === 'azure' ? azureOverrides : vertexOverrides;
    return getLanguageModelForId(id, pref, overrides);
  } catch {
    return getLanguageModelForId(id, 'groq', null);
  }
}

/**
 * Validates Azure OpenAI configuration
 */
function validateAzureConfig(): { isValid: boolean; error?: string } {
  if (!process.env.AZURE_RESOURCE_NAME) {
    return { isValid: false, error: 'AZURE_RESOURCE_NAME is required' };
  }
  if (!process.env.AZURE_API_KEY) {
    return { isValid: false, error: 'AZURE_API_KEY is required' };
  }
  return { isValid: true };
}

/**
 * Validates Google Vertex AI configuration
 */
function validateVertexConfig(): { isValid: boolean; error?: string } {
  if (!process.env.GOOGLE_VERTEX_PROJECT) {
    return { isValid: false, error: 'GOOGLE_VERTEX_PROJECT is required' };
  }
  if (!process.env.GOOGLE_VERTEX_LOCATION) {
    return { isValid: false, error: 'GOOGLE_VERTEX_LOCATION is required' };
  }
  return { isValid: true };
}

/**
 * Validates Groq configuration
 */
function validateGroqConfig(): { isValid: boolean; error?: string } {
  if (!process.env.GROQ_API_KEY) {
    return { isValid: false, error: 'GROQ_API_KEY is required' };
  }
  return { isValid: true };
}

export function resolveModelCandidatesForId(
  id: string,
  preference: ProviderPreference = 'groq',
  groqOverrides?: Record<string, string> | null,
  vertexOverrides?: Record<string, string> | null,
  azureOverrides?: Record<string, string> | null,
) {
  const groqConfig = validateGroqConfig();
  const vertexConfig = validateVertexConfig();
  const azureConfig = validateAzureConfig();

  const groqEnabled = groqConfig.isValid;
  const vertexEnabled = vertexConfig.isValid;
  const azureEnabled = azureConfig.isValid;

  const makeGroqCandidate = () => {
    const modelId = groqOverrides?.[id]?.trim() || groqMap[id] || groqMap['chat-model'];
    if (id === 'chat-model-reasoning') {
      return {
        provider: 'groq' as const,
        modelId,
        model: wrapLanguageModel({
          model: groq(modelId),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
      };
    }
    return { provider: 'groq' as const, modelId, model: groq(modelId) };
  };

  const makeVertexCandidate = () => {
    const modelId = vertexOverrides?.[id]?.trim() || vertexMap[id] || vertexMap['chat-model'];
    if (id === 'chat-model-reasoning') {
      return {
        provider: 'vertex' as const,
        modelId,
        model: wrapLanguageModel({
          model: vertex(modelId),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
      };
    }
    return { provider: 'vertex' as const, modelId, model: vertex(modelId) };
  };

  const makeAzureCandidate = () => {
    const modelId = azureOverrides?.[id]?.trim() || azureMap[id] || azureMap['chat-model'];
    if (id === 'chat-model-reasoning') {
      return {
        provider: 'azure' as const,
        modelId,
        model: wrapLanguageModel({
          model: azure(modelId),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
      };
    }
    return { provider: 'azure' as const, modelId, model: azure(modelId) };
  };

  if (preference === 'vertex') {
    if (vertexEnabled) return [makeVertexCandidate()];
    if (groqEnabled) return [makeGroqCandidate()];
    if (azureEnabled) return [makeAzureCandidate()];
  } else if (preference === 'azure') {
    if (azureEnabled) return [makeAzureCandidate()];
    if (groqEnabled) return [makeGroqCandidate()];
    if (vertexEnabled) return [makeVertexCandidate()];
  } else {
    if (groqEnabled) return [makeGroqCandidate()];
    if (vertexEnabled) return [makeVertexCandidate()];
    if (azureEnabled) return [makeAzureCandidate()];
  }

  // Provide detailed error messages for configuration issues
  const errors: string[] = [];
  if (!groqConfig.isValid) errors.push(`Groq: ${groqConfig.error}`);
  if (!vertexConfig.isValid) errors.push(`Vertex: ${vertexConfig.error}`);
  if (!azureConfig.isValid) errors.push(`Azure: ${azureConfig.error}`);

  throw new Error(
    `No AI provider properly configured. Issues found:\n${errors.join('\n')}\n\nPlease configure at least one provider with the required environment variables.`
  );
}
