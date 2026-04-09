import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | Tac Accessories",
  description:
    "Read the Tac Accessories Privacy Policy, including data collection, use, sharing, and privacy rights.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="nav-clearance pb-16 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5 relative overflow-hidden">
        <div className="absolute inset-0 afro-pattern-stars opacity-5" />
        <div className="gallery-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">Privacy</span>
              <br />
              <span className="text-foreground">Policy</span>
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
              This Privacy Policy describes how Tac Accessories ("we," "us," or "our") collects, uses, and shares information about you when you use our website/application Tac Accessories (
              <Link href="https://www.tacaccessories.co.ke/" className="text-primary hover:underline">
                https://www.tacaccessories.co.ke/
              </Link>
              ).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>

            <hr className="border-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">1. INFORMATION WE COLLECT</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect several types of information for various purposes to provide and improve our service to you.
              </p>

              <h3 className="text-xl font-semibold luxury-heading">1.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use our services, we may collect the following personal information:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Mailing address</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
              </ul>

              <h3 className="text-xl font-semibold luxury-heading">1.2 Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information when you visit our website/app, including:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on each page</li>
                <li>Date and time of your visit</li>
                <li>Referring website addresses</li>
                <li>Clickstream data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                This information helps us understand how our services are being used and improve user experience.
              </p>

              <h3 className="text-xl font-semibold luxury-heading">1.3 Cookies and Tracking Technologies</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are small data files stored on your device.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
              <p className="text-muted-foreground leading-relaxed">Types of cookies we use:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Session Cookies: To operate our service</li>
                <li>Preference Cookies: To remember your preferences and settings</li>
                <li>Security Cookies: For security purposes</li>
                <li>Analytics Cookies: To analyze how you use our service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">2. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed">We use the collected information for various purposes:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To communicate with you about products, services, offers, and events</li>
                <li>To analyze usage patterns and trends</li>
                <li>To process transactions and send transaction notifications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We will not use your information for purposes other than those described in this Privacy Policy without your explicit consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">3. SHARING YOUR INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Service Providers: We may employ third-party companies and individuals to facilitate our service, provide service on our behalf, perform service-related tasks, or assist us in analyzing how our service is used.
                </li>
                <li>
                  Legal Requirements: We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
                </li>
                <li>
                  Business Transfers: If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred. We will provide notice before your personal information is transferred and becomes subject to a different Privacy Policy.
                </li>
                <li>
                  With Your Consent: We may disclose your personal information for any other purpose with your consent.
                </li>
              </ul>

              <h3 className="text-xl font-semibold luxury-heading">3.1 Third-Party Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use the following types of third-party services that may collect information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Analytics Services: We use analytics services (such as Google Analytics) to understand how users interact with our website/app. These services may use cookies and collect usage data.
                </li>
                <li>
                  Social Media Platforms: We integrate with social media platforms that may collect information about your interactions with their features on our service.
                </li>
                <li>Other Third-Party Services: PesaPal for Payments</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These third-party service providers have their own privacy policies addressing how they use such information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">4. YOUR RIGHTS UNDER GDPR (European Users)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Right to Access: You have the right to request copies of your personal data.</li>
                <li>Right to Rectification: You have the right to request correction of inaccurate or incomplete personal data.</li>
                <li>Right to Erasure: You have the right to request deletion of your personal data under certain circumstances.</li>
                <li>Right to Restrict Processing: You have the right to request restriction of processing your personal data.</li>
                <li>Right to Data Portability: You have the right to request transfer of your data to another organization or directly to you.</li>
                <li>Right to Object: You have the right to object to our processing of your personal data.</li>
                <li>Right to Withdraw Consent: If we rely on your consent to process your data, you have the right to withdraw that consent at any time.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise any of these rights, please contact us at info@tacaccessories.co.ke. We will respond to your request within one month.
              </p>
              <p className="text-muted-foreground leading-relaxed">Legal Basis for Processing:</p>
              <p className="text-muted-foreground leading-relaxed">
                We process your personal data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Consent: You have given clear consent for us to process your personal data for specific purposes</li>
                <li>Contract: Processing is necessary for a contract we have with you</li>
                <li>Legal Obligation: Processing is necessary for us to comply with the law</li>
                <li>Legitimate Interests: Processing is necessary for our legitimate interests</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">5. YOUR RIGHTS UNDER CCPA/CPRA (California Residents)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Right to Know: You have the right to request information about the categories and specific pieces of personal information we have collected about you, as well as the categories of sources from which the information is collected, the purpose for collecting it, and the categories of third parties with whom we share it.
                </li>
                <li>
                  Right to Delete: You have the right to request deletion of your personal information, subject to certain exceptions.
                </li>
                <li>Right to Opt-Out: You have the right to opt-out of the sale of your personal information. We do not sell personal information.</li>
                <li>Right to Non-Discrimination: You have the right not to receive discriminatory treatment for exercising your privacy rights.</li>
                <li>Right to Correct: You have the right to request correction of inaccurate personal information.</li>
                <li>Right to Limit Use of Sensitive Personal Information: You have the right to limit the use and disclosure of sensitive personal information.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us at info@tacaccessories.co.ke. We will verify your identity before processing your request and respond within 45 days.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell personal information and have not sold personal information in the preceding 12 months.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">6. PIPEDA COMPLIANCE (Canadian Users)</h2>
              <p className="text-muted-foreground leading-relaxed">
                We comply with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA). If you are a Canadian resident, you have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Right to Access: You have the right to access your personal information held by us.</li>
                <li>Right to Accuracy: You have the right to challenge the accuracy and completeness of your information and have it amended as appropriate.</li>
                <li>Right to Withdraw Consent: You may withdraw your consent to our collection, use, or disclosure of your personal information at any time, subject to legal or contractual restrictions.</li>
                <li>Right to File a Complaint: You have the right to file a complaint with the Privacy Commissioner of Canada if you believe your privacy rights have been violated.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">PIPEDA Principles We Follow:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Accountability: We are responsible for personal information under our control</li>
                <li>Identifying Purposes: We identify the purposes for which personal information is collected</li>
                <li>Consent: We obtain your consent when collecting, using, or disclosing your personal information</li>
                <li>Limiting Collection: We limit collection of personal information to what is necessary</li>
                <li>Limiting Use, Disclosure, and Retention: We only use or disclose personal information for the purposes for which it was collected</li>
                <li>Accuracy: We keep personal information as accurate, complete, and up-to-date as necessary</li>
                <li>Safeguards: We protect personal information with appropriate security measures</li>
                <li>Openness: We make information about our policies and practices available</li>
                <li>Individual Access: Upon request, we inform you of the existence, use, and disclosure of your personal information</li>
                <li>Challenging Compliance: You may challenge our compliance with these principles</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Contact us at info@tacaccessories.co.ke for any privacy concerns or to exercise your rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">7. DATA SECURITY</h2>
              <p className="text-muted-foreground leading-relaxed">
                The security of your personal information is important to us. We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="text-muted-foreground leading-relaxed">These measures include:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Secure servers and databases</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">8. DATA RETENTION</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When we no longer need your personal information, we will securely delete or anonymize it. The criteria we use to determine retention periods include:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>The length of time we have an ongoing relationship with you</li>
                <li>Whether there is a legal obligation to which we are subject</li>
                <li>Whether retention is advisable in light of our legal position</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">9. CHILDREN'S PRIVACY</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under the age of 13 (or 16 in the European Economic Area). We do not knowingly collect personal information from children under these ages.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we will take steps to remove that information from our servers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">10. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information, including personal data, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you are located outside Other and choose to provide information to us, please note that we transfer the data, including personal data, to Other and process it there.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">11. LINKS TO OTHER WEBSITES</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">12. CHANGES TO THIS PRIVACY POLICY</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We will notify you via email and/or a prominent notice on our service prior to the change becoming effective if the changes are significant.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold luxury-heading">13. CONTACT US</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
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
              <p className="text-muted-foreground leading-relaxed">
                We are committed to resolving complaints about your privacy and our collection or use of your personal information. If you have concerns, please contact us first so we can attempt to resolve your issue.
              </p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
