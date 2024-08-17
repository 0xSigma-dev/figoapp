// components/FriendsList.tsx
import React from 'react';
import useFriends from '../hooks/useFriends';


interface FriendsListProps {
  userId: string; // Adjust this according to the possible values for the theme prop
}

const FriendsList: React.FC<FriendsListProps> = ({ userId }) => {
  const { friends, friendRequests, recommendedFriends, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends(userId);

  return (
    <div>
      <h3>Friends</h3>
      <ul>
        {friends.map(friend => (
          <li key={friend}>
            {friend}
            <button onClick={() => removeFriend(friend)}>Remove</button>
          </li>
        ))}
      </ul>

      <h3>Friend Requests</h3>
      <ul>
        {friendRequests.map(request => (
          <li key={request}>
            {request}
            <button onClick={() => acceptFriendRequest(request)}>Accept</button>
          </li>
        ))}
      </ul>

      <h3>Recommended Friends</h3>
      <ul>
        {recommendedFriends.map(user => (
          <li key={user.username}>
            {user.displayName} ({user.username})
            <button onClick={() => sendFriendRequest(user.username)}>Add</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
