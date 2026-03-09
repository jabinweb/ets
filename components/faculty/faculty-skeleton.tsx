import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FacultySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-full">
          <div className="relative h-64">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-6 space-y-4">
            <div>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <Skeleton className="h-16 w-full" />
            
            <div className="pt-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
