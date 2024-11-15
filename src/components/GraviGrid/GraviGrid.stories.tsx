import type { Meta, StoryObj } from '@storybook/react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { GraviGrid } from './GraviGrid'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof GraviGrid> = {
  title: 'Example/GraviGrid',
  component: GraviGrid,
  decorators: [
    (Story) => (
      <div style={{ height: 600 }}>
        <Story />
      </div>
    ),
  ],
  render: (args, { loaded: { rowData } }) => {
    return <GraviGrid {...args} rowData={rowData} />
  },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    // layout: 'centered',
    actions: { disable: true },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
}

export default meta
type Story = StoryObj<typeof GraviGrid>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  loaders: [
    async () => {
      const resp = await fetch('https://api.github.com/repositories')
      const data = await resp.json()
      return {
        rowData: data,
      }
    },
  ],
  args: {
    theme1: true,
    buttonText: 'Primary Button',
    columnDefs: [
      {
        field: 'owner.avatar_url',
        headerName: 'Avatar',
        cellRenderer: (params) => (
          <img src={params.value} alt='avatar' style={{ width: 30 }} />
        ),
      },
      { field: 'id', headerName: 'ID' },
      { field: 'name', headerName: 'Name' },
      { field: 'full_name', headerName: 'Full Name' },
      { field: 'owner.login', headerName: 'Owner' },
      { field: 'html_url', headerName: 'URL' },
    ],
    agPropOverrides: {
      columnDefs: [],
    },
    controlBarProps: { title: 'GitHub Repositories' },
  },
}
