"use client"

import Glow from "@workspace/ui/components/glow"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const contactMethods = [
  {
    icon: <Mail className="size-5" />,
    title: "Email",
    description: "rosterprooo@gmail.com",
    href: "mailto:rosterprooo@gmail.com",
  },
  {
    icon: <Phone className="size-5" />,
    title: "Phone",
    description: "+91 8828780053",
    href: "tel:+918828780053",
  },
  {
    icon: <MapPin className="size-5" />,
    title: "Office",
    description: "Thane, Maharashtra , India",
    href: "#",
  },
]

export default function ContactPageView() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Contact form submission:", formData)
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="overflow-hidden px-6">
        <div className="relative mx-auto max-w-5xl w-full py-16 md:py-28 lg:py-24">
          <Glow variant="top" className="-z-10" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Get in Touch
            </h1>
            <p className="mx-auto my-8 text-muted-foreground max-w-2xl text-xl">
              Have a question, feedback, or want to learn more? We&apos;d love
              to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Methods */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Contact information
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Reach out to us through any of these channels and we&apos;ll
                  get back to you as soon as possible.
                </p>
              </div>
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <Link
                    key={method.title}
                    href={method.href}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background text-primary shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{method.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {method.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Message sent!</h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Thank you for reaching out. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: "", email: "", subject: "", message: "" })
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-semibold mb-5">
                    Send us a message
                  </h3>
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Full name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="hello@example.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-32"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full h-10" size="lg">
                    Send Message
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
