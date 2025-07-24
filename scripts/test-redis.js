const Redis = require('ioredis');

// Redis client configuration
const redis = new Redis({
  host: '192.168.7.101',
  port: 6379,
  password: 'tjq5uxt3',
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

async function testRedisConnection() {
  try {
    console.log('🔗 Testing Redis connection...');
    
    // Test basic connection
    await redis.ping();
    console.log('✅ Redis connection successful');
    
    // Check existing keys (read-only)
    const keys = await redis.keys('*');
    console.log(`📊 Found ${keys.length} existing keys`);
    
    // Check if 'wallets' key exists (read-only)
    const walletsExists = await redis.exists('wallets');
    console.log(`🔒 'wallets' key exists: ${walletsExists ? 'YES' : 'NO'}`);
    
    if (walletsExists) {
      console.log('⚠️  WARNING: wallets key exists - will not touch it');
    }
    
    // Test our caching functionality with safe keys
    console.log('\n🧪 Testing RachaAI caching functionality...');
    
    // Test session caching
    const testSessionKey = 'rachaai:test:session:123';
    const testSessionData = {
      userId: '123',
      preferences: { language: 'pt-BR', currency: 'BRL' },
      timestamp: new Date().toISOString()
    };
    
    await redis.setex(testSessionKey, 3600, JSON.stringify(testSessionData));
    console.log('✅ Session caching test successful');
    
    // Test conversation caching
    const testConversationKey = 'rachaai:test:conversation:456';
    const testConversationData = {
      id: '456',
      messages: [
        { role: 'user', content: 'Oi! Paguei R$ 120 no jantar.' },
        { role: 'assistant', content: 'Vou ajudar você a dividir essa conta!' }
      ]
    };
    
    await redis.setex(testConversationKey, 86400, JSON.stringify(testConversationData));
    console.log('✅ Conversation caching test successful');
    
    // Test retrieval
    const retrievedSession = await redis.get(testSessionKey);
    const retrievedConversation = await redis.get(testConversationKey);
    
    if (retrievedSession && retrievedConversation) {
      console.log('✅ Cache retrieval test successful');
    }
    
    // Clean up test keys
    await redis.del(testSessionKey);
    await redis.del(testConversationKey);
    console.log('✅ Test cleanup successful');
    
    // Test health check
    const isHealthy = await redis.ping();
    console.log(`🏥 Redis health check: ${isHealthy === 'PONG' ? 'HEALTHY' : 'UNHEALTHY'}`);
    
    console.log('\n🎉 All Redis tests passed!');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    process.exit(1);
  } finally {
    await redis.quit();
    console.log('🔌 Redis connection closed');
  }
}

// Run the test
testRedisConnection(); 