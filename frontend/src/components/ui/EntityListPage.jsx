import React from 'react';
import { PageLayout, ContentCard } from './index'; // Assuming index.js exports these

/**
 * EntityListPage provides a standardized layout for pages that list entities.
 * It includes a PageLayout, a flat ContentCard, and renders a provided
 * list component within the ContentCard.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the PageLayout.
 * @param {string} [props.subtitle] - Subtitle for the PageLayout.
 * @param {React.ComponentType} props.ListRenderComponent - The component to render the list of entities.
 * @param {Object} [props.listProps] - Props to pass to the ListRenderComponent.
 * @param {React.ReactNode} [props.headerAction] - Action element (e.g., "Add New" button) for PageLayout.
 * @param {boolean} [props.loading] - Loading state for PageLayout.
 * @param {any} [props.error] - Error state for PageLayout.
 * @param {Function} [props.onRetry] - Retry function for PageLayout.
 * @param {Object} [props.contentCardSx] - Optional styles for the ContentCard.
 * @param {boolean} [props.noPaddingInContentCard] - If true, ContentCard will have no internal padding.
 */
function EntityListPage({
  title,
  subtitle,
  ListRenderComponent,
  listProps = {},
  headerAction,
  loading,
  error,
  onRetry,
  contentCardSx = {},
  noPaddingInContentCard = false,
}) {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      action={headerAction}
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      <ContentCard
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          ...contentCardSx,
        }}
        noPadding={noPaddingInContentCard}
      >
        {ListRenderComponent ? <ListRenderComponent {...listProps} /> : null}
      </ContentCard>
    </PageLayout>
  );
}

export default EntityListPage;
