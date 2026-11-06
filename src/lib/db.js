import { openDB } from 'idb';

const DB_NAME = 'depthforge-db';
const STORE_NAME = 'models';
const DB_VERSION = 1;

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('title', 'title');
      }
    },
  });
}

/**
 * Save a model to IndexedDB.
 * Model shape:
 * {
 *   id: string,
 *   title: string,
 *   createdAt: number (timestamp),
 *   settings: object,
 *   imageBlob: Blob,
 *   depthData: ArrayBuffer (from Float32Array),
 *   depthWidth: number,
 *   depthHeight: number,
 *   thumbnailBlob: Blob
 * }
 */
export async function saveModel(model) {
  const db = await getDB();
  await db.put(STORE_NAME, model);
  return model;
}

/**
 * Retrieve a single model by id.
 */
export async function getModel(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

/**
 * Retrieve all models, sorted newest-first by createdAt.
 */
export async function getAllModels() {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete a model by id.
 */
export async function deleteModel(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Rename a model by id.
 */
export async function renameModel(id, newTitle) {
  const db = await getDB();
  const model = await db.get(STORE_NAME, id);
  if (!model) {
    throw new Error(`Model with id "${id}" not found`);
  }
  model.title = newTitle;
  await db.put(STORE_NAME, model);
  return model;
}
