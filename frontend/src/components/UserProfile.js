import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
  { value: 'viewer', label: 'Viewer' }
];

function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  React.useEffect(() => {
    if (user) {
      setEditedUser(user);
      setSelectedRole(user.role || 'viewer');
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateUser(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleOpenRoleDialog = () => {
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleRoleChange = async () => {
    try {
      const updatedUser = { ...editedUser, role: selectedRole };
      await updateUser(updatedUser);
      setEditedUser(updatedUser);
      handleCloseRoleDialog();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (!user) return null;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={user.picture}
            alt={user.name}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="div">
                {user.name}
              </Typography>
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{ ml: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                icon={<SecurityIcon />}
                label={user.role || 'viewer'}
                color="primary"
                onClick={handleOpenRoleDialog}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
        </Box>

        {isEditing ? (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>

      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>Change Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default UserProfile; 