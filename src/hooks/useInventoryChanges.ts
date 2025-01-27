/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { useAppDispatch } from '../store';
import { fetchBusinessInventory } from '../store/inventorySlice';
import { fetchEconomyInventory } from '../store/economyInventorySlice';

interface UseInventoryChangesReturn {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: Error | null;
}

const useInventoryChanges = (isEconomy: boolean): UseInventoryChangesReturn => {
  const dispatch = useAppDispatch();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastError, setLastError] = useState<Error | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

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

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        setConnectionStatus('connected');
        setLastError(null);

        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // If we get any change, update both inventories
          if (value.length > 1) {
            console.log('Received change:', new TextDecoder().decode(value));
            
            // Clear any existing timer
            if (debounceTimer.current) {
              clearTimeout(debounceTimer.current);
            }
            
            // Set a new debounced timer
            debounceTimer.current = setTimeout(() => {
              if (!isEconomy) {
                dispatch(fetchBusinessInventory());
              } else {
                dispatch(fetchEconomyInventory());
              }
            }, 300); // 300ms debounce delay
          }
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
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
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setConnectionStatus('disconnected');
    };
  }, [dispatch, isEconomy]);

  return { connectionStatus, lastError };
};

export default useInventoryChanges;
