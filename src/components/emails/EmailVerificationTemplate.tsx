import * as React from 'react'

interface EmailVerificationTemplateProps {
  code?: string | null | undefined
}

export const EmailVerificationTemplate: React.FC<Readonly<EmailVerificationTemplateProps>> = ({ code }) => (
  <div>
    <h1>Welcome!</h1>
    <p>Here is your code: {code}</p>
  </div>
)
