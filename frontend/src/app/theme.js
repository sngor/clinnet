// src/app/theme.js
import { createTheme } from '@mui/material/styles';

// Create a theme instance with consistent styling across the application
// Using a softer, modern color palette with higher accessibility
const theme = createTheme({
  // Customize breakpoints for better mobile and tablet experience
  breakpoints: {
    values: {
      xs: 0,       // Mobile phones (portrait)
      sm: 600,     // Mobile phones (landscape) and small tablets
      md: 960,     // Tablets and small laptops
      lg: 1280,    // Desktops and laptops
      xl: 1536,    // Large desktops
    },
  },
  palette: {
    primary: {
      main: '#4361ee',       // Modern blue with higher vibrancy
      light: '#738aff',
      dark: '#2541b2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#7209b7',      // Rich purple
      light: '#9d4edd',
      dark: '#560a86',
      contrastText: '#fff',
    },
    error: {
      main: '#ef476f',      // Vibrant but soft red
      light: '#ff7096',
      dark: '#d03056',
      contrastText: '#fff',
    },
    warning: {
      main: '#fca311',      // Optimistic amber
      light: '#ffb84d',
      dark: '#e18700',
      contrastText: '#fff',
    },
    info: {
      main: '#00b4d8',      // Fresh cyan
      light: '#4bd6f2',
      dark: '#0096b7',
      contrastText: '#fff',
    },
    success: {
      main: '#06d6a0',      // Mint green - fresher and more modern
      light: '#56ebc1',
      dark: '#00a87a',
      contrastText: '#fff',
    },
    background: {
      default: '#f7f7f7',   // Changed to very light grey
      paper: '#fff',        // Keep paper white for cards, etc.
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  fontSizes: { // New section
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
  shape: {
    borderRadius: 16,  // Further increased border radius for an even softer look
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fff', // Changed to pure white
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f8f9fd',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d0d9f0',
            borderRadius: '3px',
          },
          // Add smooth scrolling
          scrollBehavior: 'smooth',
          // Add a subtle background pattern
          backgroundImage: 'none', // Remove subtle background pattern
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 50, // Pill-shaped buttons
          boxShadow: 'none',
          padding: '10px 22px',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease',
            zIndex: 0,
          },
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 16px rgba(67, 97, 238, 0.15)',
            '&:before': {
              transform: 'scaleX(1)',
            },
          },
          '&:active': {
            transform: 'translateY(-1px)',
            boxShadow: '0 3px 8px rgba(67, 97, 238, 0.2)',
          },
          [theme.breakpoints.down('sm')]: {
            padding: '8px 18px', // Smaller padding on mobile
            fontSize: '0.9rem', // Slightly smaller font on mobile
            minHeight: '42px', // Ensure buttons are tall enough for touch
            // Make touch target larger on mobile
            '&.MuiButton-sizeSmall': {
              minHeight: '38px',
              padding: '6px 16px',
            },
          },
        }),
        containedPrimary: {
          background: 'linear-gradient(45deg, #4361ee, #3a56d4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3a56d4, #2541b2)',
          },
        },
        outlinedPrimary: {
          borderColor: '#4361ee',
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: 'rgba(67, 97, 238, 0.04)',
            borderWidth: '2px',
          },
        },
        // Add text button styling
        text: {
          padding: '8px 16px',
          '&:hover': {
            background: 'rgba(67, 97, 238, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',  // More transparency
          color: '#4361ee',        // Primary text color
          boxShadow: 'none',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          backdropFilter: 'blur(10px) saturate(180%)',
          borderBottom: '1px solid rgba(209, 213, 219, 0.3)',
          borderRadius: 0, // Remove rounded corners from top bar
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          borderRadius: 20,
          border: '1px solid rgba(231, 236, 248, 0.8)',
          // No transition or hover effects for main content cards
          [theme.breakpoints.down('sm')]: {
            borderRadius: 16, // Smaller radius on mobile
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.03)',
          },
        }),
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: '20px 24px 12px',
          [theme.breakpoints.down('sm')]: {
            padding: '16px 16px 10px', // Smaller padding on mobile
          },
        }),
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: '#1a2b4b',  // Darker for better readability
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#64748b',  // Softer secondary text
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: '12px 24px 24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
          [theme.breakpoints.down('sm')]: {
            padding: '10px 16px 20px', // Less padding on mobile
            '&:last-child': {
              paddingBottom: '20px',
            },
          },
        }),
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: 16,
          paddingRight: 16,
          [theme.breakpoints.up('sm')]: {
            paddingLeft: 24,
            paddingRight: 24,
          },
          [theme.breakpoints.up('md')]: {
            paddingLeft: 32,
            paddingRight: 32,
          },
        }),
        maxWidthXs: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('sm')]: {
            maxWidth: 444,
          },
        }),
        maxWidthSm: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('sm')]: {
            maxWidth: 600,
          },
        }),
        maxWidthMd: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('md')]: {
            maxWidth: 900,
          },
        }),
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: 16,
          paddingRight: 16,
          [theme.breakpoints.up('sm')]: {
            paddingLeft: 24,
            paddingRight: 24,
          },
          [theme.breakpoints.up('md')]: {
            paddingLeft: 32,
            paddingRight: 32,
          },
        }),
        maxWidthXs: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('sm')]: {
            maxWidth: 444,
          },
        }),
        maxWidthSm: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('sm')]: {
            maxWidth: 600,
          },
        }),
        maxWidthMd: ({ theme }) => ({
          maxWidth: '100%',
          [theme.breakpoints.up('md')]: {
            maxWidth: 900,
          },
        }),
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          // Ensure no animations on hover for main content
          transition: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.07)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 20px',
          fontSize: '0.925rem',
          borderBottom: '1px solid rgba(209, 213, 219, 0.4)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(243, 246, 249, 0.5)',
          color: '#334155', // Slate-700
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          // Only change background color on hover, not transform
          transition: 'background-color 0.2s ease-in-out',
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(243, 246, 249, 0.4)', // Very light gray for even rows
          },
          '&:hover': {
            backgroundColor: 'rgba(224, 231, 246, 0.2)', // Light primary color on hover
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          padding: '2px 2px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
        label: {
          padding: '0 12px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
          padding: 4,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.35rem',
          fontWeight: 700,
          padding: '24px 24px 16px',
          color: '#1a2b4b',  // Darker text for better readability
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          borderWidth: '1.5px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'rgba(68, 115, 202, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(68, 115, 202, 0.15)',
            }
          }
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.925rem',
          minHeight: 48,
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#4473ca',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '12px 16px',
        },
        icon: {
          marginRight: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(33, 33, 33, 0.9)',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'rgba(68, 115, 202, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(68, 115, 202, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'box-shadow 0.2s ease',
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(68, 115, 202, 0.15)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.15)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(68, 115, 202, 0.5)',
          },
        },
        input: {
          padding: '14px 16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: '#4473ca',
          },
        },
      },
    },
  },
});

export default theme;