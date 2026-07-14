export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col space-y-6 animate-pulse">
      <div className="h-4 bg-zinc-900 rounded w-24 mb-2" />
      <div className="h-32 bg-zinc-900 rounded-xl w-full" />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div className="h-96 bg-zinc-900 rounded-xl w-full" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-zinc-900 rounded-xl w-full" />
          <div className="h-72 bg-zinc-900 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
