import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';

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


interface Message {
  id: string; // or UUID type
  sender_id: string; // or UUID type
  channel_id: string; // or UUID type
  friend_id: string; // or UUID type
  content: string;
  status: string;
  created_at: string; // or Date type
}

interface ChannelDetails {
  id: string; // or UUID type
  friendDisplayName: string;
  friendAvatar: string;
  // Include other properties if needed
}



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

export const getAllContacts = async (userId: any): Promise<any[]> => {
  try {
    // Fetch the current user to get the friends array
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('friends')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Failed to retrieve user data: ${userError.message}`);
    }

    const friends = user?.friends || [];

    if (friends.length === 0) {
      return [];
    }

    // Fetch details of all friends in the friends array
    const { data: contacts, error: contactsError } = await supabase
      .from('users')
      .select('id, username, displayName, bio, avatar')
      .in('username', friends); // Use the 'username' or 'id' depending on your friends array

    if (contactsError) {
      throw new Error(`Failed to retrieve contacts: ${contactsError.message}`);
    }

    return contacts;
  } catch (error) {
    //console.error('Error fetching contacts:', error);
    return [];
  }
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
  try {
    // Fetch user data from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*') // or specify the fields you need
      .eq('id', userId)
      .single(); // Ensures you get a single user record

    if (error) {
      throw new Error(`Failed to retrieve user data: ${error.message}`);
    }

    return data; // Return the fetched user data
  } catch (error) {
    //console.error(error);
    return null; // Return null in case of error
  }
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
    try {
      const { error } = await supabase
        .from('users')
        .update(fieldsToUpdate) // Update specified fields
        .eq('id', userId); // Match the user by ID
  
      if (error) {
        throw new Error(`Failed to update user data: ${error.message}`);
      }
    } catch (error: any) {
      //console.error(error);
      throw new Error(`Error updating user data: ${error.message}`);
    }
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

export const getAllChannels = async (userId: string): Promise<ChannelDetails[]> => {
  try {
    // Fetch the latest message for each channel where the user is either the sender or the friend
    const { data: latestMessages, error: messageError } = await supabase
      .from('messages') 
      .select(`
        *,
        channel_id,
        created_at
      `)
      .or(`sender_id.eq.${userId},friend_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messageError) throw messageError;

    // Assert that latestMessages is an array of Message
    const messages = latestMessages as Message[]; // Ensure that TypeScript knows it's an array of Message

    // Group the messages by channel_id and keep only the latest one for each channel
    const uniqueChannels = messages.reduce<{ [key: string]: Message }>((acc, message) => {
      if (!acc[message.channel_id]) {
        acc[message.channel_id] = message; // Store the first message for this channel
      } else if (message.created_at > acc[message.channel_id].created_at) {
        acc[message.channel_id] = message; // Replace with the latest message
      }
      return acc;
    }, {});

    // Convert the uniqueChannels object back to an array
    const channels = Object.values(uniqueChannels);

    // Get friend details (avatar and displayName) for each channel
    const channelsWithDetails = await Promise.all(
      channels.map(async (channel) => {
        const friendId = channel.sender_id === userId ? channel.friend_id : channel.sender_id;

        // Check if the friend's details exist in the user's friends list
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('friends')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        let friendDetails;

        if (userData.friends.includes(friendId)) {
          // Get friend's details from friends list
          friendDetails = userData.friends.find((friend: any) => friend.id === friendId);
        } else {
          // Otherwise, fetch the friend's details from the users table
          const { data: friendData, error: friendError } = await supabase
            .from('users')
            .select('displayName, avatar')
            .eq('id', friendId)
            .single();

          if (friendError) throw friendError;

          friendDetails = friendData;
        }

        // Attach friend's displayName and avatar to the channel object
        return {
          ...channel,
          friendDisplayName: friendDetails.displayName,
          friendAvatar: friendDetails.avatar,
          friendId,
        };
      })
    );

    return channelsWithDetails;
  } catch (error) {
   // console.error('Error fetching channels:', error);
    return [];
  }
};

export const countMessagesByChannelAndSender = async (channel_id: any, userId: any) => {
  try {
    //console.log('Counting messages for channel:', channel_id, 'and user:', userId);

    const { data, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('channel_id', channel_id)
      .neq('sender_id', userId)
      .in('status', ['sent', 'delivered']);

    if (error) {
      //console.error('Error fetching messages:', error.message);
      return 0;
    }

    //console.log('Fetched messages:', data);
    return data.length; // Return the count of messages
  } catch (error) {
    //console.error('Caught error:', error);
    return 0;
  }
};













export const getLatestMessageForChannel = async (channelId: string): Promise<any | null> => {
  try {
    const { data: latestMessage, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return latestMessage;
  } catch (error) {
    //console.error('Error fetching latest message:', error);
    return null;
  }
};

export const getLatestMessagesForAllChannels = async (userId: string): Promise<any[]> => {
  const channels = await getAllChannels(userId);
  const latestMessagesPromises = channels.map((channel) => getLatestMessageForChannel(channel.id));
  const latestMessages = await Promise.all(latestMessagesPromises);

  return latestMessages;
};


export const subscribeToNewMessages = (userId: string, onNewMessage: (message: any) => void) => {
  // Create a Supabase channel for real-time message updates
  const channel = supabase
    .channel('new-message-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public', // Your schema (default is 'public')
        table: 'messages', // The table to listen for changes
        filter: `sender_id=eq.${userId},friend_id=eq.${userId}`, // Listen for relevant messages for the user
      },
      async (payload) => {
        const newMessage = payload.new;

        // Fetch the updated channel data with friend's displayName and avatar
        const updatedChannel = await getAllChannels(userId);
        onNewMessage(updatedChannel);
      }
    )
    .subscribe();

  // Cleanup function to unsubscribe on component unmount or similar cases
  return () => {
    channel.unsubscribe();
  };
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



