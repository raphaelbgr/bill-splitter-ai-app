import '@testing-library/jest-dom';

// Set up test environment variables (excluding Supabase)
process.env.CLAUDE_API_KEY = 'test-claude-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Supabase client to prevent environment variable usage
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' }
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          }
        },
        error: null
      }),
    },
    from: jest.fn((table) => {
      // Create a chainable mock object
      const createChainableMock = () => {
        const mock = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          ne: jest.fn().mockReturnThis(),
          gt: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          like: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          not: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          and: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis(),
          then: jest.fn(),
        };

        // Mock specific table responses
        if (table === 'user_profiles') {
          mock.select.mockResolvedValue({
            data: [{
              id: 'test-user-id',
              email: 'test@example.com',
              display_name: 'Test User',
              timezone: 'America/Sao_Paulo',
              language: 'pt-BR',
              currency: 'BRL',
              notification_preferences: {
                email: true,
                push: true,
                sms: false,
              },
              ai_preferences: {
                language: 'pt-BR',
                formalityLevel: 'informal',
                region: 'BR',
                paymentPreference: 'pix'
              },
              consent_version: '2024.1',
              marketing_consent: false,
              ai_processing_consent: true,
              last_active_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }],
            error: null
          });
          mock.insert.mockResolvedValue({
            data: [{
              id: 'test-user-id',
              email: 'test@example.com',
              display_name: 'Test User',
              timezone: 'America/Sao_Paulo',
              language: 'pt-BR',
              currency: 'BRL',
              notification_preferences: {
                email: true,
                push: true,
                sms: false,
              },
              ai_preferences: {
                language: 'pt-BR',
                formalityLevel: 'informal',
                region: 'BR',
                paymentPreference: 'pix'
              },
              consent_version: '2024.1',
              marketing_consent: false,
              ai_processing_consent: true,
              last_active_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }],
            error: null
          });
          mock.update.mockResolvedValue({
            data: null,
            error: null
          });
        } else if (table === 'group_members') {
          mock.select.mockResolvedValue({
            data: [
              {
                groups: {
                  id: 'test-group-id',
                  name: 'Test Group',
                  description: 'Test group description',
                  group_type: 'friends',
                  default_split_method: 'equal',
                  currency: 'BRL',
                  ai_enabled: true,
                  ai_suggestions_enabled: true,
                  created_at: new Date().toISOString(),
                }
              }
            ],
            error: null
          });
        } else if (table === 'conversations') {
          mock.select.mockResolvedValue({
            data: [{
              id: 'test-conversation-id',
              user_id: 'test-user-id',
              title: 'Test Conversation',
              created_at: new Date().toISOString(),
              retention_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }],
            error: null
          });
        } else {
          // Default response for other tables
          mock.select.mockResolvedValue({
            data: [{
              id: 'test-id',
              created_at: new Date().toISOString(),
            }],
            error: null
          });
          mock.insert.mockResolvedValue({
            data: [{
              id: 'test-id',
              created_at: new Date().toISOString(),
            }],
            error: null
          });
        }

        return mock;
      };

      const mock = createChainableMock();
      
      // Override the then method to return a Promise
      mock.then = function(resolve, reject) {
        return Promise.resolve(mock).then(resolve, reject);
      };
      
      return mock;
    }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
      })),
    },
  })),
}));

// Mock Redis to prevent connection issues in tests
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    hset: jest.fn().mockResolvedValue(1),
    hget: jest.fn().mockResolvedValue(null),
    hgetall: jest.fn().mockResolvedValue({}),
    zadd: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(1),
    zcard: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };
  
  // Create a constructor function that returns the mock
  const MockRedisConstructor = jest.fn().mockImplementation(() => mockRedis);
  
  // Handle both named and default exports
  return {
    Redis: MockRedisConstructor,
    default: MockRedisConstructor,
  };
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 