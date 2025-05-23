
export interface DBSchema {
  contacts: {
    key: string;
    value: {
      id: string;
      name: string;
      phone: string;
      lastContact: string;
      tags: string[];
      status: "active" | "inactive";
    };
  };
  chats: {
    key: string;
    value: {
      id: string;
      name: string;
      phone: string;
      lastMessage: string;
      timestamp: string;
      unread: number;
      status: "active" | "ended";
    };
  };
  messages: {
    key: string;
    value: {
      id: string;
      content: string;
      timestamp: string;
      type: "sent" | "received";
      chatId: string;
    };
  };
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'whatslyDB';
  private readonly DB_VERSION = 1;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('chatId', 'chatId', { unique: false });
        }
      };
    });
  }

  async getAll<T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T]['value'][]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllFrom<T extends keyof DBSchema>(
    storeName: T, 
    indexName: string, 
    value: any
  ): Promise<DBSchema[T]['value'][]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async add<T extends keyof DBSchema>(storeName: T, value: DBSchema[T]['value']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async update<T extends keyof DBSchema>(storeName: T, value: DBSchema[T]['value']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete<T extends keyof DBSchema>(storeName: T, key: DBSchema[T]['key']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const db = new DatabaseService();
