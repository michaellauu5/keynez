import { Layout } from '@/components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="container max-w-3xl px-4 md:px-6 py-16 space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Built for Hong Kong's renters and buyers
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Keynez AI started with a simple frustration: searching for a home in
          Hong Kong meant juggling half a dozen tabs, chasing agents who pushed
          the same expired listings, and translating jargon between Cantonese,
          Mandarin and English. We thought there had to be a better way — so we
          built one.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We index listings from across the major Hong Kong property platforms,
          de-duplicate them, and let you search in your own words. No inflated
          fees, no push sales — just the listing, the licensed agent, and the
          information you need to make a confident decision.
        </p>

        {/* TODO: Replace with real founder/team photos and bios */}
        <section className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          <p className="font-medium">TODO: Team photos & bios</p>
          <p className="text-sm mt-2">
            Add founder portraits, names, roles and short bios here.
          </p>
        </section>
      </div>
    </Layout>
  );
}