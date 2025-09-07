import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface DiagnosisRecord {
  id: string;
  species: string;
  symptoms: string;
  diagnosis: string;
  timestamp: number;
  synced: boolean;
}

const DB_NAME = 'VetixOfflineDB';
const DB_VERSION = 1;

export const useLocalSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('synced', 'synced', { unique: false });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          
          // Create diagnosis records store
          if (!db.objectStoreNames.contains('diagnoses')) {
            const diagnosisStore = db.createObjectStore('diagnoses', { keyPath: 'id' });
            diagnosisStore.createIndex('timestamp', 'timestamp', { unique: false });
            diagnosisStore.createIndex('synced', 'synced', { unique: false });
          }
        };
      });
    };

    initDB().then(setDb).catch(console.error);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingItems();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  // Count pending items
  useEffect(() => {
    if (!db) return;
    
    const countPending = async () => {
      const transaction = db.transaction(['syncQueue', 'diagnoses'], 'readonly');
      const syncStore = transaction.objectStore('syncQueue');
      const diagnosisStore = transaction.objectStore('diagnoses');
      
      const syncIndex = syncStore.index('synced');
      const diagnosisIndex = diagnosisStore.index('synced');
      
      const [syncItems, diagnosisItems] = await Promise.all([
        new Promise<any[]>((resolve) => {
          const request = syncIndex.getAll();
          request.onsuccess = () => resolve(request.result);
        }),
        new Promise<any[]>((resolve) => {
          const request = diagnosisIndex.getAll();
          request.onsuccess = () => resolve(request.result);
        })
      ]);
      
      const syncCount = syncItems.filter(item => !item.synced).length;
      const diagnosisCount = diagnosisItems.filter(item => !item.synced).length;
      
      setPendingCount(syncCount + diagnosisCount);
    };

    countPending();
  }, [db, syncStatus]);

  // Save diagnosis record locally
  const saveDiagnosisLocal = useCallback(async (diagnosis: Omit<DiagnosisRecord, 'id' | 'timestamp' | 'synced'>) => {
    if (!db) return null;

    const record: DiagnosisRecord = {
      id: crypto.randomUUID(),
      ...diagnosis,
      timestamp: Date.now(),
      synced: false
    };

    const transaction = db.transaction(['diagnoses'], 'readwrite');
    const store = transaction.objectStore('diagnoses');
    
    return new Promise<DiagnosisRecord>((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get local diagnosis records
  const getLocalDiagnoses = useCallback(async (): Promise<DiagnosisRecord[]> => {
    if (!db) return [];

    const transaction = db.transaction(['diagnoses'], 'readonly');
    const store = transaction.objectStore('diagnoses');
    const index = store.index('timestamp');
    
    return new Promise((resolve) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
    });
  }, [db]);

  // Add item to sync queue
  const addToSyncQueue = useCallback(async (item: Omit<SyncItem, 'id' | 'timestamp' | 'synced'>) => {
    if (!db) return;

    const syncItem: SyncItem = {
      id: crypto.randomUUID(),
      ...item,
      timestamp: Date.now(),
      synced: false
    };

    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.add(syncItem);
  }, [db]);

  // Sync pending items to Supabase
  const syncPendingItems = useCallback(async () => {
    if (!db || !isOnline || syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    
    try {
      // Sync diagnosis records first
      const transaction = db.transaction(['diagnoses'], 'readwrite');
      const store = transaction.objectStore('diagnoses');
      const index = store.index('synced');
      
      const unsyncedRequest = index.getAll();
      unsyncedRequest.onsuccess = async () => {
        const allRecords = unsyncedRequest.result;
        const unsynced = allRecords.filter(record => !record.synced);
        
        for (const record of unsynced) {
          try {
            // Here you would normally insert into Supabase
            // For now, we'll just mark as synced
            console.log('Syncing diagnosis:', record);
            
            // Mark as synced
            record.synced = true;
            store.put(record);
          } catch (error) {
            console.error('Failed to sync record:', error);
          }
        }
        
        setSyncStatus('idle');
      };
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [db, isOnline, syncStatus]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (isOnline) {
      syncPendingItems();
    }
  }, [isOnline, syncPendingItems]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    saveDiagnosisLocal,
    getLocalDiagnoses,
    addToSyncQueue,
    triggerSync
  };
};