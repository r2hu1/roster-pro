"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

const sections = [
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "payment-information", title: "Payment Information" },
  { id: "cookies", title: "Cookies and Similar Technologies" },
  { id: "how-we-share", title: "How We Share Your Information" },
  { id: "data-security", title: "Data Security" },
  { id: "data-retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Privacy Rights" },
  { id: "childrens-privacy", title: "Children&rsquo;s Privacy" },
  { id: "third-party-services", title: "Third-Party Services" },
  { id: "international-transfers", title: "International Data Transfers" },
  { id: "changes-to-policy", title: "Changes to This Privacy Policy" },
  { id: "contact", title: "Contact Us" },
]

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-bold text-primary text-xs uppercase tracking-widest">
              Legal
            </span>
            <h1 className="mt-4 text-balance font-semibold text-4xl tracking-[-0.04em] md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Last Updated:</strong> July 3,
              2026
            </p>
            <p className="mt-6 max-w-4xl text-muted-foreground leading-relaxed">
              At RosterPro, we respect your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              what information we collect, how we use it, how we protect it, and
              the choices you have regarding your data.
            </p>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              By accessing or using RosterPro, you agree to the collection and
              use of your information as described in this Privacy Policy.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-12">
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                      activeId === section.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="space-y-6">
              <Section
                id="information-we-collect"
                number={1}
                title="Information We Collect"
              >
                <p className="font-medium text-foreground">
                  Personal Information
                </p>
                <p className="mt-2">
                  When you create an account or contact us, we may collect:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Full name
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Email address
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Phone number
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Restaurant or business name
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Business address
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Login credentials (stored securely)
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Profile information you choose to provide
                  </li>
                </ul>

                <p className="mt-6 font-medium text-foreground">
                  Business Information
                </p>
                <p className="mt-2">
                  When using RosterPro, you may upload or generate information
                  including:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Restaurant details
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Menu information
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    QR code configurations
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Customer orders
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Kitchen order data
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Billing and invoice information
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Inventory records
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Staff information
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Business analytics and reports
                  </li>
                </ul>

                <p className="mt-6 font-medium text-foreground">
                  Automatically Collected Information
                </p>
                <p className="mt-2">
                  When you use our website or platform, we may automatically
                  collect:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    IP address
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Browser type
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Device information
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Operating system
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Date and time of access
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Pages visited
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Referring website
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Usage statistics
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Error logs and diagnostic information
                  </li>
                </ul>
                <p className="mt-4">
                  This information helps us improve performance, reliability,
                  and security.
                </p>
              </Section>

              <Section
                id="how-we-use"
                number={2}
                title="How We Use Your Information"
              >
                <p>We use your information to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Create and manage your account.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Provide restaurant management services.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Process customer orders.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Generate invoices and reports.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Manage subscriptions and payments.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Improve platform performance and user experience.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Respond to support requests.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Send important service-related communications.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Detect fraudulent or suspicious activity.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Protect our platform from abuse.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Comply with legal and regulatory obligations.
                  </li>
                </ul>
                <p className="mt-4">
                  We only collect information that is reasonably necessary to
                  provide our services.
                </p>
              </Section>

              <Section
                id="payment-information"
                number={3}
                title="Payment Information"
              >
                <p>
                  If you subscribe to a paid plan or purchase any service
                  through RosterPro, payments are processed securely through
                  trusted third-party payment gateways.
                </p>
                <p className="mt-4">
                  For security reasons, RosterPro does <strong>not</strong>{" "}
                  store your complete debit card number, credit card number,
                  CVV, UPI PIN, net banking credentials, or other sensitive
                  payment information.
                </p>
                <p className="mt-4">
                  Depending on the payment method, we may receive limited
                  payment-related information such as:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Customer name
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Billing email
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Billing address (where applicable)
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Transaction ID
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payment status
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Subscription details
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Invoice information
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payment timestamp
                  </li>
                </ul>
                <p className="mt-4">We use this information to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Process and verify payments.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Activate or renew subscriptions.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Generate invoices and payment receipts.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Manage refunds where applicable.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Detect fraudulent transactions.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Maintain accounting and tax records.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Comply with legal obligations.
                  </li>
                </ul>
                <p className="mt-4">
                  All payment transactions are processed directly by our payment
                  gateway providers using industry-standard security practices.
                  Your use of those payment services is also subject to the
                  respective payment provider&rsquo;s privacy policy and terms
                  of service.
                </p>
              </Section>

              <Section
                id="cookies"
                number={4}
                title="Cookies and Similar Technologies"
              >
                <p>We use cookies and similar technologies to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Keep you signed in.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Remember your preferences.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Improve website performance.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Analyze website usage.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Enhance security.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Maintain user sessions.
                  </li>
                </ul>
                <p className="mt-4">
                  You may disable cookies through your browser settings,
                  although some features of RosterPro may not function properly
                  if cookies are disabled.
                </p>
              </Section>

              <Section
                id="how-we-share"
                number={5}
                title="How We Share Your Information"
              >
                <p>
                  We do <strong>not</strong> sell your personal information.
                </p>
                <p className="mt-4">
                  We may share information only when necessary with trusted
                  third parties, including:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payment gateway providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Cloud hosting providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Email service providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    SMS and notification providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Analytics providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Technical support providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Government or regulatory authorities when required by law
                  </li>
                </ul>
                <p className="mt-4">
                  These service providers are permitted to use your information
                  only for the services they perform on our behalf and are
                  expected to protect it appropriately.
                </p>
              </Section>

              <Section id="data-security" number={6} title="Data Security">
                <p>Protecting your information is important to us.</p>
                <p className="mt-4">
                  We implement reasonable technical and organizational measures
                  to safeguard your information, including:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Secure HTTPS encryption
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Authentication and access controls
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Password protection
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Secure cloud infrastructure
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Regular security updates
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Monitoring for unauthorized access
                  </li>
                </ul>
                <p className="mt-4">
                  While we take reasonable precautions, no method of
                  transmitting or storing information over the internet can be
                  guaranteed to be completely secure.
                </p>
              </Section>

              <Section id="data-retention" number={7} title="Data Retention">
                <p>
                  We retain your information only for as long as necessary to:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Provide our services.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Maintain your account.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Process payments.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Generate invoices and financial records.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Resolve disputes.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Comply with tax, accounting, and legal obligations.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Enforce our agreements.
                  </li>
                </ul>
                <p className="mt-4">
                  When information is no longer required, we will securely
                  delete or anonymize it where reasonably practicable.
                </p>
              </Section>

              <Section id="your-rights" number={8} title="Your Privacy Rights">
                <p>Subject to applicable laws, you may have the right to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Access your personal information.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Correct inaccurate information.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Request deletion of your information.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Request a copy of your personal data.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Withdraw consent where applicable.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Object to certain data processing activities.
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the contact
                  details available on our website.
                </p>
              </Section>

              <Section
                id="childrens-privacy"
                number={9}
                title="Children&rsquo;s Privacy"
              >
                <p>
                  RosterPro is intended for businesses and individuals who are
                  at least 18 years of age.
                </p>
                <p className="mt-4">
                  We do not knowingly collect personal information from
                  children. If we become aware that such information has been
                  collected, we will take reasonable steps to delete it.
                </p>
              </Section>

              <Section
                id="third-party-services"
                number={10}
                title="Third-Party Services"
              >
                <p>
                  RosterPro may integrate with third-party services such as:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payment gateways
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Cloud hosting providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Email delivery services
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    SMS providers
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Analytics platforms
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Communication services
                  </li>
                </ul>
                <p className="mt-4">
                  These services operate under their own privacy policies and
                  terms. We encourage you to review their policies before using
                  those services.
                </p>
              </Section>

              <Section
                id="international-transfers"
                number={11}
                title="International Data Transfers"
              >
                <p>
                  Depending on the services we use, your information may be
                  processed or stored in countries other than your own.
                </p>
                <p className="mt-4">
                  Where such transfers occur, we take reasonable measures to
                  ensure your information receives an appropriate level of
                  protection.
                </p>
              </Section>

              <Section
                id="changes-to-policy"
                number={12}
                title="Changes to This Privacy Policy"
              >
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our services, legal requirements, or operational
                  practices.
                </p>
                <p className="mt-4">
                  When significant changes are made, we will update the
                  &ldquo;Last Updated&rdquo; date at the top of this page.
                </p>
                <p className="mt-4">
                  Your continued use of RosterPro after changes become effective
                  constitutes your acceptance of the revised Privacy Policy.
                </p>
              </Section>

              <Section id="contact" number={13} title="Contact Us">
                <p>
                  If you have any questions about this Privacy Policy or how we
                  handle your information, please contact us using the contact
                  information available on our website.
                </p>
                <p className="mt-4">
                  We will make reasonable efforts to respond to your inquiry as
                  promptly as possible.
                </p>
              </Section>
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-border/60 bg-muted/40 p-8 text-center">
            <p className="text-muted-foreground leading-relaxed">
              Thank you for choosing RosterPro. We are committed to protecting
              your privacy while providing a secure, reliable, and efficient
              platform to help restaurants manage their operations.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="rounded-xl border border-border/60 bg-card p-6 md:p-8"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xs">
          {number}
        </span>
        <h2 className="font-semibold text-lg tracking-[-0.005em]">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}
