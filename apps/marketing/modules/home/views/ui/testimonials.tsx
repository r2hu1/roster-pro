import { Button } from "@workspace/ui/components/button";
import { ArrowUpRightIcon } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Owner, Spice Junction",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    testimonial:
      "Our customers love the QR menu. Orders reach the kitchen instantly, and we've significantly reduced order mistakes during peak hours.",
  },
  {
    name: "Priya Nair",
    role: "Manager, Kerala Kitchen",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    testimonial:
      "The Scan-to-Order experience has made table service much faster. We now serve more customers without increasing staff, and the analytics help us understand our busiest hours.",
  },
  {
    name: "Amit Verma",
    role: "Owner, Chai & Co.",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    testimonial:
      "The sales dashboard shows exactly what's selling and what's not. It's helped us optimize our menu and increase revenue every month.",
  },
  {
    name: "Neha Kapoor",
    role: "Owner, Urban Bites",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    testimonial:
      "Setting up the QR menu took just a few minutes. Customers place orders themselves, and our staff can focus entirely on delivering great service.",
  },
  {
    name: "Vikram Singh",
    role: "Owner, Punjab Grill House",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    testimonial:
      "We've reduced waiting time, improved customer satisfaction, and gained valuable business insights—all from one platform.",
  },
  {
    name: "Ananya Desai",
    role: "Partner, Bombay Bistro",
    avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    testimonial:
      "From QR ordering to detailed analytics, everything works seamlessly. It's become an essential part of our daily restaurant operations.",
  },
];
export const Testimonials = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20">

    <div className="flex flex-wrap gap-10 items-center justify-between">
        <div className="md:max-w-xl text-left space-y-2">
          <h2 className="font-medium text-3xl tracking-[-0.04em] md:text-4xl">
        Loved by hundreds of restaurant owners.
      </h2>
      <p className="mt-2 text-balance text-lg text-muted-foreground tracking-[-0.015em] sm:mt-4">
        Their experiences speak louder than words, and we're proud to be part of their journey.
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

      <div className="mx-auto mt-16 max-w-5xl columns-1 gap-6 sm:columns-2 lg:columns-3">
        {testimonials.map(({ name, avatar, role, testimonial }, index) => (
          <div
            className="mb-6 break-inside-avoid rounded-lg border bg-muted p-1"
            key={index}
          >
            <div className="relative flex flex-col rounded-md border bg-linear-to-bl from-muted/50 via-background to-background px-5 pt-10 pb-3 dark:border-muted-foreground/30 dark:bg-background">
              {/* Quote */}
              <span className="absolute top-0 left-4 font-satoshi text-9xl text-foreground/30">
                &ldquo;
              </span>

              <p className="grow py-6 font-medium text-lg">{testimonial}</p>
              <div className="mt-2 flex items-center gap-3 py-3.5 sm:mt-4">
                <img
                  alt=""
                  className="h-12 w-12 rounded-full ring-2 ring-border ring-offset-[2px] ring-offset-background"
                  src={avatar}
                />
                <div className="flex flex-col">
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground text-sm">{role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
