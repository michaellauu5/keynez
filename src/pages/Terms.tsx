import { Layout } from '@/components/layout/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <Layout>
      <div className="container max-w-3xl px-4 md:px-6 py-12 space-y-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a draft policy — consult a HK-qualified lawyer before go-live.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-HK')}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Keynez AI (the "Service"), you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Nature of the Service</h2>
            <p>
              Keynez AI is a property search and information platform. We are <strong>not</strong> a
              licensed estate agent in Hong Kong. We aggregate publicly available listings and
              connect users to the licensed estate agent or owner responsible for each listing.
              Any property transaction is solely between you and that third party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. No Warranty on Listings</h2>
            <p>
              Listings are provided on an "as-is" basis. We do not warrant the accuracy,
              completeness, availability or price of any listing. Always verify details with the
              responsible licensed agent and confirm the agent's licence with the Estate Agents
              Authority (EAA) before entering any agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Acceptable Use</h2>
            <p>
              You agree not to scrape, reverse-engineer, misuse, or interfere with the Service, or
              use it for any unlawful purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Keynez AI shall not be liable for any
              indirect, incidental, special or consequential damages arising from your use of the
              Service or any property transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Hong Kong Special Administrative Region.
              Any dispute arising out of or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the Hong Kong courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Contact</h2>
            <p>
              Questions about these Terms? Email{' '}
              <a href="mailto:hello@keynez.com" className="text-primary underline">
                hello@keynez.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}