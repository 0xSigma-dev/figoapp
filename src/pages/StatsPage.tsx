"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import SubHeader from '@/components/SubHeader';

const StatsPage: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('points');

        if (error) {
          return;
        }

        if (users) {
          setUserCount(users.length);

          const total = users.reduce((acc, user) => acc + (user.points || 0), 0);
          setTotalPoints(total);
        }
      } catch (error) {
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-white dark:bg-black text-white h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex ml-20 items-center space-x-4">
        <SubHeader title="Statistics" />
      </div>
      <div className="text-center mt-16">
        <div className="mb-8">
          <p className="text-8xl font-bold text-purple-400 shadow-lg">
            {userCount}
          </p>
          <p className="text-xl font-semibold text-black dark:text-gray-400 mt-2">
            Total Number of Users
          </p>
        </div>
        <div>
          <p className="text-4xl font-bold text-purple-400 shadow-lg">
            {totalPoints}
          </p>
          <p className="text-xl font-semibold text-black dark:text-gray-400 mt-2">
            Total Points Farmed
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;



