import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const userId = authorization.split(' ')[1];

  try {
    // Fetch the user data from the 'users' table using userId
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user data directly
    return res.status(200).json({ user });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}








