export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-16 w-2/3 rounded-full bg-sand/70" />
        <div className="h-[28rem] rounded-[2rem] bg-sand/60" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[28rem] rounded-[2rem] bg-sand/55" />
          ))}
        </div>
      </div>
    </div>
  );
}
