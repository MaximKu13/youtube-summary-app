import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">YouTube Video Summarizer</h1>

        <div className="space-x-4">
        <Link href="/auth/signin" className="bg-blue-500 text-white px-4 py-2 rounded">
        Sign In
        </Link>
        <Link href="/auth/signup" className="bg-green-500 text-white px-4 py-2 rounded">
        Sign Up
        </Link>
        </div>
      </div>
    </main>
  );
}