import Transform from "@workspace/ui/components/transform"

export default function Preloader() {
  return (
    <div className="fixed bg-background z-100 flex inset-0 items-center justify-center">
      <div className="grid place-items-center space-y-3 text-center">
        <Transform className="size-10! bg-foreground!" />
        <h1 className="text-foreground/80 w-[150px] text-sm">
          Preparing your workspace...
        </h1>
      </div>
    </div>
  );
}
