export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col animate-pulse">
      <div className="h-10 w-40 bg-zinc-900 rounded-lg mb-10" />
      <div className="h-48 bg-zinc-900 rounded-2xl mb-12" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-zinc-900 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
