import React, { useEffect, useRef, useState } from 'react';

const QuickSightDashboard = () => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Wait for the global SDK to be available
        const QuickSightEmbedding = window.QuickSightEmbedding;
        if (!QuickSightEmbedding) {
          throw new Error('QuickSight SDK not loaded. Check network tab.');
        }

        // 2. Create an embedding context (async)
        const embeddingContext = await QuickSightEmbedding.createEmbeddingContext();

        // 3. Fetch the authenticated embed URL from your backend
        const response = await fetch('http://localhost:8001/api/embed-url');
        if (!response.ok) {
          throw new Error('Failed to fetch embed URL');
        }
        const { embedUrl } = await response.json();

        if (!containerRef.current) {
          throw new Error('Container ref not available');
        }

        // 4. Embed the dashboard using the context
        const dashboard = embeddingContext.embedDashboard({
          url: embedUrl,
          container: containerRef.current,
          parameters: {},
          scrolling: "no",
          height: "800px",
          width: "100%",
          loadingHeight: "800px",
          loadingWidth: "100%"
        });

        const timeoutId = setTimeout(() => {
          setError('Dashboard load timed out – check console for errors');
          setLoading(false);
        }, 15000);

        dashboard.on('load', () => {
          clearTimeout(timeoutId);
          setLoading(false);
        });

        dashboard.on('error', (err) => {
          clearTimeout(timeoutId);
          console.error('Dashboard error:', err);
          setError(`Failed to load dashboard: ${err.message || 'Unknown error'}`);
          setLoading(false);
        });

      } catch (err) {
        console.error('Error:', err);
        setError(`Could not load dashboard: ${err.message}`);
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Call Analysis Dashboard</h2>
      {loading && <div>Loading dashboard...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div 
        ref={containerRef} 
        style={{ 
          height: '800px', 
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }} 
      />
    </div>
  );
};

export default QuickSightDashboard;