export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col space-y-8 animate-pulse">
      <div className="bg-zinc-900 rounded-2xl h-32" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-900 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-zinc-900 rounded-xl" />
    </div>
  );
}
