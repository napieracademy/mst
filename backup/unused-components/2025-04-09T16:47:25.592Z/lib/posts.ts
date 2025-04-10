import type { Post } from "./types"

// This is a mock database of posts
// In a real application, you would fetch this from a database or CMS
const posts: Post[] = [
  {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js",
    date: "2023-01-15",
    author: "John Doe",
    excerpt: "Learn how to build modern web applications with Next.js, the React framework for production.",
    content: `
      <p>Next.js is a React framework that enables several extra features, including server-side rendering and generating static websites.</p>
      <p>Next.js provides a solution to all of these problems. But more importantly, it puts you and your team in the pit of success when building React applications.</p>
      <h2>Why Next.js?</h2>
      <p>Here are some of the key features of Next.js:</p>
      <ul>
        <li>An intuitive page-based routing system (with support for dynamic routes)</li>
        <li>Pre-rendering, both static generation (SSG) and server-side rendering (SSR) are supported on a per-page basis</li>
        <li>Automatic code splitting for faster page loads</li>
        <li>Client-side routing with optimized prefetching</li>
        <li>Built-in CSS and Sass support, and support for any CSS-in-JS library</li>
        <li>Development environment with Fast Refresh support</li>
        <li>API routes to build API endpoints with Serverless Functions</li>
      </ul>
    `,
    coverImage: "/placeholder.svg?height=400&width=800",
  },
  {
    slug: "mastering-react-hooks",
    title: "Mastering React Hooks",
    date: "2023-02-20",
    author: "Jane Smith",
    excerpt: "Dive deep into React Hooks and learn how to use them effectively in your applications.",
    content: `
      <p>React Hooks were introduced in React 16.8 and have changed the way we write React components.</p>
      <p>Hooks allow you to use state and other React features without writing a class. This makes your code more readable and easier to maintain.</p>
      <h2>Basic Hooks</h2>
      <p>Here are the basic hooks that you'll use most often:</p>
      <ul>
        <li>useState - Allows you to add state to functional components</li>
        <li>useEffect - Allows you to perform side effects in functional components</li>
        <li>useContext - Allows you to subscribe to React context without introducing nesting</li>
      </ul>
      <h2>Additional Hooks</h2>
      <p>There are several additional hooks that you might find useful:</p>
      <ul>
        <li>useReducer - An alternative to useState for complex state logic</li>
        <li>useCallback - Returns a memoized callback function</li>
        <li>useMemo - Returns a memoized value</li>
        <li>useRef - Returns a mutable ref object</li>
      </ul>
    `,
    coverImage: "/placeholder.svg?height=400&width=800",
  },
  {
    slug: "tailwind-css-tips-and-tricks",
    title: "Tailwind CSS Tips and Tricks",
    date: "2023-03-10",
    author: "Alex Johnson",
    excerpt: "Learn how to make the most of Tailwind CSS with these practical tips and tricks.",
    content: `
      <p>Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without leaving your HTML.</p>
      <p>Here are some tips and tricks to help you make the most of Tailwind CSS:</p>
      <h2>Use the @apply directive</h2>
      <p>If you find yourself repeating the same utility classes over and over, consider extracting them into a CSS class using the @apply directive.</p>
      <pre><code>
      .btn {
        @apply py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75;
      }
      </code></pre>
      <h2>Use the theme() function</h2>
      <p>You can use the theme() function to access your Tailwind theme values from your CSS.</p>
      <pre><code>
      .content-area {
        background-color: theme('colors.gray.100');
        padding: theme('spacing.6');
      }
      </code></pre>
      <h2>Customize your config</h2>
      <p>Tailwind is highly customizable. You can extend or override the default configuration in your tailwind.config.js file.</p>
    `,
    coverImage: "/placeholder.svg?height=400&width=800",
  },
]

export async function getPosts(): Promise<Post[]> {
  // Simulate a delay as if we're fetching from an API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return posts sorted by date (newest first)
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getBlogPost(slug: string): Promise<Post | undefined> {
  // Simulate a delay as if we're fetching from an API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return posts.find((post) => post.slug === slug)
}

