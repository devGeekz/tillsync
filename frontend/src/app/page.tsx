import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-100/80 bg-white/70 px-6 py-5 backdrop-blur-md lg:px-12">
        <a className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 transition hover:opacity-90" href="#">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-md shadow-brand-500/25">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-slate-900">
            Till<span className="text-brand-600">Sync</span>
          </span>
        </a>

        <nav aria-label="Main Navigation" className="hidden items-center gap-8 text-[14px] font-medium text-slate-600 md:flex">
          <a className="transition hover:text-brand-600" href="#features">Features</a>
          <a className="transition hover:text-brand-600" href="#how-it-works">How It Works</a>
          <a className="transition hover:text-brand-600" href="#merchants">For Merchants</a>
          <a className="transition hover:text-brand-600" href="#security">Security</a>
          <a className="transition hover:text-brand-600" href="#pricing">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link className="px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900" href="/login">
            Login
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-brand-600 hover:shadow-glow-emerald"
            href="/register"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bloom-hero-canvas relative overflow-hidden px-6 pb-16 pt-12 lg:px-14">
        <div className="pointer-events-none absolute left-1/2 top-1/4 -z-0 h-[450px] w-[700px] -translate-x-1/2 hero-glow-sphere" />

        <div className="stagger relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="mb-6 text-xs font-semibold text-brand-700">
            Instant SMS Verification for Retail &amp; Counters
          </p>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px]">
            Every payment, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              confirmed instantly
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            TillSync sends your attendants an automated SMS alert the very second a customer pays. No expensive POS terminals, zero latency, and zero fake receipt fraud.
          </p>

          <div className="mb-14 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="group flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600 hover:shadow-glow-emerald"
              href="/register"
            >
              <span>Get Started Free</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
              </svg>
            </Link>
            <a
              className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              href="#how-it-works"
            >
              See Live Demo
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="stage-pop relative z-10 mx-auto mt-2 max-w-5xl">
          <div className="relative rounded-3xl border border-white bg-gradient-to-b from-white via-white/90 to-emerald-50/50 p-3 shadow-2xl shadow-slate-300/40 sm:p-5">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl" />
              <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Till Stream • Till #8841</span>
                    </div>
                    <span className="font-mono text-xs font-medium text-brand-400">Synced • 0.4s avg latency</span>
                  </div>

                  <div className="relative rounded-xl border border-emerald-500/40 bg-slate-800/90 p-4 shadow-lg sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-lg font-bold text-emerald-400">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">SMS Sent to Cashier (John K.)</div>
                          <div className="text-lg font-bold tracking-wide text-white">
                            KES 4,850.00 <span className="text-xs font-normal text-slate-400">received</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400">Just Now</span>
                    </div>
                    <p className="mt-3 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-300">
                      &quot;Confirmed: KES 4,850.00 from SARAH MWANGI on Till 8841. Ref: QHG892LK1. Balance updated.&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-3.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      <span>Instant Reconciliation: 142 transactions processed today</span>
                    </div>
                    <span className="font-semibold text-slate-300">100% matched</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 lg:col-span-5 lg:grid-cols-1">
                  <div className="rounded-xl border border-slate-700/80 bg-slate-800/70 p-4 backdrop-blur-sm">
                    <div className="text-xs font-medium uppercase text-slate-400">Delivery Guarantee</div>
                    <div className="mt-1 text-2xl font-bold text-white">99.98%</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                      <span>⚡ Instant carrier route bypass</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-700/80 bg-slate-800/70 p-4 backdrop-blur-sm">
                    <div className="text-xs font-medium uppercase text-slate-400">Hardware Cost Saved</div>
                    <div className="mt-1 text-2xl font-bold text-brand-400">$0.00</div>
                    <div className="mt-1 text-[11px] text-slate-400">Zero POS terminal rental or buying fee</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="reveal border-b border-slate-200/80 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 md:text-left">
            Trusted by 2,500+ retailers, supermarkets, and service counters across the continent
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-600 opacity-65 grayscale transition-all duration-300 hover:grayscale-0">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> M-PESA</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> VISA</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> MASTERCARD</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> AIRTEL MONEY</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> STRIPE &amp; BANKS</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="reveal bg-white px-6 py-20 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-4xl">
                What is TillSync?
              </h2>
              <div className="mt-4">
                <a className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600" href="#how-it-works">
                  Explore Technology
                </a>
              </div>
            </div>
            <div className="text-lg font-normal leading-relaxed text-slate-600 md:col-span-6">
              TillSync is a high-speed payment listener and verification layer that instantly notifies attendants whenever a customer completes a transaction—keeping checkout fast, accurate, and completely fraud-proof.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-100/80 bg-[#edf5f0] p-8 shadow-soft-card transition hover:shadow-lg md:col-span-6 lg:p-10">
              <div className="relative z-10 max-w-md">
                <span className="mb-4 inline-block text-xs font-bold uppercase tracking-wider text-brand-700">Flagship Engine</span>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">Real-Time SMS Alerts</h3>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  Attendants receive immediate payment verification directly on their feature phone or smartphone without needing access to business accounts or staring at customer devices.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-emerald-200/50 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-brand-600 shadow-sm">⚡</div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Direct Carrier Gateway</div>
                    <div className="text-slate-500">&lt; 1.5 seconds notification delivery</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-700 transition-transform group-hover:translate-x-1">
                  Learn more →
                </span>
              </div>
            </div>

            <div className="glass-card-dark flex flex-col justify-between rounded-3xl p-7 text-white transition-transform duration-300 hover:scale-[1.01] md:col-span-3 lg:p-8">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">No POS Needed</h3>
                <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                  Works directly with your existing Till, Paybill, or bank QR. No bulky counter terminals to charge or repair.
                </p>
              </div>
              <div className="mt-6 border-t border-slate-800 pt-4 font-mono text-[11px] text-emerald-400">
                Save up to 90% hardware fees
              </div>
            </div>

            <div className="glass-card-dark flex flex-col justify-between rounded-3xl p-7 text-white transition-transform duration-300 hover:scale-[1.01] md:col-span-3 lg:p-8">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">100% Scam-Proof</h3>
                <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                  Eliminates fake forward SMS, altered receipts, and reversed payments completely from checkout lines.
                </p>
              </div>
              <div className="mt-6 border-t border-slate-800 pt-4 font-mono text-[11px] text-emerald-400">
                Bank-grade JWT &amp; role security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="reveal border-t border-slate-200/70 bg-[#f8fafc] px-6 py-16 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Simplicity in Motion</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">How TillSync Works in 3 Steps</h2>
            <p className="mt-2 text-sm text-slate-500">Zero setup headaches. You can be live and receiving notifications in 5 minutes.</p>
          </div>
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">1</span>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Customer Pays</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Your customer dials your standard Till Number or scans your desk QR code like they normally do.
              </p>
            </div>
            <div className="relative rounded-2xl border border-emerald-500/50 bg-white p-7 shadow-md ring-1 ring-emerald-500/20 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
              <h3 className="mb-2 text-lg font-bold text-slate-900">TillSync Listener Triggers</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Our automated API listens for the bank/telecom hook and validates the genuine receipt code against fraud databases.
              </p>
            </div>
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">3</span>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Attendant Receives SMS</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Within a second, the attendant&apos;s phone beeps with the exact sender name, till number, and amount. Order released safely!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="merchants" className="reveal border-t border-slate-200/70 bg-white px-6 py-20 lg:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Built for Commerce</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                For Retailers, Cafes, &amp; Busy Petrol Stations
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Eliminate long checkout queues where attendants wait for business owners to forward screenshots. TillSync empowers frontline workers to dispense goods with 100% confidence.
            </p>
            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              {[
                "Assign multiple attendant numbers to a single Till",
                "Shift handover reports with automatic totals",
                "Keep your owner bank balance strictly confidential",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <a className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-brand-600" href="#features">
                <span>View industry use cases</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6 shadow-soft-card transition hover:-translate-y-1 hover:shadow-lg sm:p-10 lg:col-span-7">
            <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Nairobi Branch • Pump 04</h4>
                  <p className="text-xs text-slate-400">Shift Attendant: Alex O.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700">Active Shift</span>
              </div>
              <div className="space-y-3">
                {[
                  { amount: "KES 2,500.00", sender: "David K.", ref: "RK8928172", speed: "0.9s" },
                  { amount: "KES 12,000.00", sender: "Trans-East Hauliers", ref: "RK8928189", speed: "1.1s" },
                ].map((n) => (
                  <div key={n.ref} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">SMS</div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{n.amount} • {n.sender}</div>
                        <div className="text-[11px] text-slate-400">Ref: {n.ref} • Delivered in {n.speed}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">Dispensed</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <span>Today&apos;s Shift Total: <strong>KES 114,350</strong></span>
                <a className="font-semibold text-brand-600 hover:underline" href="#">Download CSV →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="reveal relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 px-6 py-16 text-white lg:px-14">
        <div className="pointer-events-none absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to verify every payment in under 2 seconds?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-slate-300">
            Join thousands of merchants eliminating checkout lag and fake SMS scams today. No card or POS installation required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link className="rounded-full bg-brand-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-400 hover:shadow-glow-emerald" href="/register">
              Start 14-Day Free Trial
            </Link>
            <Link className="rounded-full border border-slate-700 bg-slate-800 px-8 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700" href="/register">
              Speak to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-white px-6 py-10 text-xs text-slate-500 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">✓</span>
            <span className="font-semibold text-slate-800">TillSync Systems © 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="transition hover:text-slate-800" href="#">Privacy Policy</a>
            <a className="transition hover:text-slate-800" href="#">Terms of Service</a>
            <a className="transition hover:text-slate-800" href="#security">Security &amp; Compliance</a>
            <a className="transition hover:text-slate-800" href="#">API Documentation</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
