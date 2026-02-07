import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto space-y-12 animate-fade-in">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-display font-serif text-teal">
            Sapiens
          </h1>
          <p className="text-body text-charcoal/70 max-w-lg mx-auto">
            Build a portfolio project that impresses recruiters in 2–3 weeks
          </p>
        </div>

        {/* Single CTA */}
        <div>
          <Link
            href="/login"
            className="inline-block px-12 py-4 bg-teal text-ivory text-h3 font-serif hover:bg-teal-dark transition-colors duration-300 rounded-sm"
          >
            Start
          </Link>
        </div>

        {/* Subtle footer */}
        <p className="text-small text-charcoal/40 mt-24">
          Guided by AI · No credit card required
        </p>
      </div>
    </main>
  )
}
