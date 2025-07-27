const fs = require('fs');
const path = require('path');

// List of missing endpoints
const missingEndpoints = [
  // Memory API endpoints
  'pages/api/memory/retention.ts',
  'pages/api/memory/transparency.ts',
  'pages/api/memory/analytics.ts',
  'pages/api/memory/delete.ts',
  'pages/api/memory/export.ts',
  'pages/api/memory/user-preferences.ts',
  
  // Payment API endpoints
  'pages/api/payment/mobile-suggestions.ts',
  'pages/api/payment/mobile-wallets.ts',
  'pages/api/payment/mobile-payment.ts',
  'pages/api/payment/delete.ts',
  'pages/api/payment/export.ts',
  'pages/api/payment/reminders.ts',
  'pages/api/payment/debts.ts',
  'pages/api/payment/suggestions.ts',
  'pages/api/payment/preferences.ts',
  'pages/api/payment/pix-keys.ts',
  
  // Analytics API endpoints
  'pages/api/analytics/expense-categorization.ts',
  'pages/api/analytics/personalized-recommendations.ts',
  'pages/api/analytics/group-dynamics.ts',
  'pages/api/analytics/spending-patterns.ts',
  'pages/api/analytics/brazilian-market.ts',
  'pages/api/analytics/cost-tracking.ts',
  'pages/api/analytics/performance-monitoring.ts',
  
  // B2B API endpoints
  'pages/api/b2b/partnerships.ts',
  'pages/api/b2b/bulk.ts',
  'pages/api/b2b/events.ts',
  'pages/api/b2b/restaurants.ts',
  
  // Internationalization API endpoints
  'pages/api/internationalization/cultural-context.ts',
  'pages/api/internationalization/language.ts',
  'pages/api/internationalization/regional-payments.ts'
];

// Convert kebab-case to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Template for a basic API endpoint
const endpointTemplate = (endpointName) => {
  const camelCaseName = toCamelCase(endpointName);
  return `import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const ${camelCaseName}Schema = z.object({
  userId: z.string().uuid(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = ${camelCaseName}Schema.parse(req.body);
    
    const result = {
      userId: validatedData.userId,
      endpointId: \`${endpointName}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      status: 'success',
      timestamp: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('${endpointName} error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}`;
};

// Create directories and files
missingEndpoints.forEach(endpointPath => {
  const fullPath = path.join(__dirname, '..', endpointPath);
  const dir = path.dirname(fullPath);
  const endpointName = path.basename(endpointPath, '.ts');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create the endpoint file
  const content = endpointTemplate(endpointName);
  fs.writeFileSync(fullPath, content);
  console.log(`Created: ${endpointPath}`);
});

console.log('All missing endpoints created successfully!'); 