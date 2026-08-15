export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-5 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function CompanySkeleton() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-9 w-64 mb-8" />
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>
      <div className="card p-6 mb-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="card p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}