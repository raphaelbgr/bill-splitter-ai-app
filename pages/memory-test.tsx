import React from 'react';
import Head from 'next/head';
import MemoryContextUI from '../components/MemoryContextUI';

const MemoryTestPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Memory & Context UI - Story 5.3</title>
        <meta name="description" content="Memory and Context UI with LGPD compliance" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <MemoryContextUI />
      </div>
    </>
  );
};

export default MemoryTestPage; 