/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useOrganizationOptions } from '@/hooks/use-organization'
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'


export type Organization = {
    id: string
    name: string
    slug: string
}

type OrganizationContextType = {
    organizations: Organization[]
    activeOrganization?: Organization
    setActiveOrganization: (org: Organization) => void
    isLoading: boolean
}

const OrganizationContext =
    createContext<OrganizationContextType | null>(null)

export function OrganizationProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { data = [], isLoading } = useOrganizationOptions()

    const [activeOrganization, setActiveOrganization] =
        useState<Organization | undefined>(undefined)

    /**
     * 🔥 Set default organization
     */
    useEffect(() => {
        if (!activeOrganization && data.length > 0) {
            setActiveOrganization(data[0])
        }
    }, [data, activeOrganization])

    return (
        <OrganizationContext.Provider
            value={{
                organizations: data,
                activeOrganization,
                setActiveOrganization,
                isLoading,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    const ctx = useContext(OrganizationContext)
    if (!ctx)
        throw new Error(
            'useOrganization must be used inside OrganizationProvider'
        )
    return ctx
}
