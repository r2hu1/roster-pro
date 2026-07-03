"use client"

import { Header } from "./header"

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Header />
      <main className="flex-1 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-muted-foreground text-lg">
              <strong>Last Updated:</strong> July 3, 2026
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              At RosterPro, we respect your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              what information we collect, how we use it, how we protect it, and
              the choices you have regarding your data.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              By accessing or using RosterPro, you agree to the collection and
              use of your information as described in this Privacy Policy.
            </p>
          </div>

          <div className="space-y-10">
            <Section title="1. Information We Collect">
              <p className="font-medium">Personal Information</p>
              <p className="mt-2">
                When you create an account or contact us, we may collect:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Restaurant or business name</li>
                <li>Business address</li>
                <li>Login credentials (stored securely)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <p className="mt-6 font-medium">Business Information</p>
              <p className="mt-2">
                When using RosterPro, you may upload or generate information
                including:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Restaurant details</li>
                <li>Menu information</li>
                <li>QR code configurations</li>
                <li>Customer orders</li>
                <li>Kitchen order data</li>
                <li>Billing and invoice information</li>
                <li>Inventory records</li>
                <li>Staff information</li>
                <li>Business analytics and reports</li>
              </ul>

              <p className="mt-6 font-medium">
                Automatically Collected Information
              </p>
              <p className="mt-2">
                When you use our website or platform, we may automatically
                collect:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Operating system</li>
                <li>Date and time of access</li>
                <li>Pages visited</li>
                <li>Referring website</li>
                <li>Usage statistics</li>
                <li>Error logs and diagnostic information</li>
              </ul>
              <p className="mt-4">
                This information helps us improve performance, reliability, and
                security.
              </p>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use your information to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Create and manage your account.</li>
                <li>Provide restaurant management services.</li>
                <li>Process customer orders.</li>
                <li>Generate invoices and reports.</li>
                <li>Manage subscriptions and payments.</li>
                <li>Improve platform performance and user experience.</li>
                <li>Respond to support requests.</li>
                <li>Send important service-related communications.</li>
                <li>Detect fraudulent or suspicious activity.</li>
                <li>Protect our platform from abuse.</li>
                <li>Comply with legal and regulatory obligations.</li>
              </ul>
              <p className="mt-4">
                We only collect information that is reasonably necessary to
                provide our services.
              </p>
            </Section>

            <Section title="3. Payment Information">
              <p>
                If you subscribe to a paid plan or purchase any service through
                RosterPro, payments are processed securely through trusted
                third-party payment gateways.
              </p>
              <p className="mt-4">
                For security reasons, RosterPro does <strong>not</strong> store
                your complete debit card number, credit card number, CVV, UPI
                PIN, net banking credentials, or other sensitive payment
                information.
              </p>
              <p className="mt-4">
                Depending on the payment method, we may receive limited
                payment-related information such as:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Customer name</li>
                <li>Billing email</li>
                <li>Billing address (where applicable)</li>
                <li>Transaction ID</li>
                <li>Payment status</li>
                <li>Subscription details</li>
                <li>Invoice information</li>
                <li>Payment timestamp</li>
              </ul>
              <p className="mt-4">We use this information to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Process and verify payments.</li>
                <li>Activate or renew subscriptions.</li>
                <li>Generate invoices and payment receipts.</li>
                <li>Manage refunds where applicable.</li>
                <li>Detect fraudulent transactions.</li>
                <li>Maintain accounting and tax records.</li>
                <li>Comply with legal obligations.</li>
              </ul>
              <p className="mt-4">
                All payment transactions are processed directly by our payment
                gateway providers using industry-standard security practices.
                Your use of those payment services is also subject to the
                respective payment provider&rsquo;s privacy policy and terms of
                service.
              </p>
            </Section>

            <Section title="4. Cookies and Similar Technologies">
              <p>We use cookies and similar technologies to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Keep you signed in.</li>
                <li>Remember your preferences.</li>
                <li>Improve website performance.</li>
                <li>Analyze website usage.</li>
                <li>Enhance security.</li>
                <li>Maintain user sessions.</li>
              </ul>
              <p className="mt-4">
                You may disable cookies through your browser settings, although
                some features of RosterPro may not function properly if cookies
                are disabled.
              </p>
            </Section>

            <Section title="5. How We Share Your Information">
              <p>
                We do <strong>not</strong> sell your personal information.
              </p>
              <p className="mt-4">
                We may share information only when necessary with trusted third
                parties, including:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Payment gateway providers</li>
                <li>Cloud hosting providers</li>
                <li>Email service providers</li>
                <li>SMS and notification providers</li>
                <li>Analytics providers</li>
                <li>Technical support providers</li>
                <li>
                  Government or regulatory authorities when required by law
                </li>
              </ul>
              <p className="mt-4">
                These service providers are permitted to use your information
                only for the services they perform on our behalf and are
                expected to protect it appropriately.
              </p>
            </Section>

            <Section title="6. Data Security">
              <p>Protecting your information is important to us.</p>
              <p className="mt-4">
                We implement reasonable technical and organizational measures to
                safeguard your information, including:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Secure HTTPS encryption</li>
                <li>Authentication and access controls</li>
                <li>Password protection</li>
                <li>Secure cloud infrastructure</li>
                <li>Regular security updates</li>
                <li>Monitoring for unauthorized access</li>
              </ul>
              <p className="mt-4">
                While we take reasonable precautions, no method of transmitting
                or storing information over the internet can be guaranteed to be
                completely secure.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                We retain your information only for as long as necessary to:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Provide our services.</li>
                <li>Maintain your account.</li>
                <li>Process payments.</li>
                <li>Generate invoices and financial records.</li>
                <li>Resolve disputes.</li>
                <li>Comply with tax, accounting, and legal obligations.</li>
                <li>Enforce our agreements.</li>
              </ul>
              <p className="mt-4">
                When information is no longer required, we will securely delete
                or anonymize it where reasonably practicable.
              </p>
            </Section>

            <Section title="8. Your Privacy Rights">
              <p>Subject to applicable laws, you may have the right to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Access your personal information.</li>
                <li>Correct inaccurate information.</li>
                <li>Request deletion of your information.</li>
                <li>Request a copy of your personal data.</li>
                <li>Withdraw consent where applicable.</li>
                <li>Object to certain data processing activities.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the contact
                details available on our website.
              </p>
            </Section>

            <Section title="9. Children&rsquo;s Privacy">
              <p>
                RosterPro is intended for businesses and individuals who are at
                least 18 years of age.
              </p>
              <p className="mt-4">
                We do not knowingly collect personal information from children.
                If we become aware that such information has been collected, we
                will take reasonable steps to delete it.
              </p>
            </Section>

            <Section title="10. Third-Party Services">
              <p>RosterPro may integrate with third-party services such as:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Payment gateways</li>
                <li>Cloud hosting providers</li>
                <li>Email delivery services</li>
                <li>SMS providers</li>
                <li>Analytics platforms</li>
                <li>Communication services</li>
              </ul>
              <p className="mt-4">
                These services operate under their own privacy policies and
                terms. We encourage you to review their policies before using
                those services.
              </p>
            </Section>

            <Section title="11. International Data Transfers">
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

            <Section title="12. Changes to This Privacy Policy">
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

            <Section title="13. Contact Us">
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

          <div className="mt-16 border-t border-border pt-8 text-center text-muted-foreground">
            <p>
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
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}
