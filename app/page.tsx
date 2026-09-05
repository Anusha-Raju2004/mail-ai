export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-center">Nebula Mail AI</h1>
        <p className="text-gray-600">Connect your Google Workspace account to get started.</p>
        
        <a
          href="/api/auth/google"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Sign in with Google
        </a>
      </div>
    </main>
  );
}