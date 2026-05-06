import React from 'react'
import ContentSection from '../components/content-section'
import PasswordForm from './components/password-form'
import { Button } from '@/components/ui/button'
import { ItemContent, ItemTitle, ItemDescription, ItemActions, Item } from '@/components/ui/item'

import { ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function AccountPage() {
    return (
        <ContentSection title='Account Settings' desc='Manage your account settings, including email preferences and security options.'>
            <ScrollArea>
                <div className="space-y-4">
                    <PasswordForm />
                    <Separator />
                    <Item variant="outline">
                        <ItemContent>
                            <ItemTitle>Kata Sandi</ItemTitle>
                            <ItemDescription>
                                Ubah password akun anda
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant="outline" size="icon" >
                                <ChevronRight />
                            </Button>
                        </ItemActions>
                    </Item>
                </div>
            </ScrollArea>
        </ContentSection>
    )
}
