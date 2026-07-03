"use client"

import { Header } from "./header"

export default function TermsAndConditions() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Header />
      <main className="flex-1 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-muted-foreground text-lg">
              <strong>Last Updated:</strong> July 3, 2026
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Welcome to RosterPro. These Terms &amp; Conditions explain the
              rules for using our website and services. By accessing or using
              RosterPro, you agree to these terms. If you do not agree with any
              part of these Terms, please do not use our platform.
            </p>
          </div>

          <div className="space-y-10">
            <Section title="1. About RosterPro">
              <p>
                RosterPro is a restaurant management platform designed to
                simplify restaurant operations. Our services may include
                QR-based ordering, kitchen order management, billing, staff
                management, analytics, and other features that help restaurants
                operate more efficiently.
              </p>
              <p className="mt-4">
                We may add, modify, or remove features over time to improve the
                platform.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>
                You must be at least 18 years old or have the legal authority to
                enter into a binding agreement on behalf of a business or
                organization.
              </p>
              <p className="mt-4">
                If you are using RosterPro on behalf of a company, you confirm
                that you have permission to bind that company to these Terms.
              </p>
            </Section>

            <Section title="3. Your Account">
              <p>When creating an account, you agree to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Provide accurate and up-to-date information.</li>
                <li>Keep your login credentials secure.</li>
                <li>
                  Notify us if you believe your account has been accessed
                  without authorization.
                </li>
                <li>
                  Take responsibility for all activity that occurs under your
                  account.
                </li>
              </ul>
              <p className="mt-4">
                We are not responsible for losses resulting from unauthorized
                access caused by your failure to protect your account.
              </p>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Use the platform for unlawful purposes.</li>
                <li>Attempt to gain unauthorized access to our systems.</li>
                <li>Upload viruses, malware, or harmful code.</li>
                <li>Interfere with the normal operation of the platform.</li>
                <li>
                  Reverse engineer, copy, or exploit our software without
                  written permission.
                </li>
                <li>
                  Use automated tools to scrape or collect data from the
                  platform without authorization.
                </li>
                <li>
                  Misrepresent your identity or impersonate another individual
                  or business.
                </li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts involved
                in abusive or illegal activity.
              </p>
            </Section>

            <Section title="5. Restaurant Data">
              <p>
                You retain ownership of the information you upload to RosterPro,
                including menus, orders, customer records, invoices, and
                business information.
              </p>
              <p className="mt-4">
                By using our services, you grant us permission to process and
                store your data solely for the purpose of providing and
                improving our services.
              </p>
              <p className="mt-4">
                You are responsible for ensuring that the information you upload
                is accurate and that you have the necessary rights to use it.
              </p>
            </Section>

            <Section title="6. Customer Orders">
              <p>Restaurants are solely responsible for:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Menu accuracy</li>
                <li>Pricing</li>
                <li>Taxes</li>
                <li>Discounts</li>
                <li>Food preparation</li>
                <li>Delivery (if applicable)</li>
                <li>Customer support related to food or services</li>
              </ul>
              <p className="mt-4">
                RosterPro provides the technology platform but is not
                responsible for disputes between restaurants and their
                customers.
              </p>
            </Section>

            <Section title="7. Payments">
              <p>Certain features may require payment.</p>
              <p className="mt-4">
                By purchasing a subscription or paid service, you agree to pay
                the applicable fees.
              </p>
              <p className="mt-4">Unless otherwise stated:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Payments are billed in advance.</li>
                <li>Fees are non-refundable except where required by law.</li>
                <li>
                  Failure to pay may result in suspension of premium features.
                </li>
              </ul>
              <p className="mt-4">
                Pricing may change in the future. We will provide reasonable
                notice before any pricing changes take effect.
              </p>
            </Section>

            <Section title="8. Availability">
              <p>
                We aim to keep RosterPro available at all times. However, we
                cannot guarantee uninterrupted access.
              </p>
              <p className="mt-4">The platform may occasionally experience:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Scheduled maintenance</li>
                <li>Security updates</li>
                <li>Unexpected outages</li>
                <li>Third-party service interruptions</li>
              </ul>
              <p className="mt-4">
                We are not liable for losses resulting from temporary downtime.
              </p>
            </Section>

            <Section title="9. Intellectual Property">
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

            <Section title="10. Privacy">
              <p>Your privacy matters to us.</p>
              <p className="mt-4">
                Our collection and use of personal information are governed by
                our Privacy Policy.
              </p>
              <p className="mt-4">
                By using RosterPro, you agree to the practices described in that
                policy.
              </p>
            </Section>

            <Section title="11. Third-Party Services">
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

            <Section title="12. Service Changes">
              <p>We may:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Add new features</li>
                <li>Modify existing features</li>
                <li>Remove outdated functionality</li>
                <li>Improve performance</li>
                <li>Update security measures</li>
              </ul>
              <p className="mt-4">
                We reserve the right to discontinue any feature when necessary.
              </p>
            </Section>

            <Section title="13. Account Suspension or Termination">
              <p>We may suspend or terminate your account if:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>You violate these Terms.</li>
                <li>Your activity threatens the security of the platform.</li>
                <li>You misuse our services.</li>
                <li>Payment obligations remain unpaid.</li>
                <li>We are required to do so by law.</li>
              </ul>
              <p className="mt-4">
                You may stop using RosterPro and close your account at any time.
              </p>
            </Section>

            <Section title="14. Disclaimer">
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

            <Section title="15. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, RosterPro and its
                owners, employees, affiliates, and partners will not be liable
                for:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Lost profits</li>
                <li>Loss of business</li>
                <li>Loss of revenue</li>
                <li>Data loss</li>
                <li>Indirect or consequential damages</li>
                <li>Business interruption</li>
              </ul>
              <p className="mt-4">
                Our total liability for any claim arising from your use of the
                platform will not exceed the amount you paid us during the
                twelve months preceding the claim.
              </p>
            </Section>

            <Section title="16. Indemnification">
              <p>
                You agree to indemnify and hold RosterPro harmless from claims,
                damages, liabilities, costs, and expenses arising from:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>Your misuse of the platform.</li>
                <li>Your violation of these Terms.</li>
                <li>Your violation of any law or third-party rights.</li>
              </ul>
            </Section>

            <Section title="17. Governing Law">
              <p>These Terms are governed by the laws of India.</p>
              <p className="mt-4">
                Any disputes arising from these Terms shall be subject to the
                exclusive jurisdiction of the courts located in India.
              </p>
            </Section>

            <Section title="18. Changes to These Terms">
              <p>We may update these Terms from time to time.</p>
              <p className="mt-4">
                When significant changes are made, we will update the
                &ldquo;Last Updated&rdquo; date. Continued use of the platform
                after changes become effective constitutes acceptance of the
                revised Terms.
              </p>
            </Section>

            <Section title="19. Contact Us">
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

          <div className="mt-16 border-t border-border pt-8 text-center text-muted-foreground">
            <p>
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
