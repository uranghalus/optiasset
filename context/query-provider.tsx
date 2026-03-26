"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: (failureCount, error) => {
                            if (process.env.NODE_ENV === "development") {
                                console.log({ failureCount, error })
                            }
                            return failureCount < 3
                        },
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        onError: (error) => {
                            console.error(error)
                        },
                    },
                },
            })
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
