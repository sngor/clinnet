/**
 * UnifiedFlex Component
 *
 * A flexible layout system with design token-based spacing and alignment utilities.
 * Provides consistent flexbox layouts with responsive behavior.
 *
 * Features:
 * - Design token-based spacing
 * - Flexible direction and alignment options
 * - Responsive behavior
 * - Consistent gap system
 * - Wrap and nowrap options
 * - Theme-aware styling
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { spacing } from "../../../design-system/tokens/spacing.js";
import { breakpoints } from "../../../design-system/tokens/index.js";

const StyledFlex = styled(Box, {
  shouldForwardProp: (prop) =>
    !["direction", "align", "justify", "gap", "wrap", "responsive"].includes(
      prop
    ),
})(
  ({
    direction = "row",
    align = "stretch",
    justify = "flex-start",
    gap = "md",
    wrap = false,
    responsive,
  }) => {
    // Gap size mapping
    const gapMap = {
      xs: spacing[1], // 8px
      sm: spacing[2], // 16px
      md: spacing[3], // 24px
      lg: spacing[4], // 32px
      xl: spacing[6], // 48px
      xxl: spacing[8], // 64px
    };

    const gapValue = gapMap[gap] || gapMap.md;

    const baseStyles = {
      display: "flex",
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      gap: gapValue,
      flexWrap: wrap ? "wrap" : "nowrap",
    };

    // Responsive behavior
    if (responsive) {
      return {
        ...baseStyles,
        // Stack vertically on mobile for row layouts
        [`@media (max-width: ${breakpoints.sm})`]: {
          ...(direction === "row" && {
            flexDirection: "column",
            alignItems: "stretch",
          }),
        },
      };
    }

    return baseStyles;
  }
);

/**
 * UnifiedFlex Component
 *
 * @param {Object} props - Component props
 * @param {'row'|'column'|'row-reverse'|'column-reverse'} props.direction - Flex direction
 * @param {'flex-start'|'flex-end'|'center'|'stretch'|'baseline'} props.align - Align items
 * @param {'flex-start'|'flex-end'|'center'|'space-between'|'space-around'|'space-evenly'} props.justify - Justify content
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'xxl'} props.gap - Gap size between flex items
 * @param {boolean} props.wrap - Whether items should wrap
 * @param {boolean} props.responsive - Apply responsive behavior (stack on mobile)
 * @param {React.ElementType} props.as - HTML element to render as
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {React.ReactNode} props.children - Flex items
 */
const UnifiedFlex = React.forwardRef(
  (
    {
      direction = "row",
      align = "stretch",
      justify = "flex-start",
      gap = "md",
      wrap = false,
      responsive = false,
      as = "div",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledFlex
        ref={ref}
        component={as}
        direction={direction}
        align={align}
        justify={justify}
        gap={gap}
        wrap={wrap}
        responsive={responsive}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </StyledFlex>
    );
  }
);

UnifiedFlex.displayName = "UnifiedFlex";

export default UnifiedFlex;
