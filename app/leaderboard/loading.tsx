export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 bg-zinc-900 rounded-lg w-1/3" />
        <div className="h-4 bg-zinc-900 rounded-lg w-1/2" />
      </div>

      <div className="bg-zinc-900/60 rounded-xl p-2 space-y-2">
        <div className="h-10 bg-zinc-900 rounded-lg w-full" />
        <div className="h-12 bg-zinc-900 rounded-lg w-full" />
        <div className="h-12 bg-zinc-900 rounded-lg w-full" />
        <div className="h-12 bg-zinc-900 rounded-lg w-full" />
        <div className="h-12 bg-zinc-900 rounded-lg w-full" />
        <div className="h-12 bg-zinc-900 rounded-lg w-full" />
      </div>
    </div>
  );
}
