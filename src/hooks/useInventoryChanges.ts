import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch } from '../store';
import { updatePartialInventory } from '../store/businessInventorySlice';
import { updatePartialInventory as updatePartialEconomyInventory } from '../store/economyInventorySlice';
import { MEAL_CATEGORIES } from '../constants';

interface UseInventoryChangesReturn {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: Error | null;
}

interface InventoryChange {
  category: string;
  mealId: string;
  seatsOrdered: Record<string, number>;
  startingInventory: number;
}

const useInventoryChanges = (isEconomy: boolean): UseInventoryChangesReturn => {
  const dispatch = useAppDispatch();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastError, setLastError] = useState<Error | null>(null);
  const changeBuffer = useRef<string>('');

  // Process changes from the document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processDocumentChanges = useCallback((doc: any) => {
    if (!doc) return;
    
    const changes: InventoryChange[] = [];
    
    // Process all categories
    MEAL_CATEGORIES.forEach(category => {
      if (doc[category] && Array.isArray(doc[category])) {
        doc[category].forEach((item) => {
          const mealId = Object.keys(item)[0];
          if (mealId) {
            const mealData = item[mealId];
            changes.push({
              category,
              mealId,
              seatsOrdered: mealData.seatsOrdered || {},
              startingInventory: mealData.startingInventory
            });
          }
        });
      }
    });

    // Dispatch updates immediately if we have changes
    if (changes.length > 0) {
      if (isEconomy) {
        dispatch(updatePartialEconomyInventory(changes));
      } else {
        dispatch(updatePartialInventory(changes));
      }
    }
  }, [dispatch, isEconomy]);

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

          if (value) {
            // Append new data to buffer
            changeBuffer.current += new TextDecoder().decode(value);
            
            // Process complete JSON objects
            let startIndex = 0;
            let endIndex: number;
            
            while ((endIndex = changeBuffer.current.indexOf('\n', startIndex)) !== -1) {
              const line = changeBuffer.current.slice(startIndex, endIndex).trim();
              if (line) {
                try {
                  const change = JSON.parse(line);
                  if (change.doc) {
                    processDocumentChanges(change.doc);
                  }
                } catch (error) {
                  console.error('Error processing change:', error);
                }
              }
              startIndex = endIndex + 1;
            }
            
            // Keep remaining incomplete data in buffer
            changeBuffer.current = changeBuffer.current.slice(startIndex);
          }
        }

      } catch (error: unknown) {
        if ((error as Error).name === 'AbortError') {
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
      changeBuffer.current = '';
      setConnectionStatus('disconnected');
    };
  }, [dispatch, isEconomy, processDocumentChanges]);

  return { connectionStatus, lastError };
};

export default useInventoryChanges;
