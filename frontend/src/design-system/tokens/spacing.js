/**
 * Spacing System
 * 8px base unit with consistent scale
 * Provides mathematical harmony and predictable layouts
 */

// Base spacing unit (8px)
const BASE_UNIT = 8;

// Spacing scale using 8px base unit
export const spacing = {
    0: '0px',
    px: '1px',
    0.5: `${BASE_UNIT * 0.5}px`,  // 4px
    1: `${BASE_UNIT * 1}px`,      // 8px
    1.5: `${BASE_UNIT * 1.5}px`,  // 12px
    2: `${BASE_UNIT * 2}px`,      // 16px
    2.5: `${BASE_UNIT * 2.5}px`,  // 20px
    3: `${BASE_UNIT * 3}px`,      // 24px
    3.5: `${BASE_UNIT * 3.5}px`,  // 28px
    4: `${BASE_UNIT * 4}px`,      // 32px
    5: `${BASE_UNIT * 5}px`,      // 40px
    6: `${BASE_UNIT * 6}px`,      // 48px
    7: `${BASE_UNIT * 7}px`,      // 56px
    8: `${BASE_UNIT * 8}px`,      // 64px
    9: `${BASE_UNIT * 9}px`,      // 72px
    10: `${BASE_UNIT * 10}px`,    // 80px
    11: `${BASE_UNIT * 11}px`,    // 88px
    12: `${BASE_UNIT * 12}px`,    // 96px
    14: `${BASE_UNIT * 14}px`,    // 112px
    16: `${BASE_UNIT * 16}px`,    // 128px
    20: `${BASE_UNIT * 20}px`,    // 160px
    24: `${BASE_UNIT * 24}px`,    // 192px
    28: `${BASE_UNIT * 28}px`,    // 224px
    32: `${BASE_UNIT * 32}px`,    // 256px
    36: `${BASE_UNIT * 36}px`,    // 288px
    40: `${BASE_UNIT * 40}px`,    // 320px
    44: `${BASE_UNIT * 44}px`,    // 352px
    48: `${BASE_UNIT * 48}px`,    // 384px
    52: `${BASE_UNIT * 52}px`,    // 416px
    56: `${BASE_UNIT * 56}px`,    // 448px
    60: `${BASE_UNIT * 60}px`,    // 480px
    64: `${BASE_UNIT * 64}px`,    // 512px
    72: `${BASE_UNIT * 72}px`,    // 576px
    80: `${BASE_UNIT * 80}px`,    // 640px
    96: `${BASE_UNIT * 96}px`,    // 768px
};

// Semantic spacing aliases for common use cases
export const semanticSpacing = {
    // Component internal spacing
    component: {
        xs: spacing[1],      // 8px
        sm: spacing[2],      // 16px
        md: spacing[3],      // 24px
        lg: spacing[4],      // 32px
        xl: spacing[6],      // 48px
    },

    // Layout spacing
    layout: {
        xs: spacing[4],      // 32px
        sm: spacing[6],      // 48px
        md: spacing[8],      // 64px
        lg: spacing[12],     // 96px
        xl: spacing[16],     // 128px
        xxl: spacing[20],    // 160px
    },

    // Container padding
    container: {
        xs: spacing[4],      // 32px
        sm: spacing[6],      // 48px
        md: spacing[8],      // 64px
        lg: spacing[12],     // 96px
        xl: spacing[16],     // 128px
    },

    // Section spacing
    section: {
        xs: spacing[8],      // 64px
        sm: spacing[12],     // 96px
        md: spacing[16],     // 128px
        lg: spacing[20],     // 160px
        xl: spacing[24],     // 192px
    },

    // Form field spacing
    form: {
        field: spacing[4],   // 32px - between form fields
        group: spacing[6],   // 48px - between form groups
        section: spacing[8], // 64px - between form sections
    },

    // Card spacing
    card: {
        padding: {
            xs: spacing[3],    // 24px
            sm: spacing[4],    // 32px
            md: spacing[6],    // 48px
            lg: spacing[8],    // 64px
        },
        gap: {
            xs: spacing[2],    // 16px
            sm: spacing[3],    // 24px
            md: spacing[4],    // 32px
            lg: spacing[6],    // 48px
        },
    },

    // Button spacing
    button: {
        padding: {
            xs: `${spacing[1]} ${spacing[2]}`,      // 8px 16px
            sm: `${spacing[1.5]} ${spacing[3]}`,    // 12px 24px
            md: `${spacing[2]} ${spacing[4]}`,      // 16px 32px
            lg: `${spacing[2.5]} ${spacing[5]}`,    // 20px 40px
            xl: `${spacing[3]} ${spacing[6]}`,      // 24px 48px
        },
        gap: spacing[2],     // 16px - gap between button elements
    },

    // Table spacing
    table: {
        cell: {
            xs: spacing[2],    // 16px
            sm: spacing[3],    // 24px
            md: spacing[4],    // 32px
        },
        row: spacing[1],     // 8px - row padding
    },

    // Navigation spacing
    navigation: {
        item: spacing[2],    // 16px - nav item padding
        group: spacing[4],   // 32px - between nav groups
    },
};

// Grid system spacing
export const gridSpacing = {
    gutter: {
        xs: spacing[2],      // 16px
        sm: spacing[3],      // 24px
        md: spacing[4],      // 32px
        lg: spacing[6],      // 48px
        xl: spacing[8],      // 64px
    },

    column: {
        gap: spacing[4],     // 32px - default column gap
    },

    row: {
        gap: spacing[6],     // 48px - default row gap
    },
};

// Responsive spacing modifiers
export const responsiveSpacing = {
    mobile: {
        container: spacing[4],    // 32px
        section: spacing[8],      // 64px
        component: spacing[2],    // 16px
    },

    tablet: {
        container: spacing[6],    // 48px
        section: spacing[12],     // 96px
        component: spacing[3],    // 24px
    },

    desktop: {
        container: spacing[8],    // 64px
        section: spacing[16],     // 128px
        component: spacing[4],    // 32px
    },
};

// Utility function to get spacing value
export const getSpacing = (value) => {
    if (typeof value === 'number') {
        return `${BASE_UNIT * value}px`;
    }
    return spacing[value] || value;
};

// Utility function for responsive spacing
export const getResponsiveSpacing = (breakpoint, type) => {
    return responsiveSpacing[breakpoint]?.[type] || spacing[4];
};