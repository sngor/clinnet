/**
 * Dark Theme Specific Overrides
 * Optimized overrides that are only loaded for dark theme
 */

import { designSystem } from '../tokens/index.js';

export const darkThemeOverrides = {
    // Dark-specific component overrides
    MuiCard: {
        styleOverrides: {
            root: {
                // Dark theme specific card styling
                background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',

                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                },
            },
        },
    },

    MuiButton: {
        styleOverrides: {
            containedPrimary: {
                // Enhanced gradient for dark theme
                background: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 50%, #42a5f5 100%)',
                color: '#0d1117',
                boxShadow: '0 4px 16px rgba(144, 202, 249, 0.3)',

                '&:hover': {
                    background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 50%, #2196f3 100%)',
                    boxShadow: '0 8px 24px rgba(144, 202, 249, 0.4)',
                },
            },

            outlined: {
                borderColor: 'rgba(144, 202, 249, 0.5)',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#90caf9',

                '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                    borderColor: '#90caf9',
                },
            },

            text: {
                color: '#90caf9',

                '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                },
            },
        },
    },

    MuiPaper: {
        styleOverrides: {
            root: {
                // Dark theme paper with subtle texture
                backgroundImage: 'linear-gradient(145deg, rgba(30,30,30,0.95) 0%, rgba(42,42,42,0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
            },

            elevation1: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
            },

            elevation2: {
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)',
            },

            elevation3: {
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
            },
        },
    },

    MuiAppBar: {
        styleOverrides: {
            root: {
                // Dark theme app bar with glassmorphism
                backgroundColor: 'rgba(30, 30, 30, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
            },
        },
    },

    MuiTableCell: {
        styleOverrides: {
            head: {
                // Dark theme table headers
                backgroundColor: 'rgba(144, 202, 249, 0.08)',
                borderBottom: '2px solid rgba(144, 202, 249, 0.2)',
                color: '#90caf9',
            },

            root: {
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
            },
        },
    },

    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:nth-of-type(even)': {
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                },

                '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                },
            },
        },
    },

    // Dark theme specific form styling
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                color: '#ffffff',

                '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                },

                '&:hover': {
                    backgroundColor: 'rgba(42, 42, 42, 0.9)',

                    '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                },

                '&.Mui-focused': {
                    backgroundColor: 'rgba(42, 42, 42, 1)',
                    boxShadow: '0 0 0 3px rgba(144, 202, 249, 0.2)',

                    '& fieldset': {
                        borderColor: '#90caf9',
                    },
                },
            },

            input: {
                color: '#ffffff',

                '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                },
            },
        },
    },

    MuiInputLabel: {
        styleOverrides: {
            root: {
                color: 'rgba(255, 255, 255, 0.7)',

                '&.Mui-focused': {
                    color: '#90caf9',
                },
            },
        },
    },

    // Dark theme alerts with enhanced contrast
    MuiAlert: {
        styleOverrides: {
            standardSuccess: {
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderLeft: '4px solid #4caf50',
                color: '#81c784',
            },

            standardError: {
                backgroundColor: 'rgba(244, 67, 54, 0.15)',
                borderLeft: '4px solid #f44336',
                color: '#e57373',
            },

            standardWarning: {
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                borderLeft: '4px solid #ff9800',
                color: '#ffb74d',
            },

            standardInfo: {
                backgroundColor: 'rgba(144, 202, 249, 0.15)',
                borderLeft: '4px solid #90caf9',
                color: '#90caf9',
            },
        },
    },

    // Dark theme specific scrollbar
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',

                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                },
            },
        },
    },

    // Dark theme chip styling
    MuiChip: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
            },

            colorPrimary: {
                backgroundColor: 'rgba(144, 202, 249, 0.2)',
                color: '#90caf9',
                border: '1px solid rgba(144, 202, 249, 0.3)',
            },

            colorSecondary: {
                backgroundColor: 'rgba(206, 147, 216, 0.2)',
                color: '#ce93d8',
                border: '1px solid rgba(206, 147, 216, 0.3)',
            },
        },
    },
};

export default darkThemeOverrides;