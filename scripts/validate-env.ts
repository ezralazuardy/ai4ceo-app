#!/usr/bin/env tsx

/**
 * Environment Validation Script
 *
 * This script validates AI provider environment variables and provides
 * helpful feedback for configuration issues.
 *
 * Usage:
 *   npm run validate-env
 *   or
 *   npx tsx scripts/validate-env.ts
 */

import { printValidationResults, requireValidProvider, getValidationSummary } from '../lib/env-validation';

async function main() {
  try {
    console.log('🔍 Validating AI provider environment configuration...\n');

    // Print detailed validation results
    printValidationResults();

    // Get summary for exit code determination
    const summary = getValidationSummary();

    if (summary.hasValidProvider) {
      console.log('✅ Success: At least one AI provider is properly configured!');
      console.log(`📋 Configured providers: ${summary.configuredProviders.join(', ')}`);

      if (summary.totalWarnings > 0) {
        console.log(`⚠️  Note: There are ${summary.totalWarnings} warning(s) that should be addressed.`);
      }

      process.exit(0);
    } else {
      console.log('❌ Error: No AI provider is properly configured.');
      console.log('💡 Please refer to the setup documentation:');
      console.log('   - Azure OpenAI: See AZURE_SETUP.md');
      console.log('   - Groq: Set GROQ_API_KEY');
      console.log('   - Vertex AI: Set GOOGLE_VERTEX_PROJECT and GOOGLE_VERTEX_LOCATION');

      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Script failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}
