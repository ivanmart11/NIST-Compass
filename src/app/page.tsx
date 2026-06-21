import Link from "next/link";
import { LinkButton } from "@/components/ui";

const FEATURES = [
  ["NIST CSF 2.0 library", "Browse all six functions, 22 categories, and the full subcategory set."],
  ["Gap register", "Track current vs. desired state, risk, status, and ownership."],
  ["Evidence repository", "Attach policies, screenshots, and documents to each gap."],
  ["Compliance calendar", "Schedule recurring access, vendor, and policy reviews."],
  ["Ownership tracking", "Owners, due dates, and priorities — nothing slips."],
  ["Simple reporting", "Open-gap, overdue, and executive-summary reports."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <CompassMark />
          <span className="text-lg font-semibold text-gray-900">
            NIST Compass
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
          <LinkButton href="/signup">Get started</LinkButton>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
        <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          Lightweight GRC for small &amp; mid-sized teams
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Run your compliance program without the spreadsheets
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          NIST Compass helps small IT and security teams track NIST CSF 2.0
          gaps, assign owners, store evidence, and stay ahead of compliance
          deadlines — affordable and easy to learn.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/signup" className="px-5 py-2.5">
            Start free
          </LinkButton>
          <LinkButton href="/login" variant="secondary" className="px-5 py-2.5">
            Sign in
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="card p-6">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function CompassMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor" />
      </svg>
    </div>
  );
}
