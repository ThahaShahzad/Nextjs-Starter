'use client'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUpSchema } from '@/lib/types/auth'
import { toast } from 'sonner'
import { signUp } from '@/lib/actions/auth/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SignUpForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',

      confirmPassword: ''
    }
  })
  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    const response = await signUp(values)
    if (response?.error !== '') {
      toast.error(response.error)
      return
    }
    router.push('/sign-in')
    toast.success('Account created')
    form.reset()
  }
  return (
    <Card className='xl:w-1/4'>
      <CardHeader>
        <CardTitle className='text-xl'>Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
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
                    <FormLabel>
                      password <span className='text-red-600'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type='password' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm password <span className='text-red-600'>*</span>
                    </FormLabel>
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
            {form.formState.isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Sign up'}
          </Button>
          <Link href='/api/oauth/google'>
            <Button variant='outline' className='w-full'>
              Login with Google
            </Button>
          </Link>
        </div>
        <div className='mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/sign-in' className='underline'>
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
