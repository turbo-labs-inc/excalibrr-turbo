export const sidebarCreator = (
  supressPivot = true,
  showColumnToolPanel = false,
  storageKey: string | undefined,
  handleGridReset: () => void,
  toolPanelWidth?: number | string,
  rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never'
) => {
  const sidebar = [
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
      minWidth: 180,
      maxWidth: 400,
      width: 250,
    },
  ]

  if (showColumnToolPanel) {
    const panelWidth =
      toolPanelWidth === 'auto'
        ? 0
        : toolPanelWidth && typeof toolPanelWidth === 'number'
        ? toolPanelWidth
        : 225
    sidebar.push({
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      // TODO: Need to figure out why sidebar.push doesn't like toolPanelParams. Out of date package?
      // @ts-ignore
      toolPanelParams: {
        suppressPivotMode: supressPivot,
        suppressValues: supressPivot,
        suppressPivots: supressPivot,
        suppressRowGroups: rowGroupPanelShow === 'never',
      },
      minWidth: 225,
      maxWidth: toolPanelWidth ? 400 : 225,
      width: panelWidth,
    })
  }

  if (storageKey) {
    const panelWidth =
      toolPanelWidth === 'auto'
        ? 0
        : toolPanelWidth && typeof toolPanelWidth === 'number'
        ? toolPanelWidth
        : 250

    sidebar.push({
      id: 'gridViews',
      labelDefault: 'Grid Views',
      labelKey: 'gridViews',
      // iconKey: 'gridViews',
      toolPanel: 'gridViewPanel',
      // TODO: Need to figure out why sidebar.push doesn't like toolPanelParams. Out of date package?
      // @ts-ignore
      toolPanelParams: {
        onGridReset: handleGridReset,
      },
      minWidth: 180,
      maxWidth: 400,
      width: panelWidth,
    })
  }

  return { toolPanels: sidebar }
}
