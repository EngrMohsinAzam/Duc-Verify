export function VerifyStamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-10 select-none ${className}`}
      aria-hidden
    >
      <div className="relative rotate-[-14deg]">
        <div className="rounded-full border-[3px] border-red-600/90 px-5 py-3 shadow-lg shadow-red-500/10">
          <div className="rounded-full border-2 border-dashed border-red-500/80 px-4 py-2">
            <p className="text-center text-lg font-black uppercase tracking-[0.25em] text-red-600/95 sm:text-xl">
              Verify
            </p>
            <p className="mt-0.5 text-center text-[8px] font-semibold uppercase tracking-widest text-red-500/80">
              DocVerify
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
