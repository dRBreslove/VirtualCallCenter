import React from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Apple as AppleIcon,
  Microsoft as MicrosoftIcon,
  Samsung as SamsungIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Pinterest as PinterestIcon,
  Reddit as RedditIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Discord as DiscordIcon,
  Twitch as TwitchIcon
} from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../contexts/AuthContext';

function SocialLogin() {
  const { login: auth0Login } = useAuth0();
  const { instance: msalInstance } = useMsal();
  const { login } = useAuth();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState(null);
  const [customToken, setCustomToken] = React.useState('');

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: response.access_token }),
        });
        const data = await res.json();
        if (data.token) {
          login(data.token);
        }
      } catch (error) {
        console.error('Google login error:', error);
      }
    },
  });

  const handleMicrosoftLogin = async () => {
    try {
      const response = await msalInstance.loginPopup();
      const res = await fetch('http://localhost:3000/api/auth/microsoft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.accessToken }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/github', {
        method: 'GET',
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
      }
    } catch (error) {
      console.error('GitHub login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/apple', {
        method: 'GET',
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
      }
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  const handleSamsungLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/samsung', {
        method: 'GET',
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
      }
    } catch (error) {
      console.error('Samsung login error:', error);
    }
  };

  const handleCustomLogin = async (provider) => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: customToken }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
        setOpenDialog(false);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
    }
  };

  const handleOpenDialog = (provider) => {
    setSelectedProvider(provider);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomToken('');
  };

  const socialProviders = [
    { name: 'google', icon: <GoogleIcon sx={{ color: '#DB4437' }} />, handler: () => handleGoogleLogin() },
    { name: 'microsoft', icon: <MicrosoftIcon sx={{ color: '#00A4EF' }} />, handler: handleMicrosoftLogin },
    { name: 'github', icon: <GitHubIcon sx={{ color: '#333' }} />, handler: handleGitHubLogin },
    { name: 'apple', icon: <AppleIcon sx={{ color: '#000' }} />, handler: handleAppleLogin },
    { name: 'samsung', icon: <SamsungIcon sx={{ color: '#1428A0' }} />, handler: handleSamsungLogin },
    { name: 'linkedin', icon: <LinkedInIcon sx={{ color: '#0077B5' }} />, handler: () => handleOpenDialog('linkedin') },
    { name: 'twitter', icon: <TwitterIcon sx={{ color: '#1DA1F2' }} />, handler: () => handleOpenDialog('twitter') },
    { name: 'facebook', icon: <FacebookIcon sx={{ color: '#4267B2' }} />, handler: () => handleOpenDialog('facebook') },
    { name: 'instagram', icon: <InstagramIcon sx={{ color: '#E4405F' }} />, handler: () => handleOpenDialog('instagram') },
    { name: 'pinterest', icon: <PinterestIcon sx={{ color: '#E60023' }} />, handler: () => handleOpenDialog('pinterest') },
    { name: 'reddit', icon: <RedditIcon sx={{ color: '#FF4500' }} />, handler: () => handleOpenDialog('reddit') },
    { name: 'whatsapp', icon: <WhatsAppIcon sx={{ color: '#25D366' }} />, handler: () => handleOpenDialog('whatsapp') },
    { name: 'telegram', icon: <TelegramIcon sx={{ color: '#0088cc' }} />, handler: () => handleOpenDialog('telegram') },
    { name: 'discord', icon: <DiscordIcon sx={{ color: '#7289DA' }} />, handler: () => handleOpenDialog('discord') },
    { name: 'twitch', icon: <TwitchIcon sx={{ color: '#9146FF' }} />, handler: () => handleOpenDialog('twitch') }
  ];

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Or continue with
        </Typography>
      </Divider>
      
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 2, flexWrap: 'wrap', gap: 2 }}
      >
        {socialProviders.map((provider) => (
          <Tooltip key={provider.name} title={`Sign in with ${provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}`}>
            <IconButton
              onClick={provider.handler}
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              {provider.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Sign in with {selectedProvider?.charAt(0).toUpperCase() + selectedProvider?.slice(1)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Access Token"
            type="text"
            fullWidth
            variant="outlined"
            value={customToken}
            onChange={(e) => setCustomToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => handleCustomLogin(selectedProvider)} variant="contained">
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SocialLogin; 