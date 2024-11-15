import { Button, ButtonProps } from 'antd'
import type { FC } from 'react'
import ReactGA from 'react-ga'

import { ThemeVariants } from '../../../types/common'

type Props = Partial<ThemeVariants & ButtonProps> & {
  className?: string
  buttonText?: string
  appearance?: string // need to figure out what this is
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

/**
 * Primary button component used in Gravitate UI
 */
export const GraviButton: FC<Props> = ({
  theme1,
  theme2,
  theme3,
  theme4,
  error,
  warning,
  success,
  className,
  buttonText = 'Click Me',
  onClick,
  appearance = 'filled',
  ...others
}) => {
  let buttonClass = 'default'
  buttonClass = theme1 ? 'theme-1' : buttonClass
  buttonClass = theme2 ? 'theme-2' : buttonClass
  buttonClass = theme3 ? 'theme-3' : buttonClass
  buttonClass = error ? 'error' : buttonClass
  buttonClass = warning ? 'warning' : buttonClass
  buttonClass = success ? 'success' : buttonClass
  buttonClass += className ? ` ${className}` : ''

  const location = window.location

  const analyticsOnClickWrapper = (
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    if (location) {
      const splitPath = location.pathname.split('/')
      ReactGA?.event({
        category: splitPath[1] || 'default',
        action: buttonText || 'button_has_no_text',
        label: buttonText,
      })
    }

    if (onClick) {
      onClick(e)
    }
  }
  return (
    <Button
      onClick={analyticsOnClickWrapper}
      className={`gravi-button ${buttonClass} ${appearance}`}
      {...others}
    >
      {buttonText}
    </Button>
  )
}
