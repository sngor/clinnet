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
      default: '#fbfbfb',   // Ensure very light grey
      paper: '#fbfbfb',     // Cards and containers also very light grey
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
      fontSize: '2.25rem', // Base for xs
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      '@media (min-width:600px)': { // sm
        fontSize: '2.5rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '3rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem', // Base for xs
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      '@media (min-width:600px)': { // sm
        fontSize: '2.25rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '2.5rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '2.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem', // Base for xs
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      '@media (min-width:600px)': { // sm
        fontSize: '2rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '2.25rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem', // Base for xs
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
      '@media (min-width:600px)': { // sm
        fontSize: '1.75rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '2rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '2.15rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem', // Base for xs
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
      '@media (min-width:600px)': { // sm
        fontSize: '1.375rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '1.5rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '1.625rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem', // Base for xs
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
      '@media (min-width:600px)': { // sm
        fontSize: '1.15rem',
      },
      '@media (min-width:960px)': { // md
        fontSize: '1.25rem',
      },
      '@media (min-width:1280px)': { // lg
        fontSize: '1.3rem',
      },
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem', // Base for xs
      '@media (min-width:960px)': { // md
        fontSize: '1.1rem',
      },
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem', // Base for xs
      '@media (min-width:960px)': { // md
        fontSize: '0.95rem',
      },
    },
    body1: {
      fontSize: '1rem', // Base for xs
      '@media (min-width:960px)': { // md
        fontSize: '1.05rem',
      },
    },
    body2: {
      fontSize: '0.875rem', // Base for xs
      '@media (min-width:960px)': { // md
        fontSize: '0.925rem',
      },
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
          backgroundColor: '#fbfbfb', // Ensure very light grey
          webkitFontSmoothing: "antialiased",
          mozOsxFontSmoothing: "grayscale",
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px', // Consistent with style.css
            height: '8px', // Consistent with style.css
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f5f9', // From style.css
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c7d2fe', // From style.css
            borderRadius: '4px', // From style.css
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#818cf8', // From style.css
          },
          // Add smooth scrolling
          scrollBehavior: 'smooth',
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
        root: ({ theme }) => ({
          backgroundColor: 'rgba(255, 255, 255, 0.9)',  // More transparency
          color: '#4361ee',        // Primary text color
          boxShadow: 'none',
          '-webkit-backdrop-filter': 'blur(10px) saturate(180%)',
          backdropFilter: 'blur(10px) saturate(180%)',
          borderBottom: '1px solid rgba(209, 213, 219, 0.3)',
          borderRadius: 0, // Remove rounded corners from top bar
          // Adjust padding and minHeight for mobile
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
          },
          '& .MuiToolbar-root': {
            minHeight: '56px', // Standard mobile app bar height
            [theme.breakpoints.up('sm')]: {
              minHeight: '64px', // Standard desktop app bar height
            },
          }
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          borderRadius: 20,
          border: '1px solid rgba(231, 236, 248, 0.8)',
          backgroundColor: theme.palette.background.default, // Set card background
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
    MuiBox: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'none',
          backgroundColor: theme.palette.background.default, // Set background color
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          backgroundColor: theme.palette.background.default, // Set paper background
        }),
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
        root: ({ theme }) => ({
          padding: '14px 20px',
          fontSize: '0.925rem',
          borderBottom: '1px solid rgba(209, 213, 219, 0.4)',
          [theme.breakpoints.down('sm')]: {
            padding: '10px 12px', // Reduced padding for sm and xs
            fontSize: '0.85rem', // Reduced font size for sm and xs
          },
        }),
        head: ({ theme }) => ({
          fontWeight: 600,
          backgroundColor: 'rgba(243, 246, 249, 0.5)',
          color: '#334155', // Slate-700
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.8rem', // Reduced font size for sm and xs
          },
        }),
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
          borderRadius: 50, // Changed from 20 to 50
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
        paper: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
          padding: 4,
          [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(2), // Add some margin on small screens
            width: `calc(100% - ${theme.spacing(4)})`, // Ensure it doesn't touch screen edges
            maxWidth: `calc(100% - ${theme.spacing(4)})`, // Override MUI's default maxWidth for Dialog on xs
          },
        }),
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
        root: ({ theme }) => ({
          borderRadius: 10,
          margin: '4px 8px',
          padding: '8px 12px', // Adjust padding for touch targets
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
          [theme.breakpoints.down('sm')]: {
            margin: '2px 4px', // Reduce margin on mobile
            padding: '10px 8px', // Increase padding slightly for easier touch
          },
        }),
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
        input: ({ theme }) => ({ // Make input padding responsive
          padding: '14px 16px',
          [theme.breakpoints.down('sm')]: {
            padding: '12px 14px', // Slightly smaller padding on mobile
            fontSize: '0.95rem', // Adjust font size for mobile inputs
          },
        }),
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