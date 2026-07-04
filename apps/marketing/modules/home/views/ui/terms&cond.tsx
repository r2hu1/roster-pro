"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

const sections = [
  { id: "about", title: "About RosterPro" },
  { id: "eligibility", title: "Eligibility" },
  { id: "your-account", title: "Your Account" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "restaurant-data", title: "Restaurant Data" },
  { id: "customer-orders", title: "Customer Orders" },
  { id: "payments", title: "Payments" },
  { id: "availability", title: "Availability" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "privacy", title: "Privacy" },
  { id: "third-party-services", title: "Third-Party Services" },
  { id: "service-changes", title: "Service Changes" },
  { id: "account-termination", title: "Account Suspension or Termination" },
  { id: "disclaimer", title: "Disclaimer" },
  { id: "limitation-of-liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes-to-terms", title: "Changes to These Terms" },
  { id: "contact", title: "Contact Us" },
]

export default function TermsAndConditions() {
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
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              <strong className="text-foreground">Last Updated:</strong> July 3,
              2026
            </p>
            <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
              Welcome to RosterPro. These Terms &amp; Conditions explain the
              rules for using our website and services. By accessing or using
              RosterPro, you agree to these terms. If you do not agree with any
              part of these Terms, please do not use our platform.
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
              <Section id="about" number={1} title="About RosterPro">
                <p>
                  RosterPro is a restaurant management platform designed to
                  simplify restaurant operations. Our services may include
                  QR-based ordering, kitchen order management, billing, staff
                  management, analytics, and other features that help
                  restaurants operate more efficiently.
                </p>
                <p className="mt-4">
                  We may add, modify, or remove features over time to improve
                  the platform.
                </p>
              </Section>

              <Section id="eligibility" number={2} title="Eligibility">
                <p>
                  You must be at least 18 years old or have the legal authority
                  to enter into a binding agreement on behalf of a business or
                  organization.
                </p>
                <p className="mt-4">
                  If you are using RosterPro on behalf of a company, you confirm
                  that you have permission to bind that company to these Terms.
                </p>
              </Section>

              <Section id="your-account" number={3} title="Your Account">
                <p>When creating an account, you agree to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Provide accurate and up-to-date information.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Keep your login credentials secure.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Notify us if you believe your account has been accessed
                    without authorization.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Take responsibility for all activity that occurs under your
                    account.
                  </li>
                </ul>
                <p className="mt-4">
                  We are not responsible for losses resulting from unauthorized
                  access caused by your failure to protect your account.
                </p>
              </Section>

              <Section id="acceptable-use" number={4} title="Acceptable Use">
                <p>You agree not to:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Use the platform for unlawful purposes.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Attempt to gain unauthorized access to our systems.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Upload viruses, malware, or harmful code.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Interfere with the normal operation of the platform.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Reverse engineer, copy, or exploit our software without
                    written permission.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Use automated tools to scrape or collect data from the
                    platform without authorization.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Misrepresent your identity or impersonate another individual
                    or business.
                  </li>
                </ul>
                <p className="mt-4">
                  We reserve the right to suspend or terminate accounts involved
                  in abusive or illegal activity.
                </p>
              </Section>

              <Section id="restaurant-data" number={5} title="Restaurant Data">
                <p>
                  You retain ownership of the information you upload to
                  RosterPro, including menus, orders, customer records,
                  invoices, and business information.
                </p>
                <p className="mt-4">
                  By using our services, you grant us permission to process and
                  store your data solely for the purpose of providing and
                  improving our services.
                </p>
                <p className="mt-4">
                  You are responsible for ensuring that the information you
                  upload is accurate and that you have the necessary rights to
                  use it.
                </p>
              </Section>

              <Section id="customer-orders" number={6} title="Customer Orders">
                <p>Restaurants are solely responsible for:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Menu accuracy
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Pricing
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Taxes
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Discounts
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Food preparation
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Delivery (if applicable)
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Customer support related to food or services
                  </li>
                </ul>
                <p className="mt-4">
                  RosterPro provides the technology platform but is not
                  responsible for disputes between restaurants and their
                  customers.
                </p>
              </Section>

              <Section id="payments" number={7} title="Payments">
                <p>Certain features may require payment.</p>
                <p className="mt-4">
                  By purchasing a subscription or paid service, you agree to pay
                  the applicable fees.
                </p>
                <p className="mt-4">Unless otherwise stated:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payments are billed in advance.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Fees are non-refundable except where required by law.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Failure to pay may result in suspension of premium features.
                  </li>
                </ul>
                <p className="mt-4">
                  Pricing may change in the future. We will provide reasonable
                  notice before any pricing changes take effect.
                </p>
              </Section>

              <Section id="availability" number={8} title="Availability">
                <p>
                  We aim to keep RosterPro available at all times. However, we
                  cannot guarantee uninterrupted access.
                </p>
                <p className="mt-4">
                  The platform may occasionally experience:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Scheduled maintenance
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Security updates
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Unexpected outages
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Third-party service interruptions
                  </li>
                </ul>
                <p className="mt-4">
                  We are not liable for losses resulting from temporary
                  downtime.
                </p>
              </Section>

              <Section
                id="intellectual-property"
                number={9}
                title="Intellectual Property"
              >
                <p>
                  RosterPro, including its software, branding, logos, designs,
                  graphics, documentation, and content, is owned by us and
                  protected by applicable intellectual property laws.
                </p>
                <p className="mt-4">
                  You may not copy, modify, distribute, sell, or reproduce any
                  part of the platform without our written permission.
                </p>
              </Section>

              <Section id="privacy" number={10} title="Privacy">
                <p>Your privacy matters to us.</p>
                <p className="mt-4">
                  Our collection and use of personal information are governed by
                  our Privacy Policy.
                </p>
                <p className="mt-4">
                  By using RosterPro, you agree to the practices described in
                  that policy.
                </p>
              </Section>

              <Section
                id="third-party-services"
                number={11}
                title="Third-Party Services"
              >
                <p>
                  RosterPro may integrate with third-party providers such as
                  payment gateways, cloud hosting providers, email services,
                  messaging services, analytics platforms, or other external
                  tools.
                </p>
                <p className="mt-4">
                  We are not responsible for the availability, security, or
                  content of third-party services.
                </p>
                <p className="mt-4">
                  Your use of those services may also be subject to their own
                  terms and policies.
                </p>
              </Section>

              <Section id="service-changes" number={12} title="Service Changes">
                <p>We may:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Add new features
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Modify existing features
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Remove outdated functionality
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Improve performance
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Update security measures
                  </li>
                </ul>
                <p className="mt-4">
                  We reserve the right to discontinue any feature when
                  necessary.
                </p>
              </Section>

              <Section
                id="account-termination"
                number={13}
                title="Account Suspension or Termination"
              >
                <p>We may suspend or terminate your account if:</p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    You violate these Terms.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Your activity threatens the security of the platform.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    You misuse our services.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Payment obligations remain unpaid.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    We are required to do so by law.
                  </li>
                </ul>
                <p className="mt-4">
                  You may stop using RosterPro and close your account at any
                  time.
                </p>
              </Section>

              <Section id="disclaimer" number={14} title="Disclaimer">
                <p>
                  RosterPro is provided on an &ldquo;as is&rdquo; and &ldquo;as
                  available&rdquo; basis.
                </p>
                <p className="mt-4">
                  While we strive to provide a reliable platform, we do not
                  guarantee that the service will always be uninterrupted,
                  error-free, or suitable for every business need.
                </p>
                <p className="mt-4">
                  To the fullest extent permitted by law, we disclaim all
                  warranties, whether express or implied.
                </p>
              </Section>

              <Section
                id="limitation-of-liability"
                number={15}
                title="Limitation of Liability"
              >
                <p>
                  To the maximum extent permitted by law, RosterPro and its
                  owners, employees, affiliates, and partners will not be liable
                  for:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Lost profits
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Loss of business
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Loss of revenue
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Data loss
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Indirect or consequential damages
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Business interruption
                  </li>
                </ul>
                <p className="mt-4">
                  Our total liability for any claim arising from your use of the
                  platform will not exceed the amount you paid us during the
                  twelve months preceding the claim.
                </p>
              </Section>

              <Section id="indemnification" number={16} title="Indemnification">
                <p>
                  You agree to indemnify and hold RosterPro harmless from
                  claims, damages, liabilities, costs, and expenses arising
                  from:
                </p>
                <ul className="mt-3 space-y-2 pl-6">
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Your misuse of the platform.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Your violation of these Terms.
                  </li>
                  <li className="relative before:absolute before:top-2.5 before:-left-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40">
                    Your violation of any law or third-party rights.
                  </li>
                </ul>
              </Section>

              <Section id="governing-law" number={17} title="Governing Law">
                <p>These Terms are governed by the laws of India.</p>
                <p className="mt-4">
                  Any disputes arising from these Terms shall be subject to the
                  exclusive jurisdiction of the courts located in India.
                </p>
              </Section>

              <Section
                id="changes-to-terms"
                number={18}
                title="Changes to These Terms"
              >
                <p>We may update these Terms from time to time.</p>
                <p className="mt-4">
                  When significant changes are made, we will update the
                  &ldquo;Last Updated&rdquo; date. Continued use of the platform
                  after changes become effective constitutes acceptance of the
                  revised Terms.
                </p>
              </Section>

              <Section id="contact" number={19} title="Contact Us">
                <p>
                  If you have any questions regarding these Terms &amp;
                  Conditions, you can contact us through the contact information
                  provided on our website.
                </p>
                <p className="mt-4">
                  We will do our best to respond within a reasonable timeframe.
                </p>
              </Section>
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-border/60 bg-muted/40 p-8 text-center">
            <p className="text-muted-foreground leading-relaxed">
              Thank you for choosing RosterPro. We appreciate your trust and
              look forward to helping restaurants operate more efficiently.
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
