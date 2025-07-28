import React from 'react';
import Head from 'next/head';
import AdvancedComplianceDashboard from '../components/AdvancedComplianceDashboard';

const AdvancedComplianceTest: React.FC = () => {
  return (
    <>
      <Head>
        <title>Advanced Compliance Test - RachaAI</title>
        <meta name="description" content="Test advanced international compliance features" />
      </Head>
      
      <AdvancedComplianceDashboard />
    </>
  );
};

export default AdvancedComplianceTest; 