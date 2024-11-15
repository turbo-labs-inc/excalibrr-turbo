import { SelectedRow } from '@components/GraviGrid/GraviGrid'
import { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { Form, Select, Switch } from 'antd'
import moment from 'moment/moment'
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { dateFormat } from '../../../constants/dateFormat'
import { isDefined } from '../../../Utils/general'
import { GraviButton } from '../../Controls/Buttons/GraviButton'
import { NotificationMessage } from '../../DataDisplay/NotificationMessage'
import { Texto } from '../../DataDisplay/Texto/Texto'
import { Horizontal } from '../../Layout/Horizontal'
import { Vertical } from '../../Layout/Vertical'
import { BulkCellEditorHandle } from '../index.types'

export type CustomBulkEditorProps<T extends Record<string, any>> = {
  // type of react component with forwarded ref
  isBulkEditable?: boolean
  bulkCellEditor?: React.ForwardRefExoticComponent<BulkCellEditorHandle<T>>
  bulkCellEditorParams?: any
  selectedRows?: T[]
  selectedProperty?: ColDef<T>
  refreshBulkDrawerUI?: () => void
}

type BulkChangeDrawerProps<T extends Record<string, any>> = {
  columnDefs: ColDef<T>[]
  selectedRows: SelectedRow<T>[]
  clearSelection: () => void
  updateEP: any
  setIsBulkChangeVisible?: Dispatch<SetStateAction<boolean>>
  setSelectedRows: Dispatch<SetStateAction<SelectedRow<T>[]>>
  bulkDrawerTitle?: string
  isDirtyEdit: boolean
  gridRef: RefObject<AgGridReact | null>
  setLastSaved: (date: string) => void
  hideSaveDisplay?: boolean
  hideBulkSaveButtons?: boolean
  bulkChangePropertiesComparator?: (a: ColDef<T>, b: ColDef<T>) => number
}

export type ChangeMeta<T> = {
  colId: keyof T
  newValue: any
  oldValue: T[keyof T]
  updatedRowIndex?: number
}

export type BulkEditorColDef<T extends Record<string, any>> = ColDef<T> &
  CustomBulkEditorProps<T>

export function BulkChangeDrawer<T extends Record<string, any>>({
  columnDefs,
  selectedRows,
  clearSelection,
  updateEP,
  setIsBulkChangeVisible,
  setSelectedRows,
  bulkDrawerTitle,
  isDirtyEdit,
  gridRef,
  setLastSaved,
  hideSaveDisplay = false,
  hideBulkSaveButtons = false,
  bulkChangePropertiesComparator,
}: BulkChangeDrawerProps<T>) {
  if (!setIsBulkChangeVisible) return null

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // A hack, but lets custom cell editors tell the drawer when to refresh
  // Needed since the drawer can't see when things change in the ref handle
  const [, refreshBulkDrawerUI] = useState(crypto.randomUUID())

  // Up until this point, column defs are considered to be standard ag-grid column defs, but we
  // know here that there could be bulk editing metadata on them, hence the cast
  const editableProperties = columnDefs
    // If the grid is utilizing nested columns, we need to flatten the list first
    .flatMap((c) =>
      // @ts-ignore - children is a valid ColDef property but doesn't exist on the ag-grid supplied type for some reason
      isDefined(c.children) && Array.isArray(c.children) ? c.children : [c]
    )
    .filter((c) => c.isBulkEditable) as BulkEditorColDef<T>[]

  if (bulkChangePropertiesComparator) {
    editableProperties.sort(bulkChangePropertiesComparator)
  }

  const [selectedPropertyField, setSelectedPropertyField] = useState(
    editableProperties && editableProperties[0]?.field
  )

  const selectedProperty = useMemo(
    () => editableProperties.find((p) => p.field === selectedPropertyField),
    [editableProperties, selectedPropertyField]
  )

  const bulkCellEditorRef = useRef<BulkCellEditorHandle<T>>()

  const hasCustomCellEditor = useMemo(
    () => isDefined(selectedProperty?.bulkCellEditor),
    [selectedProperty]
  )

  const initialSwitchValue = useMemo(() => {
    if (
      selectedProperty?.bulkCellEditorParams?.hasOwnProperty('initialValue')
    ) {
      return selectedProperty.bulkCellEditorParams.initialValue
    }
    return true
  }, [selectedProperty])

  useEffect(() => {
    form.setFieldsValue({
      Value: initialSwitchValue,
    })
  }, [initialSwitchValue])

  const tryUpdate = async (changes: SelectedRow<T>[]) => {
    if (!updateEP) return

    setLoading(true)

    try {
      const response = await updateEP(changes)

      // Logic specific to V-Next since they have send 200s back for failed updates ☠️
      // Endpoints that correctly respond with a non-200 status code will throw an error and be caught below
      if (response?.ActionStatus && response?.ActionStatus !== 'Success')
        throw new Error()

      setLastSaved(moment().format(dateFormat.TIME))

      // this pipes changes made via bulk change back into the editor
      setSelectedRows(changes)

      if (hideSaveDisplay) return
      return NotificationMessage(
        'Save Successful',
        `${changes?.length} record(s) updated`,
        false
      )
    } catch (error: any) {
      return NotificationMessage(
        'Error Saving',
        error?.message ?? `Could not update ${changes.length} records`,
        true
      )
    } finally {
      setLoading(false)
    }
  }

  const executeChange = async (
    changeFn: (row: SelectedRow<T>) => SelectedRow<T>
  ) => {
    const changedRows = selectedRows.map(changeFn)
    await tryUpdate(changedRows)
  }

  const handleConfirm = async (
    formValues:
      | {
          Property: keyof T
          Value: any
        }
      | Record<keyof T, any>
  ) => {
    // TODO: Future enhancement to dirty editing mode
    // Since custom bulk cell editors can return multiple changes on a row at the same time,
    // we are making an assumption that the user is not using dirty edit mode with the grid
    // since it only supports one field change on a row at a time.
    if (hasCustomCellEditor) {
      if (
        !bulkCellEditorRef?.current?.getChanges ||
        !bulkCellEditorRef?.current?.isChangeReady()
      )
        return
      executeChange((row) => ({
        ...row,
        ...bulkCellEditorRef?.current?.getChanges(row),
      }))
      return
    }

    const propertyName = formValues.Property
    const propertyValue = formValues.Value

    // Bulk edit + dirt edit should technically be ok as long as we're only updating a single field at a time.
    if (isDirtyEdit) {
      selectedRows.forEach((row) => {
        const meta = {
          colId: propertyName,
          newValue: propertyValue,
          oldValue: row[propertyName],
          // @ts-ignore
          updatedRowIndex: row.$updatedRowIndex,
        }
        const changes = {
          ...row,
          [propertyName]: propertyValue,
        } as T

        gridRef?.current?.api.applyTransaction({ update: [changes] })
        updateEP && updateEP([changes], meta)
      })
    } else {
      const updatedRows = selectedRows.map((row) => {
        return {
          ...row,
          [propertyName]: propertyValue,
        }
      })

      tryUpdate(updatedRows)
    }
  }

  const updateRowCount = useMemo(() => {
    if (gridRef && gridRef?.current?.api) {
      let rowCounter = 0

      gridRef?.current?.api?.forEachNodeAfterFilterAndSort((node) => {
        if (!node.group && node.isSelected()) {
          rowCounter += 1
        }
      })
      return rowCounter
    }
    return 0
  }, [selectedRows, gridRef?.current?.api])

  return (
    <Form name='GraviGridBulkChangeDrawer' onFinish={handleConfirm} form={form}>
      <Horizontal
        className='mr-4'
        style={{
          position: 'relative',
          bottom: 0,
          height: 80,
          backgroundColor: 'var(--theme-color-2-dim)',
          width: '100%',
        }}
      >
        <Vertical
          verticalCenter
          horizontalCenter
          style={{ backgroundColor: 'var(--theme-color-2)' }}
        >
          <Texto
            category='h4'
            appearance='white'
            className='flex items-center'
            style={{ gap: '1rem' }}
          >
            <span style={{ fontWeight: 500 }}>BULK CHANGE</span>
            <span style={{ fontWeight: 600 }}> {bulkDrawerTitle}</span>
          </Texto>
        </Vertical>
        <Vertical flex={11} verticalCenter className='px-4'>
          <Horizontal verticalCenter style={{ gap: '1rem' }}>
            <Texto>
              <span style={{ fontWeight: 600 }}>{updateRowCount} items</span>
              <span> will be updated</span>
            </Texto>
            <div>
              <Vertical verticalCenter justifyContent='flex-start'>
                <Texto style={{ marginLeft: '0.75rem' }}>Property:</Texto>
                <Form.Item name='Property' noStyle>
                  <Select
                    size='large'
                    placeholder='Select a property'
                    defaultValue={selectedPropertyField}
                    value={selectedPropertyField}
                    onChange={setSelectedPropertyField}
                    style={{
                      padding: 0,
                      minWidth: 250,
                      width: 'auto',
                      verticalAlign: 'center',
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    bordered={false}
                    showSearch
                    options={editableProperties?.map((prop) => {
                      return {
                        value: prop.field,
                        label: prop.headerName,
                      }
                    })}
                  />
                </Form.Item>
              </Vertical>
            </div>
            <div style={{ flexGrow: 1 }}>
              <Horizontal verticalCenter style={{ gap: 10 }}>
                {selectedProperty?.bulkCellEditor ? (
                  <selectedProperty.bulkCellEditor
                    ref={bulkCellEditorRef}
                    refreshBulkDrawerUI={() =>
                      refreshBulkDrawerUI(crypto.randomUUID())
                    }
                    executeChange={executeChange}
                    selectedRows={selectedRows}
                    selectedProperty={selectedProperty}
                    {...selectedProperty?.bulkCellEditorParams}
                  />
                ) : (
                  <>
                    <Texto category='p2'>Value:</Texto>
                    <Form.Item
                      name='Value'
                      valuePropName='checked'
                      noStyle
                      initialValue={initialSwitchValue}
                    >
                      <Switch
                        checkedChildren='Yes'
                        unCheckedChildren='No'
                        defaultChecked
                        style={{ minWidth: 80 }}
                        {...selectedProperty?.bulkCellEditorParams}
                      />
                    </Form.Item>
                  </>
                )}
              </Horizontal>
            </div>
            <div>
              {!hideBulkSaveButtons && (
                <Horizontal style={{ gap: '1rem' }}>
                  <GraviButton
                    size='large'
                    className='rounded'
                    buttonText='Cancel'
                    style={{
                      width: '100%',
                      borderColor: 'var(--theme-success)',
                      borderRadius: 5,
                    }}
                    onClick={() => {
                      setIsBulkChangeVisible(false)
                      clearSelection()
                    }}
                  />
                  <GraviButton
                    size='large'
                    loading={loading}
                    success
                    buttonText='Confirm'
                    disabled={
                      hasCustomCellEditor
                        ? !bulkCellEditorRef?.current?.isChangeReady() ||
                          selectedRows?.length <= 0
                        : selectedRows?.length <= 0
                    }
                    style={{
                      width: '100%',
                      borderColor: 'var(--theme-success)',
                      borderRadius: 5,
                    }}
                    htmlType='submit'
                  />
                </Horizontal>
              )}
            </div>
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Form>
  )
}
