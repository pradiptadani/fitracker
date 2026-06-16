import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'fitracker-offline';
const STORE_NAME = 'pending-transactions';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export interface QueuedTransaction {
  id?: number;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: unknown;
  timestamp: number;
}

export async function enqueueTransaction(transaction: Omit<QueuedTransaction, 'timestamp'>) {
  const db = getDB();
  if (!db) return null;
  const activeDb = await db;
  return activeDb.add(STORE_NAME, {
    ...transaction,
    timestamp: Date.now(),
  });
}

export async function getPendingTransactions(): Promise<QueuedTransaction[]> {
  const db = getDB();
  if (!db) return [];
  const activeDb = await db;
  return activeDb.getAll(STORE_NAME);
}

export async function dequeueTransaction(id: number) {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  return activeDb.delete(STORE_NAME, id);
}

export async function clearQueue() {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  return activeDb.clear(STORE_NAME);
}
