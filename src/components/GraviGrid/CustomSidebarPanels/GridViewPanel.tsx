import { GraviButton } from '../../Controls/Buttons/GraviButton'
import { Horizontal } from '../../Layout/Horizontal'

type Props = {
  onGridReset: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export const GridViewPanel: React.FC<Props> = ({ onGridReset }) => (
  <Horizontal
    verticalCenter
    horizontalCenter
    style={{ width: 250, paddingTop: '1em' }}
  >
    <GraviButton danger onClick={onGridReset} buttonText='Reset To Default' />
  </Horizontal>
)
