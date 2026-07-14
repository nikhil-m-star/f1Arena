export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col space-y-8 animate-pulse">
      <div className="h-28 bg-zinc-900 rounded-xl w-full" />
      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="h-24 bg-zinc-900 rounded-xl" />
        <div className="h-24 bg-zinc-900 rounded-xl" />
        <div className="h-24 bg-zinc-900 rounded-xl" />
        <div className="h-24 bg-zinc-900 rounded-xl" />
      </div>

      <div className="space-y-4">
        <div className="h-8 bg-zinc-900 rounded-lg w-1/4" />
        <div className="h-40 bg-zinc-900 rounded-xl w-full" />
      </div>
    </div>
  );
}
