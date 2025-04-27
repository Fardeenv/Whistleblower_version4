import React from 'react';

const Debug = ({ data, title = 'Debug Info' }) => {
  return (
    <div style={{ 
      padding: '10px', 
      background: '#f8f9fa', 
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '10px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 5px' }}>{title}</h4>
      <pre style={{ margin: 0, overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Debug;
