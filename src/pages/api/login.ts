import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path if necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //console.log('Received request:', req.method, req.body);

  if (req.method !== 'POST') {
    //console.log('Method not allowed:', req.method);
    return res.status(405).end(); // Method Not Allowed
  }

  const { publicKey } = req.body;
  //console.log('Public key from request:', publicKey);

  if (!publicKey) {
    //console.log('No public key provided');
    return res.status(400).json({ message: 'Public key is required' });
  }

  try {
    // Fetch users with the given public key
    //console.log('Fetching user with public key:', publicKey);
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, username, publicKey')
      .eq('publicKey', publicKey)
      .single(); // Assuming public_key is a unique field

    if (fetchError || !users) {
      //console.log('User fetch error:', fetchError);
      return res.status(400).json({ message: 'User not found' });
    }

    const { username } = users;
    //console.log('Fetched user:', users);

    if (!username) {
      //console.log('Username not found for the provided public key');
      return res.status(400).json({ message: 'Username not found for the provided public key' });
    }

    // Sign in with Supabase Auth
    //console.log('Signing in with email:', `${username}@figoapp.xyz`);
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username}@figoapp.xyz`,
      password: publicKey
    });

    if (authError || !session) {
      //console.log('Auth error:', authError);
      return res.status(500).json({ 
        message: 'Error during sign in', 
        error: authError ? authError.message : 'Unknown error' 
      });
    }

    // Retrieve access token
    const accessToken = session.access_token;
    //console.log('Successfully signed in. Access token:', accessToken);

    return res.status(200).json({ 
      message: 'Signed in successfully', 
      user: { public: users }, 
      accessToken 
    });

  } catch (error) {
    //console.error('Error checking credentials:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error checking credentials: ' + error.message });
    }
    return res.status(500).json({ message: 'Error checking credentials: An unknown error occurred' });
  }
}










