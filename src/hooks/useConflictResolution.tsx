import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Conflict {
  id: string;
  type: 'diagnosis' | 'treatment' | 'vaccination' | 'animal';
  localData: any;
  serverData: any;
  localTimestamp: number;
  serverTimestamp: string;
  tableName: string;
}

const CONFLICT_STORAGE_KEY = 'vetix_sync_conflicts';

export const useConflictResolution = () => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Load conflicts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONFLICT_STORAGE_KEY);
    if (stored) {
      try {
        setConflicts(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading conflicts:', error);
      }
    }
  }, []);

  // Save conflicts to localStorage whenever they change
  useEffect(() => {
    if (conflicts.length > 0) {
      localStorage.setItem(CONFLICT_STORAGE_KEY, JSON.stringify(conflicts));
    } else {
      localStorage.removeItem(CONFLICT_STORAGE_KEY);
    }
  }, [conflicts]);

  const detectConflict = useCallback(async (
    localRecord: any,
    tableName: string,
    type: Conflict['type']
  ): Promise<Conflict | null> => {
    try {
      // Check if a server record exists with the same data
      const { data: serverRecord, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', localRecord.id)
        .maybeSingle();

      if (error) throw error;

      // No server record - no conflict
      if (!serverRecord) return null;

      // Compare timestamps - handle different timestamp field names
      const localTimestamp = localRecord.timestamp || localRecord.created_at;
      const serverCreatedAt = (serverRecord as any).created_at;
      const serverUpdatedAt = (serverRecord as any).updated_at;
      const serverTimestamp = new Date(serverUpdatedAt || serverCreatedAt).getTime();
      const localTime = typeof localTimestamp === 'number' ? localTimestamp : new Date(localTimestamp).getTime();

      // If server is newer and data differs, we have a conflict
      if (serverTimestamp > localTime) {
        // Check if data actually differs (excluding timestamps and synced flag)
        const localDataCopy: any = { ...localRecord };
        delete localDataCopy.timestamp;
        delete localDataCopy.synced;
        delete localDataCopy.id;

        const serverDataCopy: any = { ...(serverRecord as any) };
        delete serverDataCopy.created_at;
        delete serverDataCopy.updated_at;
        delete serverDataCopy.id;

        const isDifferent = JSON.stringify(localDataCopy) !== JSON.stringify(serverDataCopy);

        if (isDifferent) {
          return {
            id: localRecord.id,
            type,
            localData: localRecord,
            serverData: serverRecord as any,
            localTimestamp: localTime,
            serverTimestamp: serverUpdatedAt || serverCreatedAt,
            tableName,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting conflict:', error);
      return null;
    }
  }, []);

  const checkForConflicts = useCallback(async (db: IDBDatabase) => {
    setIsCheckingConflicts(true);
    const detectedConflicts: Conflict[] = [];

    try {
      // Check diagnoses for conflicts
      const transaction = db.transaction(['diagnoses'], 'readonly');
      const diagnosisStore = transaction.objectStore('diagnoses');
      const diagnosisIndex = diagnosisStore.index('synced');

      const unsyncedDiagnoses: any[] = await new Promise((resolve) => {
        const request = diagnosisIndex.getAll();
        request.onsuccess = () => {
          const all = request.result;
          resolve(all.filter((item: any) => !item.synced));
        };
      });

      // Check each unsynced diagnosis for conflicts
      for (const diagnosis of unsyncedDiagnoses) {
        const conflict = await detectConflict(diagnosis, 'diagnoses', 'diagnosis');
        if (conflict) {
          detectedConflicts.push(conflict);
        }
      }

      setConflicts(prev => {
        // Merge with existing conflicts, avoiding duplicates
        const merged = [...prev];
        detectedConflicts.forEach(newConflict => {
          const existingIndex = merged.findIndex(c => c.id === newConflict.id && c.type === newConflict.type);
          if (existingIndex === -1) {
            merged.push(newConflict);
          } else {
            merged[existingIndex] = newConflict;
          }
        });
        return merged;
      });
    } catch (error) {
      console.error('Error checking for conflicts:', error);
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [detectConflict]);

  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: 'local' | 'server' | 'merge',
    mergedData?: any
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    try {
      // Open IndexedDB
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('VetixOfflineDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (resolution === 'local') {
        // Keep local version - sync it to server
        const { error } = await supabase
          .from(conflict.tableName as any)
          .upsert({
            ...conflict.localData,
            id: conflict.id,
          });

        if (error) throw error;

        // Mark as synced in IndexedDB
        const transaction = db.transaction(['diagnoses'], 'readwrite');
        const store = transaction.objectStore('diagnoses');
        await new Promise((resolve, reject) => {
          const request = store.put({
            ...conflict.localData,
            synced: true,
          });
          request.onsuccess = resolve;
          request.onerror = () => reject(request.error);
        });

      } else if (resolution === 'server') {
        // Keep server version - update local
        const transaction = db.transaction(['diagnoses'], 'readwrite');
        const store = transaction.objectStore('diagnoses');
        await new Promise((resolve, reject) => {
          const request = store.put({
            ...conflict.serverData,
            synced: true,
            timestamp: new Date(conflict.serverTimestamp).getTime(),
          });
          request.onsuccess = resolve;
          request.onerror = () => reject(request.error);
        });

      } else if (resolution === 'merge' && mergedData) {
        // Use merged data
        const { error } = await supabase
          .from(conflict.tableName as any)
          .upsert({
            ...mergedData,
            id: conflict.id,
          });

        if (error) throw error;

        const transaction = db.transaction(['diagnoses'], 'readwrite');
        const store = transaction.objectStore('diagnoses');
        await new Promise((resolve, reject) => {
          const request = store.put({
            ...mergedData,
            synced: true,
            timestamp: Date.now(),
          });
          request.onsuccess = resolve;
          request.onerror = () => reject(request.error);
        });
      }

      db.close();

      // Remove resolved conflict
      setConflicts(prev => prev.filter(c => c.id !== conflictId));

      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }, [conflicts]);

  const resolveAllAsServer = useCallback(async () => {
    for (const conflict of conflicts) {
      await resolveConflict(conflict.id, 'server');
    }
  }, [conflicts, resolveConflict]);

  const resolveAllAsLocal = useCallback(async () => {
    for (const conflict of conflicts) {
      await resolveConflict(conflict.id, 'local');
    }
  }, [conflicts, resolveConflict]);

  return {
    conflicts,
    conflictCount: conflicts.length,
    isCheckingConflicts,
    checkForConflicts,
    resolveConflict,
    resolveAllAsServer,
    resolveAllAsLocal,
  };
};
