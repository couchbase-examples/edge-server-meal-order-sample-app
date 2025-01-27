import { useEffect, useState } from 'react';

interface UseInventoryChangesReturn {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: Error | null;
}

const useInventoryChanges = (isEconomy: boolean): UseInventoryChangesReturn => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let retryTimeout: NodeJS.Timeout;

    const connect = async () => {
      try {
        const credentials = btoa('seatuser:password');
        setConnectionStatus('connecting');
        const inventoryCategory = isEconomy ? 'economyinventory' : 'businessinventory';

        const response = await fetch(
          `/american234.AmericanAirlines.AA234/_changes?feed=continuous&include_docs=true&heartbeat=600&since=now&filter=doc_ids&doc_ids=${inventoryCategory}`,
          {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Accept': 'application/json'
            },
            signal: abortController.signal
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setConnectionStatus('connected');
        setLastError(null);

        // Just maintain the connection without processing changes
        await new Promise(() => {}); // Keep connection alive

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        
        setConnectionStatus('error');
        setLastError(error instanceof Error ? error : new Error('Connection failed'));
        
        // Attempt to reconnect after a delay
        retryTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      abortController.abort();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      setConnectionStatus('disconnected');
    };
  }, [isEconomy]);

  return { connectionStatus, lastError };
};

export default useInventoryChanges;
