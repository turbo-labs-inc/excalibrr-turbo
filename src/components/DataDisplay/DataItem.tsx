interface IProps {
  label?: string
  children?: React.ReactNode
  extraClass?: string
  labelExtras?: any[]
}

export const DataItem: React.FC<IProps> = ({
  label,
  children,
  extraClass,
  labelExtras,
}) => {
  return (
    <div className={extraClass}>
      <div className='detail-data-label' {...labelExtras}>
        {label}
      </div>
      <div className='detail-data-value'>{children}</div>
    </div>
  )
}
