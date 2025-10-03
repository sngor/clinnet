/**
 * UnifiedGrid Component
 *
 * A responsive grid system with mobile-first breakpoints and design token integration.
 * Supports flexible column configurations and consistent spacing.
 *
 * Features:
 * - Mobile-first responsive breakpoints
 * - Flexible column configuration (1-12 columns)
 * - Design token-based spacing
 * - Auto-fit and auto-fill grid options
 * - Consistent gap system
 * - Theme-aware styling
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { spacing, gridSpacing } from "../../../design-system/tokens/spacing.js";
import { breakpoints } from "../../../design-system/tokens/index.js";

const StyledGrid = styled(Box, {
  shouldForwardProp: (prop) =>
    !["columns", "gap", "autoFit", "autoFill", "minItemWidth"].includes(prop),
})(
  ({
    columns = 1,
    gap = "md",
    autoFit = false,
    autoFill = false,
    minItemWidth = "250px",
  }) => {
    // Gap size mapping
    const gapMap = {
      xs: spacing[2], // 16px
      sm: spacing[3], // 24px
      md: spacing[4], // 32px
      lg: spacing[6], // 48px
      xl: spacing[8], // 64px
    };

    const gapValue = gapMap[gap] || gapMap.md;

    // Base grid styles
    const baseStyles = {
      display: "grid",
      gap: gapValue,
      width: "100%",
    };

    // Auto-fit or auto-fill grid
    if (autoFit || autoFill) {
      const repeatFunction = autoFit ? "auto-fit" : "auto-fill";
      return {
        ...baseStyles,
        gridTemplateColumns: `repeat(${repeatFunction}, minmax(${minItemWidth}, 1fr))`,
      };
    }

    // Responsive column configuration
    if (typeof columns === "object") {
      const styles = { ...baseStyles };

      // Default (mobile-first)
      const defaultColumns =
        columns.xs ||
        columns.sm ||
        columns.md ||
        columns.lg ||
        columns.xl ||
        columns["2xl"] ||
        1;
      styles.gridTemplateColumns = `repeat(${defaultColumns}, 1fr)`;

      // Apply responsive breakpoints
      Object.entries(columns).forEach(([breakpoint, cols]) => {
        if (breakpoints[breakpoint] && cols) {
          const mediaQuery = `@media (min-width: ${breakpoints[breakpoint]})`;
          styles[mediaQuery] = {
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          };
        }
      });

      return styles;
    }

    // Simple column count
    return {
      ...baseStyles,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    };
  }
);

/**
 * UnifiedGrid Component
 *
 * @param {Object} props - Component props
 * @param {number|Object} props.columns - Number of columns or responsive object
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.gap - Gap size between grid items
 * @param {boolean} props.autoFit - Use auto-fit for responsive columns
 * @param {boolean} props.autoFill - Use auto-fill for responsive columns
 * @param {string} props.minItemWidth - Minimum width for auto-fit/auto-fill items
 * @param {React.ElementType} props.as - HTML element to render as
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {React.ReactNode} props.children - Grid items
 */
const UnifiedGrid = React.forwardRef(
  (
    {
      columns = 1,
      gap = "md",
      autoFit = false,
      autoFill = false,
      minItemWidth = "250px",
      as = "div",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledGrid
        ref={ref}
        component={as}
        columns={columns}
        gap={gap}
        autoFit={autoFit}
        autoFill={autoFill}
        minItemWidth={minItemWidth}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </StyledGrid>
    );
  }
);

UnifiedGrid.displayName = "UnifiedGrid";

export default UnifiedGrid;
