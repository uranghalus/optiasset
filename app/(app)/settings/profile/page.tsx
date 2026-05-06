import React from 'react'
import ContentSection from '../components/content-section'
import FormProfile from './component/form-profile'

export default function page() {
    return (
        <ContentSection title='Profile Settings' desc='Update your personal information and profile settings.'>
            <FormProfile />
        </ContentSection>
    )
}
