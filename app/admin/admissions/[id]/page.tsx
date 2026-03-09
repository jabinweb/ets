import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ApplicationDetailClient } from "./application-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getApplication(id: string) {
  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        timeline: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return application
  } catch (error) {
    console.error('Error fetching application:', error)
    return null
  }
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const resolvedParams = await params
  const application = await getApplication(resolvedParams.id)

  if (!application) {
    notFound()
  }

  return <ApplicationDetailClient application={application} />
}
