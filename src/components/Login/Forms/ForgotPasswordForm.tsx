import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { NotificationMessage } from '../../DataDisplay/NotificationMessage'
import { Texto } from '../../DataDisplay/Texto/Texto'

type Props = {
  setShowResetDialog: (show: boolean) => void
  sendResetEmail: (emailOrUsername: string) => Promise<any>
}

export const ForgotPasswordForm: React.FC<Props> = ({
  setShowResetDialog,
  sendResetEmail,
}) => {
  const handleReset = ({ emailOrUsername }: { emailOrUsername: string }) => {
    sendResetEmail(emailOrUsername)
      .then((d) => {
        setShowResetDialog(false)
        NotificationMessage(
          'Password Reset Email Sent',
          `A password reset email has been sent to ${emailOrUsername}`,
          false
        )
      })
      .catch(() => {
        NotificationMessage(
          'User Does Not Exist',
          `We were unable to find a user with that information`,
          true
        )
      })
  }
  return (
    <div className='login-form'>
      <div className='flex-1 vertical-flex-center login-heading-container'>
        <Texto
          category='heading'
          style={{ fontSize: '1.6em' }}
          weight={600}
          align='center'
        >
          Password Reset
        </Texto>
      </div>
      <div className='flex-2'>
        <Form onFinish={handleReset}>
          <Texto
            className='mb-3'
            appearance='medium'
            category='label'
            weight='bold'
          >
            Email Or Username
          </Texto>
          <Form.Item
            name='emailOrUsername'
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder='Email or Username'
              className='inp'
            />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
            >
              Send Reset Email
            </Button>
          </Form.Item>
          <Form.Item className='center-text'>
            <Button
              icon={<ArrowLeftOutlined />}
              type='link'
              onClick={() => setShowResetDialog(false)}
            >
              Back to login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
