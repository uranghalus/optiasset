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
import { authClient } from '@/lib/auth-client'
import Logo from './logo'
import { Checkbox } from './ui/checkbox'
import { ShieldCheck } from 'lucide-react'

function getSsoErrorMessage(code: string | null, description: string | null) {
    if (!code) return null

    switch (code) {
        case 'account_not_linked':
            return 'Akun ini belum terhubung ke data pengguna. Hubungi admin untuk menghubungkan akun Anda.'
        case 'signup_disabled':
            return 'Pendaftaran akun baru melalui SSO dinonaktifkan. Hubungi admin.'
        case 'access_denied':
            return 'Login SSO dibatalkan.'
        default:
            return description || `Login SSO gagal (${code}).`
    }
}

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSsoLoading, setIsSsoLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')
    const ssoError = getSsoErrorMessage(
        searchParams.get('error'),
        searchParams.get('error_description'),
    )

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

    async function onSsoLogin() {
        setIsSsoLoading(true)

        try {
            const result = await authClient.signIn.sso({
                providerId: 'opti-saml',
                callbackURL: redirect ?? '/dashboard',
                errorCallbackURL: '/login',
            })

            if (result?.error) {
                setIsSsoLoading(false)
                form.setError('root', {
                    type: 'server',
                    message: result.error.message ?? 'Gagal memulai login SSO',
                })
            }
        } catch {
            setIsSsoLoading(false)
            form.setError('root', {
                type: 'server',
                message: 'Gagal memulai login SSO',
            })
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:px-4 px-4">

            {/* GLOBAL ERROR */}
            {form.formState.errors.root?.message && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive font-medium">
                        {form.formState.errors.root.message}
                    </p>
                </div>
            )}

            {/* SSO ERROR */}
            {ssoError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive font-medium">
                        {ssoError}
                    </p>
                </div>
            )}

            <FieldGroup>
                <div className="flex flex-col items-center gap-3 text-center pb-2">
                    <a
                        href="#"
                        className="flex flex-col items-center gap-2 font-medium lg:hidden"
                    >
                        <Logo />
                        <span className="sr-only">Acme Inc.</span>
                    </a>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <FieldDescription>
                        Sign in to your account to continue
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
                    <Button type="submit" className="w-full h-10 text-sm" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </Button>
                </Field>

                <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">atau</span>
                    <span className="h-px flex-1 bg-border" />
                </div>

                <Field>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 text-sm"
                        onClick={onSsoLogin}
                        disabled={isSsoLoading || isLoading}
                    >
                        {isSsoLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Mengalihkan ke SSO...
                            </span>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Masuk dengan SSO OptiGate
                            </>
                        )}
                    </Button>
                </Field>
            </FieldGroup>
            <FieldDescription className="px-6 text-center text-[11px]">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </form>
    )
}