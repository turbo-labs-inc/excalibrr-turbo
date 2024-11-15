/* eslint-disable camelcase */
import { CloseCircleOutlined } from '@ant-design/icons'
import { DatePicker, Form, FormInstance, Input, Select } from 'antd'
import { Fragment, useEffect } from 'react'
import ReactGA from 'react-ga'
import { useLocation } from 'react-router-dom'

import { GraviButton } from '../../Controls/Buttons/GraviButton'
import { RangePicker } from '../../Controls/DateTime/DateRangePicker'
import { DataItem } from '../../DataDisplay/DataItem'

export type DropdownOptionObject = { value: string; text: string }

const { Option, OptGroup } = Select

export type Param = {
  title: string
  filter_column: string
  datatype: string
  options?: string[] | DropdownOptionObject[]
}

export type Filter = Record<string, any>

type Props<F extends object> = {
  params: Param[]
  submitFunction: (values: F) => void
  submitLabel?: string
  name?: string
  layout?: 'inline' | 'vertical'
  filters: F
  setFilters?: (filters: F) => void
}

export function DynamicFiltersForm<F extends Record<string, any>>({
  params,
  submitFunction,
  submitLabel = 'Apply Filters',
  name = 'default_form',
  layout = 'inline',
  filters,
  setFilters,
}: Props<F>) {
  const location = useLocation()
  const onFilterSet = (values: F) => {
    const splitPath = location.pathname.split('/')
    ReactGA?.event({
      category: splitPath[1] || 'default',
      action: `SS FILTER: ${JSON.stringify(values)}`,
      label: 'Server Side Filter',
    })
    submitFunction(values)
  }
  const [form] = Form.useForm()
  const numbeRegex = /^[0-9\b]+$/

  useEffect(() => {
    form.setFieldsValue({ ...filters })
  }, [filters])

  const onValuesChange = (formData: F) => {
    Object.keys(formData).forEach((k) => {
      if (
        (k.includes('_min') || k.includes('_max')) &&
        formData[k] !== '' &&
        !numbeRegex.test(formData[k])
      ) {
        form.resetFields([k])
      }
    })
  }

  return (
    <Form
      className='search-grid-form'
      layout={layout}
      name={name}
      onFinish={onFilterSet}
      form={form}
      onValuesChange={onValuesChange}
    >
      {params &&
        Array.isArray(params) &&
        params.map((param) => (
          <Param
            key={param.title}
            param={param}
            form={form}
            filters={filters}
            setFilters={setFilters}
          />
        ))}
      <div className='vertical-flex-center'>
        <Form.Item>
          <GraviButton
            className='mt-3'
            theme1
            buttonText={submitLabel}
            htmlType='submit'
          />
          <GraviButton
            className='ml-3'
            buttonText='Clear'
            icon={<CloseCircleOutlined />}
            onClick={() => {
              form.resetFields()
              form.submit()
            }}
          />
        </Form.Item>
      </div>
    </Form>
  )
}

type ParamsProps<F extends Filter> = {
  param: any
  form: FormInstance
  filters: F
  setFilters?: (filters: F) => void
}

const Param = <F extends Filter>({
  param,
  form,
  filters,
  setFilters,
}: ParamsProps<F>) => {
  if (param.datatype === 'bool') return BoolParam(param)
  if (param.datatype === 'datetime') return DateParam(param)
  if (param.datatype === 'daterangeslider')
    return DateRangeParam(param, form, filters, setFilters)
  if (param.datatype === 'int_range') return NumberRangeParam(param)
  if (param.datatype === 'dropdown') return DropdownParam(param)
  if (param.datatype === 'group_dropdown') return DropdownGroupParam(param)
  return TextParam(param)
}

type BaseParamProps = {
  title: string
  filter_column: string
}

function TextParam({ title, filter_column }: BaseParamProps) {
  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        <Input style={{ width: 200 }} />
      </Form.Item>
    </DataItem>
  )
}

function BoolParam({ title, filter_column }: BaseParamProps) {
  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        <Select allowClear style={{ width: 200 }}>
          <Option value>Yes</Option>
          <Option value={false}>No</Option>
        </Select>
      </Form.Item>
    </DataItem>
  )
}

function DateParam({ title, filter_column }: BaseParamProps) {
  const formatter = (date?: number | Date | undefined) => {
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
  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        {/** @ts-ignore TODO: Need to see if this is formatting dates correctly since the callback is returning a moment, not a date */}
        <DatePicker format={formatter} style={{ width: 200 }} />
      </Form.Item>
    </DataItem>
  )
}

function DateRangeParam<F extends Filter>(
  { title, filter_column }: BaseParamProps,
  form: FormInstance,
  filters: F,
  setFilters?: (filters: F) => void
) {
  const handleChange = (newDates: [Date | undefined, Date | undefined]) => {
    if (setFilters) {
      setFilters({ ...filters, [filter_column]: newDates })
    }
  }

  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        <RangePicker
          dates={filters?.[filter_column]}
          inputKey={filter_column}
          onChange={handleChange}
        />
      </Form.Item>
    </DataItem>
  )
}

function NumberRangeParam({ title, filter_column }: BaseParamProps) {
  return (
    <Fragment key={title}>
      <DataItem label={title}>
        <Form.Item key={`${title}min`} name={`${filter_column}_min`}>
          <Input style={{ width: '75px' }} placeholder='Min' />
        </Form.Item>
      </DataItem>
      <DataItem extraClass='detail-data-no-label mr-4'>
        <Form.Item key={`${title}max`} name={`${filter_column}_max`}>
          <Input style={{ width: '75px' }} placeholder='Max' />
        </Form.Item>
      </DataItem>
    </Fragment>
  )
}

export const isKeyValueArray = (
  options: string[] | DropdownOptionObject[]
): options is DropdownOptionObject[] => {
  if (!options.length) return false
  return typeof options[0] === 'object'
}

const stringArrSearch = (input: string, option: DropdownOptionObject) =>
  option.value.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0

const kvArrSearch = (input: string, option: { children: any }) =>
  option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0

type DropdownParamProps = BaseParamProps & {
  options: string[] | DropdownOptionObject[]
  customFilterOption?: (input: string, option: any) => boolean
}

function DropdownParam({
  title,
  options,
  filter_column,
  customFilterOption,
}: DropdownParamProps) {
  const noDupes = isKeyValueArray(options)
    ? Array.from(new Set(options.filter((option) => !!option)))
    : Array.from(new Set(options.filter((option) => !!option)))

  const filterOption =
    customFilterOption ||
    (isKeyValueArray(noDupes) ? stringArrSearch : kvArrSearch)

  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        <Select
          allowClear
          showSearch
          style={{ width: 200 }}
          // TODO: Try and get filterOption typing to work correctly.
          // @ts-ignore
          filterOption={filterOption}
        >
          {isKeyValueArray(noDupes)
            ? noDupes.map((option, i) => (
                <Option key={option.value} value={option.value}>
                  {option.text}
                </Option>
              ))
            : noDupes.map((optionString, i) => (
                <Option key={optionString} value={optionString}>
                  {optionString}
                </Option>
              ))}
        </Select>
      </Form.Item>
    </DataItem>
  )
}

type DropdownGroupParamProps = BaseParamProps & {
  options: (string | DropdownOptionObject)[]
}

function DropdownGroupParam({
  title,
  options,
  filter_column,
}: DropdownGroupParamProps) {
  const noDupes = Array.from(new Set(options))
  return (
    <DataItem key={title} label={title} extraClass='mr-4'>
      <Form.Item key={title} name={filter_column}>
        <Select allowClear showSearch style={{ width: 200 }}>
          {noDupes.map((g: any) => {
            const formattedName = g.name.toString().toUpperCase()
            const groupOptions = Array.from(new Set(g.options))
            return (
              <OptGroup key={g.name} label={formattedName}>
                {groupOptions.map((o: any) => {
                  const formattedValue = o.toString().toUpperCase()
                  return (
                    <Option key={o} value={formattedValue}>
                      {formattedValue}
                    </Option>
                  )
                })}
              </OptGroup>
            )
          })}
        </Select>
      </Form.Item>
    </DataItem>
  )
}
