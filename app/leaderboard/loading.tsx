export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col animate-pulse">
      <div className="h-10 w-48 bg-zinc-900 rounded-lg mb-8" />
      <div className="bg-zinc-900 rounded-xl h-96" />
    </div>
  );
}
