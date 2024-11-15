import type {
  ColDef,
  ColumnApi,
  GetRowIdParams,
  GridApi,
} from 'ag-grid-community'
import type { AgGridReactProps } from 'ag-grid-react'
import { type MutableRefObject, type ReactNode } from 'react'

import type { Filter, Param } from '../Grid/SearchGridHeader/DynamicFiltersForm'
import { ChangeMeta } from './BulkChangeBar'
import type { useDirtyGridChanges } from './hooks/useDirtyGrid'
import { useRowPinning } from './RowPinning/useRowPinning'

// Normally, we would never call getRowId directly. It is called by ag grid indirectly and as a result,
// other variables are passed to the function. We're just taking advantage of the same function to get the row id
// when diffing the rows.
export type CallableGetRowId<T> = (
  params: Pick<GetRowIdParams<T>, 'data'>
) => T[keyof T]

export type BulkCellEditorHandle<T> = {
  getChanges: (row: T) => Partial<T>
  isChangeReady: () => boolean
}

export type ControlBarProps = {
  title?: string
  showSelectedCount?: boolean
  customSearchBar?: ReactNode
  actionButtons?: ReactNode
  serverParams?: Param[]
  filters?: Filter
  setFilters?: (filters: Filter) => void
  customFilterDrawer?: JSX.Element
  hiddenFilterKeys?: string[]
  defaultFilter?: Filter
}

export type GraviGridProps<T extends Record<string, any>> = {
  children?: ReactNode
  loading?: boolean
  rowData?: T[]
  columnDefs: Array<ColDef<T>>
  columnDefaultOverrides?: AgGridReactProps<T>['defaultColDef']
  controlBarProps?: ControlBarProps
  externalRef?: React.MutableRefObject<GridApi>
  columnApiRef?: React.MutableRefObject<ColumnApi>
  primaryKey?: keyof T
  storageKey?: string
  updateEP?: (row: T | T[], meta?: ChangeMeta<T>) => Promise<any>
  createEP?: (row: T | T[], meta?: ChangeMeta<T>) => Promise<any>
  createConfig?: any
  createSelectOptions?: any
  shouldInsertCreated?: boolean
  showColumnsToolbar?: boolean
  supressPivot?: boolean
  spreadCreateResponse?: boolean
  customFilterDrawer?: ReactNode
  hideSaveDisplay?: boolean
  onGridConfigChanged?: any
  isDirtyEdit?: boolean
  onDirtyChangeSave?: any
  onDirtyChangeDiscard?: any
  dirtyChangesRef?: MutableRefObject<ReturnType<typeof useDirtyGridChanges<T>>> // should be a ref to the dirtyGridApi
  isBulkChangeVisible?: boolean
  setIsBulkChangeVisible?: React.Dispatch<React.SetStateAction<boolean>>
  bulkDrawerTitle?: string
  onSelectionChanged?: AgGridReactProps['onSelectionChanged']
  toolPanelWidth?: number
  agPropOverrides: Partial<AgGridReactProps<T> & { frameworkComponents?: any }>
  suppressSaveMessage?: boolean
  hideBulkSaveButtons?: boolean
  enableRowPinning?: boolean
  rowPinningRef?: React.MutableRefObject<ReturnType<typeof useRowPinning<T>>>
  pinnedRowPosition?: 'top' | 'bottom'
  showUnpinAllButton?: boolean
  bulkChangePropertiesComparator?: (a: ColDef<T>, b: ColDef<T>) => number
}
