import { CloseOutlined, FilterFilled } from '@ant-design/icons'
import { Button } from 'antd'
import moment from 'moment'

import { BBDTag } from '../../DataDisplay/BBDTag'
import { Texto } from '../../DataDisplay/Texto/Texto'
import { Horizontal } from '../../Layout/Horizontal'
import {
  DropdownOptionObject,
  Filter,
  isKeyValueArray,
  Param,
} from './DynamicFiltersForm'

type Props = {
  filters?: Filter
  setCurrentFilters?: (filters: Filter) => void
  setSearchValue?: (value: string) => void
  hiddenFilterKeys?: string[]
  params?: Param[]
}

export const FilterTags: React.FC<Props> = ({
  filters = {},
  setCurrentFilters,
  setSearchValue,
  hiddenFilterKeys = [],
  params,
}) => {
  const validTags = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      !hiddenFilterKeys.includes(key.toLowerCase()) &&
      !(Array.isArray(value) && value.length === 0)
  )
  if (validTags.length === 0) return null

  return (
    <Horizontal verticalCenter className='px-4 bg-theme1'>
      <Horizontal verticalCenter flex='0 1 auto'>
        <Texto className='pr-3' weight='bold' appearance='white'>
          <FilterFilled className='pr-3' />
          Active Query Filters:
        </Texto>
      </Horizontal>
      <Horizontal flex='1' style={{ flexWrap: 'wrap' }}>
        {validTags.map(([key, value], index) => {
          return (
            <FilterTag
              key={index}
              name={key}
              property={key}
              value={value}
              filters={filters}
              setCurrentFilters={setCurrentFilters}
              setSearchValue={setSearchValue}
              params={params}
            />
          )
        })}
      </Horizontal>
    </Horizontal>
  )
}

type FilterTagProps = {
  name: string
  property: string
  value: any
  filters: Filter
  setCurrentFilters?: (filters: Filter) => void
  setSearchValue?: (value: string) => void
  params?: Param[]
}

const FilterTag: React.FC<FilterTagProps> = ({
  name,
  value,
  property,
  filters,
  setCurrentFilters,
  setSearchValue,
  params,
}) => {
  const isBoolean = value && typeof value === 'boolean'

  const isSingleDate = (val: string) => {
    if (!val || typeof val !== 'string') return false
    const [y, m, d] = val.split(/[- : T Z]/)
    if (!y || !m || !d) return false // all three components should be present in a valid date string
    return !!(y && +m <= 12 && +d <= 31)
  }

  const isDateRange =
    Array.isArray(value) &&
    value?.length === 2 &&
    value.every((date) => moment(date)?.isValid())

  const matchingParam = params?.find((p) => p.filter_column === property)
  let matchingOption: string | DropdownOptionObject | undefined

  if (matchingParam?.options) {
    matchingOption = isKeyValueArray(matchingParam?.options)
      ? matchingParam?.options?.find((o) => o.value === value)
      : matchingParam?.options?.find((o) => o === value)
  }

  const dateFormatString = 'MM/DD/YYYY'
  const dateFormat = (date?: number | Date | undefined) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch (e) {
      console.error('Invalid Date')
    }
  }

  let valueFromObject = value
  if (matchingOption) {
    // TODO: Understand why .text is being accessed here - the possible types for an option should only be string or DropdownOptionObject
    // @ts-ignore
    valueFromObject = matchingOption.text
  } else if (isDateRange) {
    valueFromObject = `${moment(value[0]).format(dateFormatString)} - ${moment(
      value[1]
    ).format(dateFormatString)}`
  } else if (Array.isArray(value)) {
    valueFromObject = value.join(', ')
  } else if (isBoolean) {
    valueFromObject = value ? 'Yes' : 'No'
  } else if (isNaN(value) && isSingleDate(value)) {
    valueFromObject = dateFormat(value)
  } else if (moment.isMoment(value)) {
    // TODO: Check if date formatting returns correctly here. Intl typing doesn't list moment as a valid input type but it may 'work'
    // @ts-ignore
    valueFromObject = dateFormat(moment(value))
  }

  return (
    <BBDTag theme2 className='filter-tag my-2'>
      <span className='filter-tag-label'>
        {name.includes('.')
          ? name.split('.')[1]
          : name.includes('_')
          ? name.split('_').join(' ')
          : name}
        :
      </span>
      <span
        className='filter-tag-value'
        style={{ textTransform: 'capitalize' }}
      >
        {valueFromObject || value}
      </span>
      <Button
        onClick={() => {
          const copy = { ...filters }
          delete copy[property]
          if (setSearchValue && typeof setSearchValue === 'function') {
            setSearchValue('')
          }
          if (setCurrentFilters) setCurrentFilters(copy)
        }}
        icon={<CloseOutlined />}
      />
    </BBDTag>
  )
}
