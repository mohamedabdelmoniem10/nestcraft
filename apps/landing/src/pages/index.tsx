import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>NestCraft - Build Amazing Sites</title>
        <meta
          name="description"
          content="NestCraft - The future of website building"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-8">
              Welcome to <span className="text-blue-600">NestCraft</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              The most powerful and intuitive website builder. Create stunning
              websites with our modern themes, powerful plugins, and
              lightning-fast performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Started Free
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                View Demo
              </button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                10x faster than WordPress with our static site generation
                technology.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-4">Beautiful Themes</h3>
              <p className="text-gray-600">
                Choose from hundreds of professional themes in our marketplace.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-4">Powerful Plugins</h3>
              <p className="text-gray-600">
                Extend functionality with our extensive plugin ecosystem.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
