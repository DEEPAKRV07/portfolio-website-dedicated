// Binary assets stay in IndexedDB; content documents contain only stable references.
const DATABASE = 'portfolio-v3-media';
const STORE = 'assets';
export const LOCAL_MEDIA = /^local-media:([a-zA-Z0-9-]{1,100})$/;
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('Media storage is unavailable in this browser. Use a hosted media URL.'));
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not open browser media storage.'));
  });
}
export async function saveLocalMedia(id, file) {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(file, id);
      tx.oncomplete = resolve;
      tx.onerror = tx.onabort = () => reject(new Error('Media storage is full or unavailable. Use a hosted URL or remove unused media.'));
    });
    return `local-media:${id}`;
  } finally { database.close(); }
}
export async function readLocalMedia(source) {
  const match = LOCAL_MEDIA.exec(source);
  if (!match) throw new Error('Invalid local media reference.');
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(STORE).objectStore(STORE).get(match[1]);
      request.onsuccess = () => request.result ? resolve(request.result) : reject(new Error('This local media is missing from this browser. Reattach it or use a hosted URL.'));
      request.onerror = () => reject(new Error('Could not read local media.'));
    });
  } finally { database.close(); }
}
export function createMediaResolver() {
  const owned = new Map(); let disposed = false;
  return {
    async resolve(source) {
      if (!LOCAL_MEDIA.test(source)) return source;
      if (owned.has(source)) return owned.get(source);
      const blob = await readLocalMedia(source);
      if (disposed) throw new Error('Media view was closed.');
      if (owned.has(source)) return owned.get(source);
      const url = URL.createObjectURL(blob); owned.set(source, url); return url;
    },
    dispose() { disposed = true; for (const url of owned.values()) URL.revokeObjectURL(url); owned.clear(); }
  };
}
