import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SignupLoading() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="mx-auto h-6 w-40" />
              <Skeleton className="mx-auto h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="mx-auto h-4 w-48" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="mx-auto h-4 w-72" />
        </div>
      </div>
    </div>
  )
}
