import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar user={session.user} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <DashboardHeader
            user={{
              id: session.user?.id ?? undefined,
              name: session.user?.name ?? undefined,
              email: session.user?.email ?? undefined,
              image: session.user?.image ?? undefined,
              role: session.user?.role ?? undefined,
            }}
          />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
