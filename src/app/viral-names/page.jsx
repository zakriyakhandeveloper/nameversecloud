export async function generateMetadata() {
  return {
    title: 'Viral Baby Names - NameVerse',
    description: 'Discover baby names trending on social media platforms.',
  };
}

export default function ViralNames() {
  return (
    <div className="max-w-4xl mx-auto py-24 text-center">
      <h1 className="text-3xl font-bold mb-4">Viral Baby Names</h1>
      <p className="text-gray-600 mb-6">This page has moved to <a className="text-purple-600 underline" href="/trending-names">Trending Names</a>.</p>
      <p>If you were redirected here, please follow the link above.</p>
    </div>
  );
}
