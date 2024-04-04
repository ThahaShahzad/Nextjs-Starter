'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { resendVerificationEmail, signIn, verifyEmailCode } from '@/lib/actions/auth/auth'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function VerifyCodeAlertDialog({
  alertDialog,
  setAlertDialog
}: {
  alertDialog: {
    isOpen: boolean
    user: {
      userId: string
      email: string
      password: string
    }
  }
  setAlertDialog: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      user: {
        userId: string
        email: string
        password: string
      }
    }>
  >
}) {
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [resendError, setResendError] = useState(false)
  const { user } = alertDialog
  const { userId, email } = user
  const resendEmailCode = async () => {
    setIsResendLoading(true)
    const response = await resendVerificationEmail({ userId, email })
    if (response?.error !== '') {
      toast.error(response.error)
      //   setResendError(true)
      setIsResendLoading(false)
      return
    }
    toast.success(`Email code sent to ${email}`)
    // setResendError(false)
    setIsResendLoading(false)
  }
  return (
    <AlertDialog
      onOpenChange={() => setAlertDialog({ ...alertDialog, isOpen: !alertDialog.isOpen })}
      open={alertDialog.isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify your email</AlertDialogTitle>
          <InputOTPPattern {...user} />
        </AlertDialogHeader>
        <AlertDialogFooter className='items-end'>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* <div className='space-y-2'> */}
          {/* {resendError && <p className='text-center text-sm text-destructive'>Error</p>} */}
          <Button onClick={resendEmailCode}>
            {isResendLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Resend'}
          </Button>
          {/* </div> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
const FormSchema = z.object({
  code: z.string().min(8, {
    message: 'Code must be 8 characters.'
  })
})
function InputOTPPattern({ userId, email, password }: { userId: string; email: string; password: string }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      code: ''
    }
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const response = await verifyEmailCode({ code: data.code, userId, email })
    console.log(response)
    if (response?.error !== '') {
      form.setError('code', { type: 'manual', message: response.error })
      return
    }
    //TODO re-login user
    const loginResponse = await signIn({ email, password })
    if (loginResponse?.error !== '') {
      toast.error(loginResponse.error)
      return
    }
  }
  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className='w-2/3 space-y-6'>
        {form.formState.isSubmitting ? (
          <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        ) : (
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={8} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                {/* <FormDescription>Please enter the code sent to your email.</FormDescription> */}
                {form.getValues('code').length === 8 && <FormMessage />}
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  )
}
