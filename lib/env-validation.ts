/**
 * Environment Variable Validation for AI Providers
 *
 * This module provides utilities to validate environment variables
 * required for different AI providers and gives helpful error messages.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  provider: string;
}

export interface ProviderValidation {
  groq: ValidationResult;
  vertex: ValidationResult;
  azure: ValidationResult;
}

/**
 * Validates Groq environment configuration
 */
export function validateGroqEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.GROQ_API_KEY) {
    errors.push('GROQ_API_KEY is required but not set');
  } else if (process.env.GROQ_API_KEY.length < 20) {
    warnings.push('GROQ_API_KEY appears to be too short (should be at least 20 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    provider: 'groq',
  };
}

/**
 * Validates Google Vertex AI environment configuration
 */
export function validateVertexEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.GOOGLE_VERTEX_PROJECT) {
    errors.push('GOOGLE_VERTEX_PROJECT is required but not set');
  }

  if (!process.env.GOOGLE_VERTEX_LOCATION) {
    errors.push('GOOGLE_VERTEX_LOCATION is required but not set');
  } else {
    // Validate common regions
    const validLocations = [
      'us-central1', 'us-east1', 'us-west1', 'us-west4',
      'europe-west1', 'europe-west4', 'asia-northeast1',
      'asia-southeast1'
    ];

    if (!validLocations.includes(process.env.GOOGLE_VERTEX_LOCATION)) {
      warnings.push(`GOOGLE_VERTEX_LOCATION "${process.env.GOOGLE_VERTEX_LOCATION}" is not a commonly used region`);
    }
  }

  if (!process.env.GOOGLE_VERTEX_API_KEY) {
    warnings.push('GOOGLE_VERTEX_API_KEY not set (will use Application Default Credentials)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    provider: 'vertex',
  };
}

/**
 * Validates Azure OpenAI environment configuration
 */
export function validateAzureEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.AZURE_RESOURCE_NAME) {
    errors.push('AZURE_RESOURCE_NAME is required but not set');
  } else {
    // Validate resource name format (should be alphanumeric and hyphens only)
    const resourceNamePattern = /^[a-zA-Z0-9-]+$/;
    if (!resourceNamePattern.test(process.env.AZURE_RESOURCE_NAME)) {
      errors.push('AZURE_RESOURCE_NAME contains invalid characters (only alphanumeric and hyphens allowed)');
    }
  }

  if (!process.env.AZURE_API_KEY) {
    errors.push('AZURE_API_KEY is required but not set');
  } else if (process.env.AZURE_API_KEY.length < 32) {
    warnings.push('AZURE_API_KEY appears to be too short (should be at least 32 characters)');
  }

  if (!process.env.AZURE_API_VERSION) {
    warnings.push('AZURE_API_VERSION not set (will use default: 2024-02-01)');
  } else {
    // Validate API version format (YYYY-MM-DD)
    const versionPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!versionPattern.test(process.env.AZURE_API_VERSION)) {
      warnings.push('AZURE_API_VERSION format should be YYYY-MM-DD (e.g., 2024-02-01)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    provider: 'azure',
  };
}

/**
 * Validates all AI provider configurations
 */
export function validateAllProviders(): ProviderValidation {
  return {
    groq: validateGroqEnv(),
    vertex: validateVertexEnv(),
    azure: validateAzureEnv(),
  };
}

/**
 * Gets a list of configured (valid) providers
 */
export function getConfiguredProviders(): string[] {
  const validation = validateAllProviders();
  const configured: string[] = [];

  if (validation.groq.isValid) configured.push('groq');
  if (validation.vertex.isValid) configured.push('vertex');
  if (validation.azure.isValid) configured.push('azure');

  return configured;
}

/**
 * Checks if at least one AI provider is properly configured
 */
export function hasValidProvider(): boolean {
  return getConfiguredProviders().length > 0;
}

/**
 * Gets detailed validation summary for debugging
 */
export function getValidationSummary(): {
  hasValidProvider: boolean;
  configuredProviders: string[];
  totalErrors: number;
  totalWarnings: number;
  details: ProviderValidation;
} {
  const details = validateAllProviders();
  const configuredProviders = getConfiguredProviders();

  const totalErrors = Object.values(details).reduce((sum, result) => sum + result.errors.length, 0);
  const totalWarnings = Object.values(details).reduce((sum, result) => sum + result.warnings.length, 0);

  return {
    hasValidProvider: configuredProviders.length > 0,
    configuredProviders,
    totalErrors,
    totalWarnings,
    details,
  };
}

/**
 * Prints validation results to console (useful for debugging)
 */
export function printValidationResults(): void {
  const summary = getValidationSummary();

  console.log('\n=== AI Provider Configuration Validation ===');
  console.log(`Status: ${summary.hasValidProvider ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Configured Providers: ${summary.configuredProviders.join(', ') || 'None'}`);
  console.log(`Total Errors: ${summary.totalErrors}`);
  console.log(`Total Warnings: ${summary.totalWarnings}`);

  Object.values(summary.details).forEach((result) => {
    console.log(`\n--- ${result.provider.toUpperCase()} Provider ---`);
    console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);

    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach((error: string) => console.log(`  ❌ ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('Warnings:');
      result.warnings.forEach((warning: string) => console.log(`  ⚠️  ${warning}`));
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('  ✅ No issues found');
    }
  });

  console.log('\n===========================================\n');
}

/**
 * Throws an error if no valid providers are configured
 */
export function requireValidProvider(): void {
  if (!hasValidProvider()) {
    const summary = getValidationSummary();
    const errorMessages = Object.values(summary.details)
      .filter(result => !result.isValid)
      .map(result => `${result.provider}: ${result.errors.join(', ')}`)
      .join('\n');

    throw new Error(
      `No AI provider is properly configured. Please fix the following issues:\n\n${errorMessages}\n\nRefer to the setup documentation for help.`
    );
  }
}

/**
 * Environment variable helper with better error messages
 */
export function getRequiredEnv(name: string, description?: string): string {
  const value = process.env[name];
  if (!value) {
    const desc = description ? ` (${description})` : '';
    throw new Error(`Environment variable ${name} is required${desc} but not set`);
  }
  return value;
}

/**
 * Environment variable helper with default value
 */
export function getEnvWithDefault(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}
