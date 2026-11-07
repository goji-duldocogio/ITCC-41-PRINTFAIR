/* local  PDF storage. PDF bytes stay in IndexedDB, never localStorage */
(() => {
  'use strict';
  const DB_NAME = 'printfair-local-files';
  const STORE = 'documents';
  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Local document storage could not be opened.'));
    });
  }
  async function run(mode, callback) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      try { result = callback(store); } catch (error) { reject(error); db.close(); return; }
      tx.oncomplete = () => { db.close(); resolve(result?.result); };
      tx.onerror = () => { db.close(); reject(tx.error || new Error('Local document storage failed.')); };
      tx.onabort = () => { db.close(); reject(tx.error || new Error('Local document storage was interrupted.')); };
    });
  }
  window.PrintFairFiles = Object.freeze({
    put: (key, file) => run('readwrite', store => store.put(file, key)),
    get: key => run('readonly', store => store.get(key)),
    remove: key => run('readwrite', store => store.delete(key))
  });
})();
