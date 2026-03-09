import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Apply Now | Evangelical Theological Seminary',
    description: 'Take the next step in your spiritual journey. Apply for our theological programs today.',
    openGraph: {
        title: 'Apply to Evangelical Theological Seminary',
        description: 'Transform your calling into ministry. Join ETS and grow in the knowledge of Christ.',
        type: 'website',
    }
}

export default function ApplyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
