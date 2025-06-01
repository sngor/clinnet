import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, useMediaQuery, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export const drawerWidth = 240;

const Sidebar = ({ open, onClose, navItems }) => {
  const theme = useTheme();
  const isPermanent = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component={RouterLink} to="/" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold' }}>
          HealthApp Menu
        </Typography>
      </Toolbar>
      <List sx={{ p: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={!isPermanent ? onClose : null} // Close temporary drawer on item click
            sx={{
              borderRadius: theme.shape.borderRadius,
              margin: theme.spacing(0.5, 0),
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {isPermanent ? (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)', // Softer border
              backgroundColor: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
