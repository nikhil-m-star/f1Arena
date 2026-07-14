export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 grid gap-8 md:grid-cols-3 animate-pulse">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-3">
          <div className="h-9 bg-zinc-900 rounded-lg w-1/3" />
          <div className="h-4 bg-zinc-900 rounded-lg w-1/2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-36 bg-zinc-900 rounded-xl" />
          <div className="h-36 bg-zinc-900 rounded-xl" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-zinc-900 rounded-xl" />
        <div className="h-48 bg-zinc-900 rounded-xl" />
      </div>
    </div>
  );
}
