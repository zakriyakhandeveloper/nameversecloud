import Link from 'next/link';

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function normalizeReligion(religion) {
  if (!religion || typeof religion !== 'string') return 'islamic';
  const normalized = religion.toLowerCase();
  return VALID_RELIGIONS.includes(normalized) ? normalized : 'islamic';
}

export const dynamic = 'force-dynamic';
export function generateStaticParams() {
  return [];
}

export default function LetterLetterPage({ params }) {
  const religion = normalizeReligion(params?.religion);
  const letter = String(params?.letter || 'A').toUpperCase();

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Redirecting to the paginated letter page</h1>
        <p className="mt-3 text-slate-600">This route is kept for compatibility with the existing URL structure.</p>
        <Link
          href={`/names/${religion}/letter/${letter}/1`}
          className="mt-6 inline-flex rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Open {letter} names
        </Link>
      </div>
    </div>
  );
}
