import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Terms of Service | Tac Accessories",
  description:
    "Read the Terms of Service for Tac Accessories, including use of services, orders, payments, and legal terms.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="nav-clearance pb-16 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5 relative overflow-hidden">
        <div className="absolute inset-0 afro-pattern-stars opacity-5" />
        <div className="gallery-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">Terms of</span>
              <br />
              <span className="text-foreground">Service</span>
            </h1>
            <p className="text-xl text-muted-foreground luxury-text leading-relaxed">
              Last Updated: March 17, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="gallery-container">
          <article className="max-w-5xl mx-auto rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-10 space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Tac Accessories. These Terms of Service ("Terms") govern your access to and use of our website, products, and related services available at{" "}
              <Link href="https://www.tacaccessories.co.ke/" className="text-primary hover:underline">
                https://www.tacaccessories.co.ke/
              </Link>{" "}
              (collectively, the "Services").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use our Services.
            </p>

            <hr className="border-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">1. ELIGIBILITY AND ACCOUNT USE</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>You must be at least 18 years old, or the age of majority in your jurisdiction, to place orders.</li>
                <li>You agree to provide accurate, complete, and current information during checkout or account registration.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
                <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">2. PRODUCTS, PRICING, AND AVAILABILITY</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>We strive to display product descriptions, images, and pricing accurately, but errors may occur.</li>
                <li>All products are subject to availability, and we reserve the right to discontinue any product at any time.</li>
                <li>Prices may change without notice. The price charged is the one displayed at checkout at the time your order is placed.</li>
                <li>Promotions and discount codes may be subject to separate terms and may be changed or withdrawn at any time.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">3. ORDERS AND ACCEPTANCE</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Your order is an offer to purchase and is subject to our acceptance.</li>
                <li>We may refuse or cancel orders for reasons including suspected fraud, pricing errors, or stock issues.</li>
                <li>If payment has already been processed for a canceled order, we will issue an appropriate refund.</li>
                <li>You are responsible for ensuring shipping and contact details are correct before submitting an order.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">4. PAYMENTS</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Payments are processed securely through third-party providers, including PesaPal.</li>
                <li>By submitting payment information, you represent that you are authorized to use the selected payment method.</li>
                <li>You agree to pay all charges incurred, including applicable taxes, shipping fees, and duties where relevant.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">5. SHIPPING, DELIVERY, AND RISK</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Estimated shipping timelines are provided for convenience and are not guaranteed unless expressly stated.</li>
                <li>Delivery delays can occur due to customs, carrier issues, or events beyond our control.</li>
                <li>Risk of loss and title transfer as permitted by applicable law when the order is delivered to the carrier or to you, depending on shipment terms.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">6. RETURNS, REFUNDS, AND EXCHANGES</h2>
              <p className="text-muted-foreground leading-relaxed">
                Returns, refunds, and exchanges are handled in accordance with our returns practices as communicated on the Services or by customer support. We may refuse returns that do not meet eligibility conditions (for example, damaged, used, or non-returnable items where permitted by law).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">7. INTELLECTUAL PROPERTY</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>All content on the Services, including text, graphics, logos, product photos, designs, and software, is owned by or licensed to Tac Accessories.</li>
                <li>You may not copy, reproduce, distribute, modify, or create derivative works from our content without prior written permission.</li>
                <li>Tac Accessories names, logos, and marks are protected trademarks and may not be used without authorization.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">8. ACCEPTABLE USE</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Use the Services for unlawful, fraudulent, or abusive purposes.</li>
                <li>Interfere with or disrupt the integrity or performance of the Services.</li>
                <li>Attempt to gain unauthorized access to systems, accounts, or data.</li>
                <li>Upload malicious code, bots, or scripts intended to harm the Services or other users.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">9. THIRD-PARTY LINKS AND SERVICES</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Services may contain links to third-party websites or integrations. We do not control and are not responsible for the content, policies, or practices of third parties. Your use of third-party services is governed by their own terms and privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">10. DISCLAIMERS</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, the Services and all content are provided "as is" and "as available" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">11. LIMITATION OF LIABILITY</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Tac Accessories and its affiliates, officers, employees, and partners shall not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill arising from or related to your use of the Services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">12. INDEMNIFICATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Tac Accessories from and against claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or connected with your use of the Services or breach of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">13. TERMINATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access to the Services at our discretion, with or without notice, if we believe you have violated these Terms or applicable law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">14. GOVERNING LAW</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by and construed in accordance with the laws applicable in Kenya, without regard to conflict of laws principles. You agree to submit to the competent courts for disputes arising from these Terms, subject to mandatory consumer protection laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">15. CHANGES TO THESE TERMS</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Updated Terms become effective when posted on this page unless stated otherwise. Your continued use of the Services after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">16. CONTACT US</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Company: Tac Accessories</li>
                <li>
                  Email:{" "}
                  <Link href="mailto:info@tacaccessories.co.ke" className="text-primary hover:underline">
                    info@tacaccessories.co.ke
                  </Link>
                </li>
                <li>
                  Website:{" "}
                  <Link href="https://www.tacaccessories.co.ke/" className="text-primary hover:underline">
                    https://www.tacaccessories.co.ke/
                  </Link>
                </li>
              </ul>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
