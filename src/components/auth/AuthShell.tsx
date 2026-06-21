import Link from "next/link";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            NIST Compass
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </main>
  );
}
