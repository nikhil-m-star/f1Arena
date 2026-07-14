export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 bg-zinc-900 rounded-lg w-1/3" />
        <div className="h-4 bg-zinc-900 rounded-lg w-1/2" />
      </div>
      
      <div className="h-32 bg-zinc-900 rounded-xl w-full" />

      <div className="space-y-4">
        <div className="h-6 bg-zinc-900 rounded-lg w-1/6" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-44 bg-zinc-900 rounded-xl" />
          <div className="h-44 bg-zinc-900 rounded-xl" />
          <div className="h-44 bg-zinc-900 rounded-xl" />
          <div className="h-44 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
