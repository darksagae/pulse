// Very simple test without complex imports
import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Next step: Test Supabase connection</p>
    </div>
  );
};

export default SimpleTest;
