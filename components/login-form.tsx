'use client'

import { LoginSchema } from '@/schema/auth-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import React, { useEffect, useState } from 'react'
import z from 'zod'

import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'


import { Button } from './ui/button'

import { PasswordInput } from './password-input'
import { loginAction } from '@/action/auth-action'
import Logo from './logo'
import { Checkbox } from './ui/checkbox'

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    })

    useEffect(() => {
        form.clearErrors('root')
    }, [form.watch('email'), form.watch('password')])

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        setIsLoading(true)

        try {
            const res = await loginAction(values)

            if (res.status === 'error') {
                if (res.fieldErrors?.email) {
                    form.setError('email', {
                        type: 'server',
                        message: res.fieldErrors.email,
                    })
                }

                if (res.fieldErrors?.password) {
                    form.setError('password', {
                        type: 'server',
                        message: res.fieldErrors.password,
                    })
                }

                if (res.message) {
                    form.setError('root', {
                        type: 'server',
                        message: res.message,
                    })
                }

                return
            }

            toast.success('Berhasil login', {
                description: res.message,
            })

            router.push(redirect ?? '/dashboard')
        } catch {
            form.setError('root', {
                type: 'server',
                message: 'Terjadi kesalahan server',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:px-4 px-4">

            {/* GLOBAL ERROR */}
            {form.formState.errors.root?.message && (
                <p className="text-sm text-red-500">
                    {form.formState.errors.root.message}
                </p>
            )}

            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <a
                        href="#"
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        <Logo />
                        <span className="sr-only">Acme Inc.</span>
                    </a>
                    <h1 className="text-xl font-bold">Welcome to OptimaAsset</h1>
                    <FieldDescription>
                        Don&apos;t have an account? <a href="#">Sign up</a>
                    </FieldDescription>
                </div>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Email</FieldLabel>
                            <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                {/* PASSWORD */}
                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Password</FieldLabel>
                            <PasswordInput
                                {...field}
                                placeholder="Password"
                                autoComplete="current-password"
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                {/* REMEMBER ME */}
                <Controller
                    name="rememberMe"
                    control={form.control}
                    render={({ field }) => (
                        <Field orientation={'horizontal'}>
                            <Checkbox
                                className='w-4 h-4'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <FieldLabel>Remember me</FieldLabel>
                        </Field>
                    )}
                />
                <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Login'}
                    </Button>
                </Field>
            </FieldGroup>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </form>
    )
}