// hooks/useFriends.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFriends = (userId: string) => {
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [recommendedFriends, setRecommendedFriends] = useState<any[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}`);
        setFriends(response.data.friends);
        setFriendRequests(response.data.friendRequests);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    const fetchRecommendedFriends = async () => {
      try {
        const response = await axios.get(`/api/recommendFriends?userId=${userId}`);
        setRecommendedFriends(response.data);
      } catch (error) {
        console.error('Error recommending friends:', error);
      }
    };

    fetchFriends();
    fetchRecommendedFriends();
  }, [userId]);

  const sendFriendRequest = async (friendUsername: string) => {
    try {
      await axios.post('/api/sendFriendRequest', { userId, friendUsername });
      setRecommendedFriends(recommendedFriends.filter(user => user.username !== friendUsername));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (friendUsername: string) => {
    try {
      await axios.post('/api/acceptFriendRequest', { userId, friendUsername });
      setFriendRequests(friendRequests.filter(request => request !== friendUsername));
      setFriends([...friends, friendUsername]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const removeFriend = async (friendUsername: string) => {
    try {
      await axios.post('/api/removeFriend', { userId, friendUsername });
      setFriends(friends.filter(friend => friend !== friendUsername));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return { friends, friendRequests, recommendedFriends, sendFriendRequest, acceptFriendRequest, removeFriend };
};

export default useFriends;
