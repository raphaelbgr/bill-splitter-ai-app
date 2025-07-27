import fs from 'fs';
import path from 'path';

describe('API Endpoints Exist', () => {
  const apiDir = path.join(__dirname, '../pages/api');
  
  const expectedEndpoints = [
    // AI endpoints
    'ai/chat.ts',
    'ai/advanced-portuguese-nlp.ts',
    
    // Auth endpoints
    'auth/signup.ts',
    'auth/signin.ts',
    
    // Memory endpoints
    'memory/consent.ts',
    'memory/retention.ts',
    'memory/transparency.ts',
    'memory/analytics.ts',
    'memory/delete.ts',
    'memory/export.ts',
    'memory/user-preferences.ts',
    
    // Payment endpoints
    'payment/mobile-suggestions.ts',
    'payment/mobile-wallets.ts',
    'payment/mobile-payment.ts',
    'payment/delete.ts',
    'payment/export.ts',
    'payment/reminders.ts',
    'payment/debts.ts',
    'payment/suggestions.ts',
    'payment/preferences.ts',
    'payment/pix-keys.ts',
    
    // Analytics endpoints
    'analytics/expense-categorization.ts',
    'analytics/personalized-recommendations.ts',
    'analytics/group-dynamics.ts',
    'analytics/spending-patterns.ts',
    'analytics/brazilian-market.ts',
    'analytics/cost-tracking.ts',
    'analytics/performance-monitoring.ts',
    
    // B2B endpoints
    'b2b/partnerships.ts',
    'b2b/bulk.ts',
    'b2b/events.ts',
    'b2b/restaurants.ts',
    
    // Internationalization endpoints
    'internationalization/cultural-context.ts',
    'internationalization/language.ts',
    'internationalization/regional-payments.ts',
    
    // Automation endpoints
    'automation/analytics.ts',
    'automation/group-recommendations.ts',
    'automation/categorize.ts',
    'automation/predictive-splitting.ts',
    
    // Premium endpoints
    'premium/add-payment-method.ts',
    'premium/cancel.ts',
    'premium/subscribe.ts',
    'premium/payment-methods.ts',
    'premium/usage.ts',
    'premium/subscription.ts',
    'premium/plans.ts',
    
    // Push notification endpoints
    'push/send-test.ts',
    'push/subscribe.ts',
    'push/unsubscribe.ts',
    
    // Feedback endpoints
    'feedback/submit.ts'
  ];

  test('should have all expected API endpoints', () => {
    expectedEndpoints.forEach(endpoint => {
      const filePath = path.join(apiDir, endpoint);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have valid TypeScript files', () => {
    expectedEndpoints.forEach(endpoint => {
      const filePath = path.join(apiDir, endpoint);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has default export
      expect(content).toMatch(/export default/);
      
      // Check if file has proper Next.js API handler structure
      expect(content).toMatch(/NextApiRequest/);
      expect(content).toMatch(/NextApiResponse/);
    });
  });

  test('should have proper directory structure', () => {
    const directories = [
      'ai',
      'auth', 
      'memory',
      'payment',
      'analytics',
      'b2b',
      'internationalization',
      'automation',
      'premium',
      'push',
      'feedback'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(apiDir, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });
}); 