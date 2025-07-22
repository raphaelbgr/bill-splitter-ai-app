import Head from 'next/head';
import ChatTest from '../components/ChatTest';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>RachaAI - Claude Integration Test</title>
        <meta name="description" content="Testing Claude integration for Brazilian AI-first bill splitter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-100 py-8">
        <ChatTest />
      </main>
    </>
  );
} 