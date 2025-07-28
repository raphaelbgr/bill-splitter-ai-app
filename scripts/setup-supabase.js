const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupSupabase() {
  console.log('🚀 RachaAI Supabase Setup\n');
  console.log('This script will help you configure Supabase for the RachaAI project.\n');

  console.log('📋 Prerequisites:');
  console.log('1. Create a Supabase project at https://supabase.com');
  console.log('2. Select São Paulo (Brazil) region for LGPD compliance');
  console.log('3. Get your project URL and API keys\n');

  const questions = [
    {
      name: 'url',
      message: 'Enter your Supabase project URL (e.g., https://abc123.supabase.co): ',
      validate: (input) => input.includes('supabase.co') ? true : 'Please enter a valid Supabase URL'
    },
    {
      name: 'anonKey',
      message: 'Enter your Supabase anon/public key: ',
      validate: (input) => input.length > 20 ? true : 'Please enter a valid anon key'
    },
    {
      name: 'serviceKey',
      message: 'Enter your Supabase service role key (optional, for admin operations): ',
      validate: (input) => input.length === 0 || input.length > 20 ? true : 'Please enter a valid service key or leave empty'
    }
  ];

  const answers = {};

  for (const question of questions) {
    const answer = await askQuestion(question.message);
    
    if (question.validate) {
      const validation = question.validate(answer);
      if (validation !== true) {
        console.log(`❌ ${validation}`);
        process.exit(1);
      }
    }
    
    answers[question.name] = answer;
  }

  // Read current .env.local
  let envContent = '';
  try {
    envContent = fs.readFileSync('.env.local', 'utf8');
  } catch (error) {
    console.log('⚠️ .env.local not found, creating new file...');
  }

  // Update Supabase variables
  const updates = {
    'NEXT_PUBLIC_SUPABASE_URL': answers.url,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': answers.anonKey,
    'SUPABASE_SERVICE_ROLE_KEY': answers.serviceKey || 'your_supabase_service_role_key_here'
  };

  let updatedContent = envContent;

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(updatedContent)) {
      updatedContent = updatedContent.replace(regex, `${key}=${value}`);
    } else {
      updatedContent += `\n${key}=${value}`;
    }
  }

  // Write updated .env.local
  try {
    fs.writeFileSync('.env.local', updatedContent);
    console.log('\n✅ Environment variables updated successfully!');
  } catch (error) {
    console.log('❌ Error updating .env.local:', error.message);
    process.exit(1);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Run the database schema:');
  console.log('   - Go to your Supabase dashboard');
  console.log('   - Navigate to SQL Editor');
  console.log('   - Copy and run the content from docs/architecture/story-2-database-schema.sql');
  console.log('\n2. Test the connection:');
  console.log('   npm run test:supabase');
  console.log('\n3. Test authentication:');
  console.log('   npm run dev');
  console.log('   Then visit http://localhost:3000/auth-test');
  console.log('\n4. For detailed setup instructions, see:');
  console.log('   docs/development/supabase-setup-guide.md');

  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

setupSupabase().catch(console.error); 