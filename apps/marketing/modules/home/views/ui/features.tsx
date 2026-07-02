import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  AppWindow,
  ArrowUpRightIcon,
  BinocularsIcon,
  ChartArea,
  ChefHat,
  GlobeIcon,
  HouseIcon,
  LockIcon,
  ReceiptText,
  RockingChair,
  ScanQrCode,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";

const plusPoints = [
  {
    icon: AppWindow,
    title: "Menu Management",
    description:
      "Manage your restaurant menu with ease, from adding items to updating prices.",
  },
  {
    icon: ScanQrCode,
    title: "QR Ordering",
    description: "Your customers will scan a QR code to view menu and place an order in real-time.",
  },
  {
    icon: ReceiptText,
    title: "GST Compliance Billing",
    description: "No need to worry about GST compliance billing, we handle it for you.",
  },
  {
    icon: RockingChair,
    title: "Table Management",
    description:
      "Manage your restaurant tables with ease, from adding tables to updating seat capacity.",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    description: "Get live orders on the kitchen screen in real-time. Update order status from the kitchen screen.",
  },
  {
    icon: ChartArea,
    title: "Live Analytics",
    description:
      "Get real-time insights into your restaurant's performance, revenue and customer behavior.",
  },
];

export function Features() {
  return (
    <div
      className="mx-auto max-w-(--breakpoint-xl) overflow-clip  px-6 py-12 sm:py-20 text-center"
      id="why-choose-us"
    >
      <div className="flex flex-wrap gap-10 items-center justify-between">
      <div className="md:max-w-xl text-left space-y-2">
        <h2 className="text-balance font-medium text-3xl md:text-4xl leading-[1.3] tracking-[-0.04em]">
          Lightning Fast Restaurant Management Solution.
        </h2>
        <p className="text-pretty text-muted-foreground text-lg -tracking-[0.01em]">
          Advanced restaurant management system that delivers lightning fast performance and seamless customer experiences.
          </p>
        </div>
        <div className="flex md:flex-col-reverse items-center gap-2">
          <Button size="lg" variant="secondary">
            Schedule Meeting
          </Button>
          <Button size="lg">
            Get Started <ArrowUpRightIcon/>
          </Button>
        </div>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 border nth-3:border sm:grid-cols-2 lg:grid-cols-3">
        <div className="mask-y-from-95% absolute -inset-y-14 left-0 -translate-x-px border-s border-dashed" />
        <div className="mask-y-from-95% absolute -inset-y-14 right-0 translate-x-px border-s border-dashed" />
        <div className="mask-x-from-95% absolute -inset-x-14 top-0 -translate-y-px border-t border-dashed" />
        <div className="mask-x-from-95% absolute -inset-x-14 bottom-0 translate-y-px border-b border-dashed" />

        {plusPoints.map((plusPoint, index) => (
          <div
            className={cn(
              "relative -mt-px flex w-full flex-col items-center gap-2 border-t p-6 pt-9 odd:bg-muted/40",
              "lg:not-[&:nth-child(3n+1)]:border-e",
              "max-sm:odd:border-e-0 max-lg:odd:border-e"
            )}
            key={index}
          >
            <plusPoint.icon className="size-12 fill-foreground/10 stroke-[1.5px] text-foreground" />
            <h3 className="mt-6 font-medium text-lg tracking-[-0.005em]">
              {plusPoint.title}
            </h3>
            <p className="mb-6 text-balance text-muted-foreground">
              {plusPoint.description}
            </p>
            {/*<Button className="mt-auto font-medium" variant="link">
              Learn More <ArrowUpRightIcon />
            </Button>*/}
          </div>
        ))}
      </div>
    </div>
  );
}
