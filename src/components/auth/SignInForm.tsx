'use client'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInSchema } from '@/lib/types/auth'
import { toast } from 'sonner'
import { signIn } from '@/lib/actions/auth/auth'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import VerifyCodeAlertDialog from './VerifyCodeAlertDialog'

export default function SignInForm() {
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, user: { userId: '', email: '', password: '' } })
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const response = await signIn(values)
    if (response?.error === 'Email not verified') {
      setAlertDialog({
        isOpen: true,
        user: { userId: response.data.userId, email: response.data.email, password: values.password }
      })
      return
    }
    if (response?.error !== '') {
      toast.error(response.error)
      return
    }
    form.reset()
  }
  return (
    <Card className='xl:w-1/4'>
      <VerifyCodeAlertDialog {...{ alertDialog, setAlertDialog }} />
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4'>
          <Form {...form}>
            <form className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className='text-red-600'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type='email' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center'>
                      <FormLabel>
                        Password <span className='text-red-600'>*</span>
                      </FormLabel>
                      <Link href='#' className='ml-auto inline-block text-sm underline'>
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input {...field} type='password' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Button className='mt-4 mb-2 justify-center' onClick={form.handleSubmit(onSubmit)}>
            {form.formState.isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Sign In'}
          </Button>
          <Link href='/api/oauth/google'>
            <Button variant='outline' className='w-full'>
              Login with Google
            </Button>
          </Link>
        </div>
        <div className='mt-4 text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='underline'>
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
