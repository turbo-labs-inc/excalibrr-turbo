import { useState } from 'react'
import queryString from 'query-string'

export const useLogin = () => {
  const params = queryString.parse(window?.location.search)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [oneTimePassword, setOneTimePassword] = useState<string | undefined>(
    Object.keys(params)[0]
  )

  return {
    oneTimePassword,
    setOneTimePassword,
    showResetDialog,
    setShowResetDialog,
  }
}
