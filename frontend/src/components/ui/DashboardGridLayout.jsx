import React from 'react';
import { Grid } from '@mui/material';
import DashboardCard from './DashboardCard';

/**
 * DashboardGridLayout renders a list of items (typically DashboardCards)
 * in a responsive grid layout.
 *
 * @param {Object} props - Component props
 * @param {Array<Object|React.ReactNode>} props.items - Array of dashboard card configurations or elements.
 *                                                       If objects, they can include responsive grid props (xs, sm, md, lg)
 *                                                       and other props for DashboardCard.
 *                                                       If ReactNodes, they are rendered directly (less common for this component).
 * @param {Object} [props.containerSpacing=3] - Spacing for the Grid container.
 * @param {Object} [props.containerSx] - Optional styles for the Grid container.
 * @param {Object} [props.defaultGridItemProps] - Default props for each Grid item (e.g., xs, sm, md, lg).
 *                                                These are overridden by item-specific props.
 * @param {Object} [props.commonGridItemSx] - Optional common styles for each Grid item's sx prop.
 */
function DashboardGridLayout({
  items = [],
  containerSpacing = 3,
  containerSx = {},
  defaultGridItemProps = { xs: 12, sm: 6, md: 4, lg: 3 },
  commonGridItemSx = {},
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={containerSpacing} sx={{ mb: 4, ...containerSx }}>
      {items.map((itemConfig, index) => {
        // Default item props
        let gridItemSetup = { ...defaultGridItemProps };
        let cardProps = {};
        let cardSx = { width: '100%' }; // Ensure card takes full width of grid item

        if (React.isValidElement(itemConfig)) {
          // If it's already an element, we can't really customize its grid behavior here easily
          // Best to pass configurations for DashboardCards
          return (
            <Grid item {...gridItemSetup} key={index} sx={commonGridItemSx}>
              {itemConfig}
            </Grid>
          );
        }

        // Separate grid props (xs, sm, md, lg) from other card props
        const { xs, sm, md, lg, itemSx, ...restOfItemConfig } = itemConfig;
        gridItemSetup = {
          xs: xs ?? gridItemSetup.xs,
          sm: sm ?? gridItemSetup.sm,
          md: md ?? gridItemSetup.md,
          lg: lg ?? gridItemSetup.lg,
        };
        cardProps = restOfItemConfig;

        // Merge sx from itemConfig (as itemSx) and commonGridItemSx
        const mergedItemSx = { ...commonGridItemSx, ...(itemSx || {}) };

        return (
          <Grid
            item
            {...gridItemSetup}
            key={index}
            sx={{
              display: 'flex', // To ensure card stretches if it's a direct child
              ...mergedItemSx, // Apply merged sx here
            }}
          >
            <DashboardCard {...cardProps} sx={cardSx} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default DashboardGridLayout;
