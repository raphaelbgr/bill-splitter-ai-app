import React from 'react';
import Head from 'next/head';
import InternationalComplianceDashboard from '../components/InternationalComplianceDashboard';

const InternationalComplianceTest: React.FC = () => {
  return (
    <>
      <Head>
        <title>International Compliance Test - RachaAI</title>
        <meta name="description" content="Test international compliance and legal framework features" />
      </Head>
      
      <InternationalComplianceDashboard />
    </>
  );
};

export default InternationalComplianceTest; 