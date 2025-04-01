import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Create JWT token
    const jwtToken = jwt.sign(
      { 
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Microsoft OAuth
router.post('/microsoft', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.userPrincipalName,
        name: userData.displayName,
        picture: null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Microsoft auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GitHub OAuth
router.get('/github', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });
    const userData = userResponse.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        picture: userData.avatar_url
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Apple OAuth
router.get('/apple', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://appleid.apple.com/auth/token', {
      client_id: process.env.APPLE_CLIENT_ID,
      client_secret: process.env.APPLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    const userData = jwt.decode(tokenResponse.data.id_token);

    const jwtToken = jwt.sign(
      {
        sub: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Samsung OAuth
router.get('/samsung', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenResponse = await axios.post('https://api.samsung.com/oauth2/token', {
      client_id: process.env.SAMSUNG_CLIENT_ID,
      client_secret: process.env.SAMSUNG_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    const userResponse = await axios.get('https://api.samsung.com/v1/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });
    const userData = userResponse.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.profile_image
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Samsung auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// LinkedIn OAuth
router.post('/linkedin', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.emailAddress,
        name: `${userData.localizedFirstName} ${userData.localizedLastName}`,
        picture: userData.profilePicture
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Twitter OAuth
router.post('/twitter', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.data.id,
        email: userData.data.email,
        name: userData.data.name,
        picture: userData.data.profile_image_url
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Facebook OAuth
router.post('/facebook', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token: token
      }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Instagram OAuth
router.post('/instagram', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,username,account_type',
        access_token: token
      }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: `${userData.username}@instagram.com`,
        name: userData.username,
        picture: null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Pinterest OAuth
router.post('/pinterest', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://api.pinterest.com/v3/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.first_name + ' ' + userData.last_name,
        picture: userData.image
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Pinterest auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Reddit OAuth
router.post('/reddit', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: `${userData.name}@reddit.com`,
        name: userData.name,
        picture: userData.icon_img
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Reddit auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// WhatsApp OAuth
router.post('/whatsapp', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://graph.facebook.com/v12.0/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token: token
      }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('WhatsApp auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Telegram OAuth
router.post('/telegram', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://api.telegram.org/bot' + token + '/getMe');
    const userData = response.data.result;

    const jwtToken = jwt.sign(
      {
        sub: userData.id.toString(),
        email: `${userData.username}@telegram.org`,
        name: userData.first_name + ' ' + (userData.last_name || ''),
        picture: null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Discord OAuth
router.post('/discord', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = response.data;

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        name: userData.username,
        picture: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Discord auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Twitch OAuth
router.post('/twitch', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });
    const userData = response.data.data[0];

    const jwtToken = jwt.sign(
      {
        sub: userData.id,
        email: `${userData.login}@twitch.tv`,
        name: userData.display_name,
        picture: userData.profile_image_url
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Twitch auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router; 