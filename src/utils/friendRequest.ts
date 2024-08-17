// utils/friendRequest.ts
import Cookies from 'js-cookie';

const friendRequest = async (userId: string, friendId: string) => {
  console.log('friendRequest function called');
  console.log('userId:', userId);
  console.log('friendUsername:', friendId);

  try {
    // Retrieve the JWT token from local storage or other state management
    const token = userId;

    if (!token) {
      console.error('Authorization token not found');
      throw new Error('Authorization token not found');
    }

    console.log('Sending request to /api/sendFriendRequest');

    const response = await fetch('/api/sendFriendRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, friendId }),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response data:', errorData);

      if (response.status === 404) {
        console.error('API endpoint not found (404)');
      } else if (response.status === 401) {
        console.error('Unauthorized (401)');
      } else if (response.status === 403) {
        console.error('Forbidden (403)');
      } else {
        console.error(`Failed to send friend request: ${response.statusText}`);
      }
      throw new Error(`Failed to send friend request: ${errorData.message}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    return data;
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    throw error;
  }
};

export default friendRequest;



  