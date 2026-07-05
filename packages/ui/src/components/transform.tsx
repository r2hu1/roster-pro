import { cn } from '@workspace/ui/lib/utils';

export default function TransformLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        `bg-primary h-6 w-6 animate-[morphSpin_2s_ease-in-out_infinite] ${className}`,
      )}
    ></div>
  );
}
