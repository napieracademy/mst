export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About My Blog</h1>
        <div className="prose lg:prose-xl">
          <p>
            Welcome to my blog! This is a simple blog built with Next.js and Tailwind CSS. It demonstrates the use of
            the App Router, Server Components, and other modern Next.js features.
          </p>
          <p>
            In a real-world application, you would likely connect this to a CMS like Contentful, Sanity, or a headless
            WordPress instance to manage your content. You might also add features like comments, search, categories,
            and more.
          </p>
          <h2>Technologies Used</h2>
          <ul>
            <li>Next.js - React framework for production</li>
            <li>Tailwind CSS - Utility-first CSS framework</li>
            <li>date-fns - Modern JavaScript date utility library</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

