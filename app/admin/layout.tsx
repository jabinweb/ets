import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  // Only allow admin access
  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <DashboardHeader user={session.user} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
