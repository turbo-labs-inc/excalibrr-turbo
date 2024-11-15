import {
  FilterFilled,
  PushpinOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { GraviGridProps } from '@components/GraviGrid/index.types'
import { AgGridReact } from 'ag-grid-react'
import { Col, Input, Row, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useRowPinning } from '..'

import { GraviButton } from '../Controls/Buttons/GraviButton'
import { Texto } from '../DataDisplay/Texto/Texto'
import {
  DynamicFiltersForm,
  Filter,
  Param,
} from '../Grid/SearchGridHeader/DynamicFiltersForm'
import { FilterTags } from '../Grid/SearchGridHeader/FilterTags'
import { Horizontal } from './Horizontal'

type Props<T extends Record<string, any>> = {
  gridRef: React.RefObject<AgGridReact<T>>
  showSelectedCount: boolean | undefined
  title?: string
  onSearch: (e: any) => void
  serverParams?: Param[]
  setFilters?: (filters: Filter) => void
  filters?: Filter
  hiddenFilterKeys?: string[]
  actionButtons?: React.ReactNode
  customFilterDrawer?: JSX.Element
  customSearchBar?: React.ReactNode
  rowCount?: number
  pinnedRowIds?: ReturnType<typeof useRowPinning<T>>['pinnedRowIds']
  onRowUnpinnedAll?: () => void
  showUnpinAllButton?: boolean
}

export const GridControlBar: React.FC<Props<any>> = ({
  gridRef,
  showSelectedCount,
  title,
  onSearch,
  actionButtons,
  serverParams,
  setFilters,
  hiddenFilterKeys,
  filters,
  customFilterDrawer,
  customSearchBar,
  rowCount,
  pinnedRowIds,
  onRowUnpinnedAll,
  showUnpinAllButton,
}) => {
  const [showFilterDrawer, toggleFilter] = useState(false)
  return (
    <>
      <div className='flex px-4 page-control-bar'>
        <Horizontal className='p-3' style={{ gap: '1rem' }}>
          <GridTitle
            title={title ?? ''}
            gridRef={gridRef}
            showSelectedCount={showSelectedCount}
            rowCount={rowCount}
          />
          {showUnpinAllButton && pinnedRowIds && pinnedRowIds.length > 0 && (
            <GraviButton
              className='square-ish'
              onClick={onRowUnpinnedAll}
              icon={<PushpinOutlined />}
              buttonText={`Clear Pinned (${pinnedRowIds.length})`}
            />
          )}
        </Horizontal>

        {onSearch && (
          <div className='flex-1 vertical-flex-center'>
            <SearchBar
              onSearch={onSearch}
              serverParams={serverParams}
              showFilterDrawer={showFilterDrawer}
              toggleFilter={toggleFilter}
              customFilterDrawer={customFilterDrawer}
              customSearchBar={customSearchBar}
            />
          </div>
        )}

        <div className='pl-3 flex-1 flex justify-end items-center'>
          {actionButtons}
        </div>
      </div>

      <FilterTags
        params={serverParams}
        hiddenFilterKeys={hiddenFilterKeys}
        filters={filters}
        setCurrentFilters={setFilters}
      />
      <FilterDrawer
        customFilterDrawer={customFilterDrawer}
        params={serverParams}
        showFilter={showFilterDrawer}
        setFilters={setFilters}
        filters={filters}
      />
    </>
  )
}

type SearchBarProps = {
  onSearch: React.ChangeEventHandler<HTMLInputElement>
  serverParams?: Param[]
  showFilterDrawer?: boolean
  toggleFilter: (show: boolean) => void
  customFilterDrawer?: React.ReactNode
  customSearchBar?: React.ReactNode
}

function SearchBar({
  onSearch,
  serverParams,
  showFilterDrawer,
  toggleFilter,
  customFilterDrawer,
  customSearchBar,
}: SearchBarProps) {
  const showToggle = serverParams || !!customFilterDrawer
  return (
    <Row>
      <Col span={24}>
        <div className='search-control'>
          {showToggle && (
            <div className='vertical-flex-center'>
              <Tooltip title='Query Filters'>
                <GraviButton
                  className='mr-2'
                  theme1={showFilterDrawer}
                  icon={<FilterFilled />}
                  onClick={() => toggleFilter(!showFilterDrawer)}
                />
              </Tooltip>
            </div>
          )}
          {customSearchBar || (
            <Input
              prefix={
                <SearchOutlined
                  className='pr-2'
                  style={{ color: 'var(--gray-500)' }}
                />
              }
              onBlur={(event) => {
                /** This is a stupid hack, but ag-grid (in certain scenarios), will steal focus from the active element
                 * when rows populate the grid with group columns. When search results match and _can_ be expanded,
                 * the grid uses the group columm to expand. This is where the focus is going after the input is blurred.
                 *
                 * Here, we're just checking if the related target (what stole focus) is actually the expand arrow el, and if so,
                 * we're setting focus back to the input. Smells really bad, but the className is the only way I could find to
                 * differentiate between other valid focus scenarios. (like Site Notes on Admin -> Site Management in BBD)
                 *
                 * Update 04/11/2024 a.w
                 * There was anothe scenario where the user enters a search string , clicks a cell to edit, and then focused on the
                 * search bar again, starts typing, it was focusing the cell again and mistakenly overwring the cell. I included a check
                 * for ag-cell, so that the search bar is focused again after results load. but also kept a check for the row-group
                 */
                if (event.relatedTarget) {
                  const relatedTargetClassList = Object.values(
                    event.relatedTarget.classList
                  )
                  const regex = /\bag-cell\b/
                  if (
                    relatedTargetClassList.some((className) => {
                      return (
                        regex.test(className) || className === 'ag-row-group'
                      )
                    })
                  ) {
                    setTimeout(() => {
                      event.target.focus(), [50]
                    })
                  }
                }
              }}
              onChange={onSearch}
              placeholder='Search here'
            />
          )}
        </div>
      </Col>
    </Row>
  )
}

type GridTitleProps<T extends Record<string, any>> = {
  title: string
  gridRef: React.RefObject<AgGridReact<T>>
  showSelectedCount: boolean | undefined
  rowCount?: number
}

function GridTitle({
  title,
  gridRef,
  showSelectedCount,
  rowCount,
}: GridTitleProps<any>) {
  const [visibleRowCount, setVisibleRowCount] = useState(0)
  const updateRowCount = () => {
    if (gridRef && gridRef?.current?.api) {
      let rowCounter = 0

      gridRef?.current?.api?.forEachNodeAfterFilterAndSort((node) => {
        if (!node.group) {
          rowCounter += 1
        }
      })
      setVisibleRowCount(rowCounter)
    } else {
      setVisibleRowCount(rowCount || 0)
    }
  }

  useEffect(() => {
    updateRowCount()
    if (gridRef?.current && gridRef?.current?.api) {
      gridRef.current.api.addEventListener('rowDataUpdated', updateRowCount)
      gridRef.current.api.addEventListener('filterChanged', updateRowCount)
    }

    return () => {
      gridRef?.current?.api?.removeEventListener(
        'rowDataUpdated',
        updateRowCount
      )
      gridRef?.current?.api?.removeEventListener(
        'filterChanged',
        updateRowCount
      )
    }
  }, [gridRef?.current, rowCount])

  const showRowCount = !!visibleRowCount || visibleRowCount === 0
  const selectedCount = gridRef?.current?.api?.getSelectedRows()?.length
  const isSelectedCountVisible = showSelectedCount && !!selectedCount

  return (
    <div className='flex'>
      <div className='flex-1 flex items-center'>
        <Texto category='h4'>{title}</Texto>
        {isSelectedCountVisible && (
          <Texto
            category='h6'
            appearance='secondary'
            className='pl-4 vertical-flex-center'
          >
            {selectedCount} Selected | {visibleRowCount}{' '}
            {visibleRowCount === 1 ? 'Result' : 'Results'}
          </Texto>
        )}
        {!isSelectedCountVisible && showRowCount && (
          <Texto
            category='h6'
            appearance='secondary'
            className='pl-4 vertical-flex-center'
          >
            {visibleRowCount} {visibleRowCount === 1 ? 'Result' : 'Results'}
          </Texto>
        )}
      </div>
    </div>
  )
}

type FilterDrawerProps = {
  showFilter: boolean
  setFilters?: (filters: Filter) => void
  filters?: Filter
  params?: Param[]
  customFilterDrawer?: JSX.Element
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  showFilter,
  setFilters,
  filters,
  params,
  customFilterDrawer,
}) => {
  if (customFilterDrawer) {
    if (showFilter) {
      return customFilterDrawer
    }
    return null
  }
  const renderFilter = showFilter && params && params?.length > 0
  const applyFilters = (values: Filter) => {
    if (setFilters) {
      setFilters({
        ...filters,
        ...Object.entries(values)
          ?.filter(
            ([_k, _v]) =>
              _v !== '' && !((_k === 'From' && !_v) || (_k === 'To' && !_v)) // throw away any keys with an empty string, and ignore From or To resets to undefined
          )
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
      })
    }
  }
  if (!renderFilter) return null
  return (
    <div className='filter-drawer px-5 py-2'>
      <DynamicFiltersForm
        params={params}
        filters={filters!}
        setFilters={setFilters}
        submitFunction={applyFilters}
      />
    </div>
  )
}
