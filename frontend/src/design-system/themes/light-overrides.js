/**
 * Light Theme Specific Overrides
 * Optimized overrides that are only loaded for light theme
 */

import { designSystem } from '../tokens/index.js';

export const lightThemeOverrides = {
    // Light-specific component overrides
    MuiCard: {
        styleOverrides: {
            root: {
                // Light theme specific card styling
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',

                '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
                },
            },
        },
    },

    MuiButton: {
        styleOverrides: {
            containedPrimary: {
                // Enhanced gradient for light theme
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
                boxShadow: '0 3px 12px rgba(25, 118, 210, 0.3)',

                '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #01579b 100%)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
            },

            outlined: {
                borderColor: 'rgba(25, 118, 210, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',

                '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderColor: '#1976d2',
                },
            },
        },
    },

    MuiPaper: {
        styleOverrides: {
            root: {
                // Light theme paper with subtle texture
                backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
            },

            elevation1: {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            },

            elevation2: {
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
            },

            elevation3: {
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.06)',
            },
        },
    },

    MuiAppBar: {
        styleOverrides: {
            root: {
                // Light theme app bar with glassmorphism
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#1a1a1a',
            },
        },
    },

    MuiTableCell: {
        styleOverrides: {
            head: {
                // Light theme table headers
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                borderBottom: '2px solid rgba(25, 118, 210, 0.12)',
            },
        },
    },

    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:nth-of-type(even)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },

                '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
            },
        },
    },

    // Light theme specific form styling
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',

                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },

                '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                },
            },
        },
    },

    // Light theme alerts
    MuiAlert: {
        styleOverrides: {
            standardSuccess: {
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                borderLeft: '4px solid #4caf50',
            },

            standardError: {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                borderLeft: '4px solid #f44336',
            },

            standardWarning: {
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
                borderLeft: '4px solid #ff9800',
            },

            standardInfo: {
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                borderLeft: '4px solid #2196f3',
            },
        },
    },
};

export default lightThemeOverrides;