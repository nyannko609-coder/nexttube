import { Router } from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/api/oauth/callback';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

router.get('/login', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  res.cookie('oauth_state', state, { httpOnly: true, maxAge: 600000 });
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    scope: 'user:email',
    state,
  });
  
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const cookieState = req.cookies.oauth_state;
  
  if (state !== cookieState) {
    return res.status(400).send('State mismatch');
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });
    
    const tokenData = await tokenResponse.json() as any;
    
    if (!tokenData.access_token) {
      return res.status(400).send('Failed to get access token');
    }
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const user = await userResponse.json() as GitHubUser;
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Redirect to home
    res.redirect('/');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth error');
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

export default router;
