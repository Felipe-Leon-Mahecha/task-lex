export default function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--surface-2)] ${className}`} style={style} />
  )
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-full" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${70 + i * 10}%` }} />
      ))}
    </div>
  )
}
