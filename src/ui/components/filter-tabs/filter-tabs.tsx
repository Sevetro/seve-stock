import { advancedFilterPanelId } from '../advanced-filters';
import { basicFilterPanelId } from '../basic-filters';
import { filterTabs } from './filter-tabs.module.scss';

export type FilterTab = 'basic' | 'advanced';

export const basicFilterTabId = 'tab-basic';
export const advancedFilterTabId = 'tab-advanced';

interface FilterTabsProps {
  activeFiltersTab: FilterTab
  changeFiltersTab: (tab: FilterTab) => void
  advancedFiltersEnabled: boolean
}

export const FilterTabs = ({ activeFiltersTab, changeFiltersTab, advancedFiltersEnabled }: FilterTabsProps) => (
  <header className={filterTabs} role='tablist'>
    <button
      role="tab"
      id={basicFilterTabId}
      aria-controls={basicFilterPanelId}
      aria-selected={activeFiltersTab === 'basic'}
      onClick={() => changeFiltersTab('basic')}
    >
      Basic
    </button>

    <button
      role="tab"
      id={advancedFilterTabId}
      aria-controls={advancedFilterPanelId}
      aria-selected={activeFiltersTab === 'advanced'}
      onClick={() => changeFiltersTab('advanced')}
    >
      {advancedFiltersEnabled ? 'Advanced (active)' : 'Advanced'}
    </button>
  </header>
);