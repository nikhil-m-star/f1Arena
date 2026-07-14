export default function Loading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <section className="bg-zinc-950 py-20 px-6 sm:py-28">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <div className="h-4 w-40 bg-zinc-900 rounded-full mx-auto" />
          <div className="h-16 w-3/4 bg-zinc-900 rounded-lg mx-auto" />
          <div className="h-5 w-1/2 bg-zinc-900 rounded-lg mx-auto" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-6 py-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div className="h-64 bg-zinc-900 rounded-2xl" />
          <div className="h-48 bg-zinc-900 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-56 bg-zinc-900 rounded-2xl" />
          <div className="h-40 bg-zinc-900 rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
