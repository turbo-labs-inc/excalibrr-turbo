import type { Meta, StoryObj } from '@storybook/react'

import { GraviButton } from './GraviButton'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof GraviButton> = {
  title: 'Example/GraviButton',
  component: GraviButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
}

export default meta
type Story = StoryObj<typeof GraviButton>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    theme1: true,
    buttonText: 'Primary Button',
  },
}
