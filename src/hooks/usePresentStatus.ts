import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';

const usePresentStatus = (friendId: any) => {
  const [isFriendOnline, setIsFriendOnline] = useState(false);

  useEffect(() => {
    if (!friendId) return;

    // Fetch initial status of the friend
    const fetchFriendStatus = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('status')
        .eq('id', friendId)
        .single();

      if (error) {
        //console.error("Error fetching friend status:", error);
      } else if (data) {
        setIsFriendOnline(data.status); // Set initial status of the friend
      }
    };

    // Fetch the friend's initial status
    fetchFriendStatus();

    // Subscribe to real-time updates for the 'users' table
    const channel = supabase
      .channel('friend-status-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', // Adjust this if your schema is different
          table: 'users', // The table you want to subscribe to
          filter: `id=eq.${friendId}`, // Filter for the specific friend's ID
        },
        (payload) => {
          const updatedStatus = payload.new.status;
          setIsFriendOnline(updatedStatus); // Update online status when the friend's status changes
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe(); // Unsubscribe using the channel object's method
    };
  }, [friendId]);

  return isFriendOnline;
};

export default usePresentStatus;





