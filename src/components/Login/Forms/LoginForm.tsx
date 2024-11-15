import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Form, Input, InputRef, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'

import { Texto } from '../../DataDisplay/Texto/Texto'
import { Horizontal } from '../../Layout/Horizontal'
import { Vertical } from '../../Layout/Vertical'

const store = window.sessionStorage

export type LoginValues = { username: string; password: string }

type Props = {
  onLogin: (values: LoginValues) => void
  setShowResetDialog: (show: boolean) => void
  loginLayout: number
  loginLogoImage: string
  errorMessage?: string
  poweredByLogo?: string
}

export const LoginForm: React.FC<Props> = ({
  onLogin,
  setShowResetDialog,
  loginLayout,
  loginLogoImage,
  errorMessage,
  poweredByLogo,
}) => {
  const [lastUsername, setLastUsername] = useState<string>()

  const usernameRef = useRef<InputRef>(null)
  const passwordRef = useRef<InputRef>(null)

  const onFinish = (values: LoginValues) => {
    if (lastUsername) {
      values.username = lastUsername
    }
    store.setItem('username', values.username)
    onLogin(values)
  }

  const clearUsername = () => {
    store.removeItem('username')
    setLastUsername(undefined)
  }

  useEffect(() => {
    const stickyUsername = store.getItem('username')
    if (stickyUsername) {
      setLastUsername(stickyUsername)
    }
    if (stickyUsername) {
      passwordRef.current?.focus({
        // @ts-ignore cursor is not a parameter of focus
        cursor: 'end',
      })
    } else {
      usernameRef.current?.focus({
        // @ts-ignore cursor is not a parameter of focus
        cursor: 'end',
      })
    }
  }, [])

  return (
    <div className='login-form'>
      <div className='flex-1 vertical-flex-center login-heading-container'>
        {loginLayout === 1 ? (
          <Texto
            category='heading'
            style={{ fontSize: '1.6em' }}
            weight={600}
            align='center'
          >
            PORTAL LOGIN
          </Texto>
        ) : (
          <div
            className='login-logo-v2'
            style={{
              backgroundImage: `url(${loginLogoImage})`,
            }}
          />
        )}
      </div>
      <div className='flex-2'>
        <Form initialValues={{ username: lastUsername }} onFinish={onFinish}>
          <UsernameInput
            inputRef={usernameRef}
            clearUsername={clearUsername}
            lastUsername={lastUsername}
          />
          <PasswordInput inputRef={passwordRef} errorMessage={errorMessage} />
          <Form.Item>
            <Button
              htmlType='submit'
              data-cy='button-login-submit'
              className='login-form-button'
            >
              Log in
            </Button>
          </Form.Item>
          <Form.Item className='center-text'>
            <Button
              data-cy='button-login-request-reset'
              icon={<LockOutlined />}
              type='link'
              onClick={() => setShowResetDialog(true)}
            >
              Forgot your password?
            </Button>
          </Form.Item>
        </Form>
      </div>
      {poweredByLogo && <PoweredByLogo poweredByLogo={poweredByLogo} />}
    </div>
  )
}

type UsernameInputProps = {
  inputRef: React.RefObject<InputRef>
  lastUsername?: string
  clearUsername: () => void
}

function UsernameInput({
  inputRef,
  lastUsername,
  clearUsername,
}: UsernameInputProps) {
  if (!lastUsername) {
    return (
      <>
        <Texto category='label' className='mb-3'>
          Username
        </Texto>
        <Form.Item
          initialValue={store.getItem('username')}
          className='mb-4'
          name='username'
          rules={[
            {
              required: true,
              message: 'Please input your username!',
            },
          ]}
        >
          <Input
            data-cy='input-username'
            ref={inputRef}
            placeholder='Username'
            className='login-input'
          />
        </Form.Item>
      </>
    )
  }

  return (
    <Horizontal
      background='bg-3'
      className='p-3 round-border my-3'
      alignItems='center'
    >
      <Horizontal alignItems='center' style={{ minWidth: 0 }} flex={1}>
        <Avatar
          style={{ backgroundColor: 'var(--theme-color-2)', minWidth: 30 }}
          className='ml-4'
        >
          <UserOutlined />
        </Avatar>
        <Tooltip title={lastUsername}>
          <Texto className='pl-3 text-ellipsis' category='h6'>
            {lastUsername}
          </Texto>
        </Tooltip>
      </Horizontal>
      <Vertical flex='0 1 auto'>
        <Button onClick={clearUsername} type='link'>
          Not you?
        </Button>
      </Vertical>
    </Horizontal>
  )
}

type PasswordInputProps = {
  inputRef: React.Ref<InputRef>
  errorMessage?: string
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  inputRef,
  errorMessage,
}) => {
  return (
    <>
      <Texto category='label' className='mb-3'>
        Password
      </Texto>
      <Form.Item
        name='password'
        className='mb-4'
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
      >
        <Input
          data-cy='input-password'
          ref={inputRef}
          type='password'
          placeholder='Password'
          className='login-input'
        />
      </Form.Item>
      <div style={{ height: 30 }}>
        {errorMessage && (
          <Texto className='mb-3' appearance='error' category='p1'>
            {errorMessage}
          </Texto>
        )}
      </div>
    </>
  )
}

type PoweredByLogoProps = {
  poweredByLogo: string
}

export const PoweredByLogo: React.FC<PoweredByLogoProps> = ({
  poweredByLogo,
}) => {
  return (
    <Horizontal
      verticalCenter
      className='justify-sa my-4'
      style={{ height: 'auto', width: '100%' }}
    >
      <Texto>Powered By:</Texto>
      <div
        className='powered-by-logo'
        style={{
          backgroundImage: `url(${poweredByLogo})`,
        }}
      />
    </Horizontal>
  )
}
