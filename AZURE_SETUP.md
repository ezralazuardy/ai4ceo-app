# Azure OpenAI Setup Guide

This guide will walk you through setting up Azure OpenAI integration with the AI4CEO chat application.

## Prerequisites

- An active Azure subscription
- Access to Azure OpenAI Service (requires approval)
- Admin access to the AI4CEO application

## Step 1: Create Azure OpenAI Resource

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create Azure OpenAI Resource**
   - Click "Create a resource"
   - Search for "Azure OpenAI"
   - Click "Create" on the Azure OpenAI service

3. **Configure Resource Settings**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Region**: Choose a region that supports OpenAI (e.g., East US, West Europe)
   - **Name**: Choose a unique name (this becomes your `AZURE_RESOURCE_NAME`)
   - **Pricing Tier**: Select appropriate tier (Standard S0 recommended)

4. **Complete Creation**
   - Review and create the resource
   - Wait for deployment to complete

## Step 2: Deploy Models

1. **Access Azure OpenAI Studio**
   - Go to [oai.azure.com](https://oai.azure.com)
   - Select your resource

2. **Deploy Required Models**
   Navigate to "Deployments" and create deployments for:

   **Recommended Deployments:**
   ```
   Model: gpt-4.1
   Deployment Name: gpt-4.1
   Version: Latest

   Model: gpt-4.1
   Deployment Name: gpt-4.1
   Version: Latest

   Model: gpt-35-turbo
   Deployment Name: gpt-35-turbo
   Version: Latest
   ```

   > **Note**: Deployment names can be customized, but remember to update the model mappings in the admin panel accordingly.

## Step 3: Get API Credentials

1. **Find Resource Name**
   - In Azure Portal, go to your OpenAI resource
   - The resource name is shown in the "Overview" section
   - This is your `AZURE_RESOURCE_NAME`

2. **Get API Key**
   - In your Azure OpenAI resource, go to "Keys and Endpoint"
   - Copy "KEY 1" or "KEY 2"
   - This is your `AZURE_API_KEY`

3. **Note API Version** (Optional)
   - Default version is `2024-02-01`
   - Check Azure OpenAI documentation for latest version
   - This becomes your `AZURE_API_VERSION`

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Azure OpenAI Configuration
AZURE_RESOURCE_NAME=your-resource-name
AZURE_API_KEY=your-api-key
AZURE_API_VERSION=2024-02-01
```

### Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AZURE_RESOURCE_NAME` | Yes | Name of your Azure OpenAI resource | `my-openai-resource` |
| `AZURE_API_KEY` | Yes | API key from Azure portal | `abc123def456...` |
| `AZURE_API_VERSION` | No | API version (defaults to 2024-02-01) | `2024-02-01` |

## Step 5: Configure Model Mappings

1. **Access Admin Panel**
   - Log in as admin user
   - Navigate to `/admin`
   - Go to "Models" section

2. **Set Provider Preference**
   - Change "Provider Preference" to "Azure"
   - This makes Azure the default provider

3. **Configure Azure Model Mappings**
   - In the "Azure OpenAI Mappings" section
   - Map each model type to your deployment names:

   **Default Mappings:**
   ```
   Chat Model (Small): gpt-4.1
   Chat Model (Large): gpt-4.1
   Chat Model (Reasoning): gpt-4.1
   Title Model: gpt-4.1
   Artifact Model: gpt-4.1
   ```

4. **Save Configuration**
   - Click "Save Configuration"
   - Wait for success confirmation

## Step 6: Test the Integration

1. **Check Provider Health**
   - In admin panel, view the "Provider Health" section
   - Azure should show as "Healthy" with green status
   - Verify deployment count matches your Azure setup

2. **Test Chat Functionality**
   - Create a new chat conversation
   - Send a test message
   - Verify responses are generated using Azure OpenAI

## Troubleshooting

### Common Issues

**1. "Missing required variables" Error**
- Verify `AZURE_RESOURCE_NAME` and `AZURE_API_KEY` are set
- Check for typos in variable names
- Ensure no extra spaces in values

**2. "HTTP 401: Unauthorized" Error**
- Verify API key is correct and not expired
- Check if key has proper permissions
- Try regenerating the API key in Azure portal

**3. "HTTP 404: Not Found" Error**
- Verify resource name is correct
- Ensure resource exists and is active
- Check if resource is in the same region

**4. "No deployments found" Warning**
- Verify models are deployed in Azure OpenAI Studio
- Check deployment names match configuration
- Ensure deployments are in "Succeeded" state

**5. Model Not Responding**
- Check deployment status in Azure OpenAI Studio
- Verify model deployment has sufficient quota
- Try different deployment names

### Health Check Endpoint

You can check provider health programmatically:

```bash
curl -X GET /admin/api/providers/health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Debug Steps

1. **Verify Environment Variables**
   ```bash
   echo $AZURE_RESOURCE_NAME
   echo $AZURE_API_KEY
   echo $AZURE_API_VERSION
   ```

2. **Test Azure API Directly**
   ```bash
   curl -X GET \
     "https://YOUR_RESOURCE.openai.azure.com/openai/deployments?api-version=2024-02-01" \
     -H "api-key: YOUR_API_KEY"
   ```

3. **Check Application Logs**
   - Look for Azure-related errors in application logs
   - Check for network connectivity issues
   - Verify API rate limits are not exceeded

## Best Practices

### Security
- Store API keys securely using environment variables
- Rotate API keys regularly
- Use separate resources for development/production
- Enable Azure monitoring and alerts

### Cost Optimization
- Monitor token usage in Azure portal
- Set up budget alerts
- Use appropriate model sizes for different use cases
- Implement request caching where possible

### Performance
- Choose Azure regions close to your users
- Use gpt-4.1 for simple tasks
- Reserve gpt-4.1 for complex reasoning tasks
- Monitor response times and adjust accordingly

### Monitoring
- Enable Azure OpenAI logging
- Set up health check monitoring
- Track model usage patterns
- Monitor error rates and response times

## Model Recommendations

### By Use Case

**Chat Model (Small)**: `gpt-4.1`
- Fast responses for simple queries
- Cost-effective for high-volume usage
- Good for general conversation

**Chat Model (Large)**: `gpt-4.1`
- Complex reasoning and analysis
- Long-form content generation
- Advanced problem solving

**Chat Model (Reasoning)**: `gpt-4.1`
- Step-by-step problem solving
- Mathematical calculations
- Logical reasoning tasks

**Title Model**: `gpt-4.1`
- Quick title generation
- Lightweight processing
- High throughput capability

**Artifact Model**: `gpt-4.1`
- Code generation
- Document creation
- Complex content formatting

## Support

For additional help:

1. **Azure OpenAI Documentation**: [docs.microsoft.com](https://docs.microsoft.com/azure/cognitive-services/openai/)
2. **Azure Support**: Create support ticket in Azure portal
3. **Application Issues**: Check application logs and health endpoints
4. **Model Issues**: Verify deployments in Azure OpenAI Studio

## API Rate Limits

Be aware of Azure OpenAI rate limits:

- **Requests per minute**: Varies by model and region
- **Tokens per minute**: Model-specific limits
- **Concurrent requests**: Usually 10-100 depending on deployment

Monitor usage in Azure portal and implement proper error handling for rate limit scenarios.
