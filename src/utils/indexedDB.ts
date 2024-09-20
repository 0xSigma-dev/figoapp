import Cookies from 'js-cookie';

const dbVersion = 10; // Increment this version if you need to update the schema
let dbInstance: IDBDatabase | null = null;
const openConnections: Set<IDBDatabase> = new Set();
const isLongEmail = (email: string): boolean => email.length > 35;
const userId = Cookies.get('userId');



const getDbName = (userId: any): string => {
  if (!userId) {
    throw new Error('User ID is not available.');
  }
  return `AppDatabase_${userId}`;
};


export const initDB = (userId: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      reject('User ID is not available for initialization.');
      return;
    }
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    const dbName = getDbName(userId);
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('channels')) {
        const channelStore = db.createObjectStore('channels', { keyPath: 'id' });
        channelStore.createIndex('friendId', 'friendId', { unique: false });
        channelStore.createIndex('friendName', 'friendName', { unique: false });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('channelId', 'channelId', { unique: false });
        messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        messageStore.createIndex('messageId', 'messageId', { unique: true });
        messageStore.createIndex('status', 'status', { unique: false }); // Add this index
        messageStore.createIndex('timestampDesc', 'timestamp', { unique: false });
      }
    };
    

    request.onsuccess = () => {
      dbInstance = request.result;
      openConnections.add(dbInstance);
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(`IndexedDB error: ${request.error}`);
    };    
  });
};

export const getDBInstance = async (): Promise<IDBDatabase> => {
  const userId = Cookies.get('userId');

  if (!userId) {
    throw new Error('User ID is not set.');
  }

  if (!dbInstance) {
    await initDB(userId);
  }
  return dbInstance!;

};

export const saveContact = async (contact: any): Promise<void> => {
  const db = await getDBInstance();
  const transaction = db.transaction('contacts', 'readwrite');
  const store = transaction.objectStore('contacts');

  return new Promise((resolve, reject) => {
    const request = store.put(contact);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(`Failed to save contact: ${request.error}`);
  });
};

export const getAllContacts = async (): Promise<any[]> => {
  const db = await getDBInstance();
  const transaction = db.transaction('contacts', 'readonly');
  const store = transaction.objectStore('contacts');

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(`Failed to retrieve contacts: ${request.error}`);
  });
};


export const saveUserData = async (userData: any): Promise<void> => {
  const db = await getDBInstance();
  const transaction = db.transaction('user', 'readwrite');
  const store = transaction.objectStore('user');
  
  return new Promise((resolve, reject) => {
    const request = store.put(userData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(`Failed to save user data: ${request.error}`);
  });
};


  export const getUserData = async (userId: any): Promise<any | null> => {
    const db = await getDBInstance();
    const transaction = db.transaction('user', 'readonly');
    const store = transaction.objectStore('user');
  
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(`Failed to retrieve user data: ${request.error}`);
    });
  };

  export async function getContactById(id: string): Promise<any | null> {
    const db = await getDBInstance();
    const transaction = db.transaction('contacts', 'readonly');
    const store = transaction.objectStore('contacts');
  
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(`Failed to retrieve contact: ${request.error}`);
      };
    });
  }

  export const updateUserDataFields = async (userId: string, fieldsToUpdate: Partial<any>): Promise<void> => {
    const db = await getDBInstance();
    const transaction = db.transaction('user', 'readwrite');
    const store = transaction.objectStore('user');
  
    return new Promise<void>((resolve, reject) => {
      const getRequest = store.get(userId);
  
      getRequest.onsuccess = () => {
        const currentData = getRequest.result;
        if (!currentData) {
          reject('User data not found');
          return;
        }
  
        const updatedData = { ...currentData, ...fieldsToUpdate };
        const updateRequest = store.put(updatedData);
  
        updateRequest.onsuccess = () => {
          resolve();
        };
  
        updateRequest.onerror = () => {
          reject(`Failed to update user data: ${updateRequest.error}`);
        };
      };
  
      getRequest.onerror = () => {
        reject(`Failed to retrieve user data: ${getRequest.error}`);
      };
    });
  };

export const deleteUserData = async (userId: string): Promise<void> => {
    const db = await getDBInstance();
    const transaction = db.transaction('user', 'readwrite');
    const store = transaction.objectStore('user');
  
    return new Promise((resolve, reject) => {
      const request = store.delete(userId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(`Failed to delete user data: ${request.error}`);
    });
  };

export const deleteContact = async (contactId: string): Promise<void> => {
    const db = await getDBInstance();
    const transaction = db.transaction('contacts', 'readwrite');
    const store = transaction.objectStore('contacts');
  
    return new Promise((resolve, reject) => {
      const request = store.delete(contactId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(`Failed to delete contact: ${request.error}`);
    });
  };

export const syncContactsFromNavigator = async () => {
  const contactsApi = (navigator as any).contacts;
  if (!contactsApi || !contactsApi.select) {
    return [];
  }

  try {
    const props = ['name', 'email'];
    const opts = { multiple: true };
    const contacts = await contactsApi.select(props, opts);
    const filteredContacts = contacts.filter((contact: any) =>
      contact.email.some((email: any) => isLongEmail(email.address))
    );

    const db = await getDBInstance();
    const transaction = db.transaction('contacts', 'readwrite');
    const store = transaction.objectStore('contacts');

    const allIndexedDBContacts = await getAllContacts();

    const newContacts = filteredContacts.filter((
      contact: any) => !allIndexedDBContacts.some(dbContact => dbContact.id === contact.id)
    );

    for (const contact of newContacts) {
      await saveContact(contact);
    }

    return await getAllContacts();
  } catch (error) {
    return [];
  }
};

export const saveChannel = async (channel: { id: any, name: any, friendId: any, friendAvatar: any, friendName: string }): Promise<void> => {
  const db = await getDBInstance();
  const transaction = db.transaction('channels', 'readwrite');
  const store = transaction.objectStore('channels');

  return new Promise((resolve, reject) => {
    const request = store.put(channel);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(`Failed to save channel: ${request.error}`);
  });
};

export const getAllChannels = async (): Promise<any[]> => {
  const db = await getDBInstance();
  const transaction = db.transaction('channels', 'readonly');
  const store = transaction.objectStore('channels');

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(`Failed to retrieve channels: ${request.error}`);
  });
};

export const saveMessage = async (message: any, id: any, status: any, channelId: any): Promise<void> => {
  const db = await getDBInstance();
  const transaction = db.transaction('messages', 'readwrite');
  const store = transaction.objectStore('messages');
  return new Promise<void>((resolve, reject) => {
    const messageWithId = { ...message, id,  status, channelId, timestamp: new Date().toISOString() };
   
    const request = store.put(messageWithId);

    request.onsuccess = () => {
     
      resolve();
    };

    request.onerror = () => {
      reject(`Failed to save message: ${request.error}`);
    };
  });
};

export const loadMessages = async (channelId: any, status?: string): Promise<any[]> => {
  const db = await getDBInstance();
  const transaction = db.transaction('messages', 'readonly');
  const store = transaction.objectStore('messages');

  return new Promise<any[]>((resolve, reject) => {
    const index = store.index('timestampDesc'); // Using timestamp index to get messages in descending order

    const messages: any[] = [];
    const range = status ? IDBKeyRange.only(status) : null; // Optional status filter

    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.channelId === channelId) {
          messages.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      }
    };

    request.onerror = () => reject(`Failed to retrieve messages: ${request.error}`);
  });
};


export const getLatestMessageForChannel = async (channelId: any): Promise<any | null> => {
  const db = await getDBInstance();
  const transaction = db.transaction('messages', 'readonly');
  const store = transaction.objectStore('messages');
  const index = store.index('timestampDesc'); 

  return new Promise<any | null>((resolve, reject) => {
    const request = index.openCursor(null, 'prev'); 
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.channelId === channelId) {
          resolve(cursor.value);
        } else {
          cursor.continue();
        }
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(`Failed to retrieve the latest message: ${request.error}`);
    };
  });
};

export const getLatestMessagesForAllChannels = async (): Promise<any[]> => {
  const channels = await getAllChannels();
  const latestMessagesPromises = channels.map(channel => getLatestMessageForChannel(channel.id));
  return Promise.all(latestMessagesPromises);
};

const closeAllConnections = async () => {
  for (const db of openConnections) {
    db.close();
  }
  openConnections.clear();
};

export const deleteDatabase = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is not set.');
  }

  await closeAllConnections();

  const dbName = getDbName(userId);
  const request = indexedDB.deleteDatabase(dbName);

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      if (dbInstance) {
        openConnections.delete(dbInstance);
        dbInstance = null;
      }
      resolve();
    };

    request.onerror = () => reject(`Failed to delete database: ${request.error}`);
    request.onblocked = () => reject('Database deletion blocked due to active connections.');
  });
};


export const deleteChannel = async (channelId: string): Promise<void> => {
  const db = await getDBInstance();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['channels', 'messages'], 'readwrite');
    const channelStore = transaction.objectStore('channels');
    const messageStore = transaction.objectStore('messages');

    // Delete the channel
    const deleteChannelRequest = channelStore.delete(channelId);
    deleteChannelRequest.onerror = () => {
      reject(`Failed to delete channel: ${deleteChannelRequest.error}`);
    };

    // Delete associated messages
    const index = messageStore.index('channelId');
    const messagesToDelete: IDBRequest[] = [];
    const deleteMessages = index.openCursor(IDBKeyRange.only(channelId));

    deleteMessages.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const messageRequest = messageStore.delete(cursor.primaryKey);
        messageRequest.onsuccess = () => {
          messagesToDelete.push(messageRequest);
        };
        messageRequest.onerror = () => {
          reject(`Failed to delete message: ${messageRequest.error}`);
        };
        cursor.continue();
      } else {
        // Wait for all messages to be deleted
        Promise.all(messagesToDelete.map(request => {
          return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(`Failed to delete message: ${request.error}`);
          });
        })).then(() => resolve()).catch(reject);
      }
    };

    deleteMessages.onerror = () => {
      reject(`Failed to retrieve messages for deletion: ${deleteMessages.error}`);
    };
  });
};

export const updateMessageStatus = async (messageId: string, status: string, channelName: string): Promise<void> => {
  try {
    // Get database instance
    const db = await getDBInstance();

    // Start a transaction on the 'messages' object store
    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');

    // Get the message by messageId
    const getRequest = store.get(messageId);
    
    getRequest.onsuccess = () => {
      const message = getRequest.result;

      // If the message with the provided ID exists, update its status
      if (message) {
        message.status = status;
        message.channelName = channelName;

        // Save the updated message back to the store
        const updateRequest = store.put(message);

        updateRequest.onsuccess = () => {
         
        };

        updateRequest.onerror = () => {
          
        };
      } else {
      
      }
    };

    getRequest.onerror = () => {
      
    };

    // Wait for the transaction to complete
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(`Transaction failed: ${transaction.error}`);
    });

  } catch (error) {
   
  }
};

export const updateMessagesToRead = async (channelId: string): Promise<void> => {
  try {
    const db = await getDBInstance();
    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const index = store.index('status');  // Access the 'status' index

    // Open cursor to retrieve messages with status 'delivered'
    const request = index.openCursor(IDBKeyRange.only('delivered'));

    request.onsuccess = async (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const message = cursor.value;

        // Check if the message belongs to the current channel
        if (message.channelId === channelId) {
          // Update the status to 'read'
          message.status = 'read';
          const updateRequest = store.put(message);

          updateRequest.onsuccess = () => {
           
          };
          updateRequest.onerror = () => {
           
          };
        }
        cursor.continue();  // Move to the next record
      }
    };

    request.onerror = () => {
     
    };

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(`Transaction failed: ${transaction.error}`);
    });
  } catch (error) {
    //console.error('Error updating messages to read:', error);
  }
};



