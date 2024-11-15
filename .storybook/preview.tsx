import React from 'react'
import type { Preview } from '@storybook/react'
import { ThemeContextProvider } from '../src/components/Theming/ThemeContext'

const themeConfigs = {
  LIGHT_MODE: {
    display: 'Light',
    key: 'LIGHT_MODE',
    ThemeImportComponent: React.lazy(() => import('./themes/default')),
    default: true,
    isDark: false,
    // loginImage: defaultLogin,
  },
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeContextProvider themeConfigs={themeConfigs}>
        <Story />
      </ThemeContextProvider>
    ),
  ],
  loaders: [
    () => {
      window.localStorage.setItem('TYPE_OF_THEME', 'LIGHT_MODE')
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
