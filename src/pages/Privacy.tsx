import { Layout } from '@/components/layout/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-HK')}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Who We Are</h2>
            <p>
              Keynez AI ("we", "us") operates a property search platform serving Hong Kong. This
              policy explains how we handle personal data in accordance with the Personal Data
              (Privacy) Ordinance (Cap. 486) of Hong Kong.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (e.g. email address) when you sign up.</li>
              <li>Search queries, saved listings and preferences.</li>
              <li>Messages you send us via the contact form or newsletter.</li>
              <li>Standard usage data (IP address, device, browser, pages visited).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and improve the Service.</li>
              <li>To respond to your enquiries.</li>
              <li>To send you product updates if you have opted in.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Sharing</h2>
            <p>
              We do not sell your personal data. We share data only with service providers
              required to operate the Service (e.g. hosting, analytics) under appropriate
              confidentiality obligations, or where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary for the purposes set out
              above, or as required by Hong Kong law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Your Rights</h2>
            <p>
              Under the PDPO, you have the right to access and correct your personal data, and to
              opt out of direct marketing. Email{' '}
              <a href="mailto:hello@keynez.com" className="text-primary underline">
                hello@keynez.com
              </a>{' '}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Cookies</h2>
            <p>
              We use cookies and similar technologies for authentication, preferences and
              analytics. You can disable cookies in your browser, but parts of the Service may not
              function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Governing Law</h2>
            <p>
              This policy is governed by the laws of the Hong Kong Special Administrative Region.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}