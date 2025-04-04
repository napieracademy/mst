let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['image.tmdb.org'],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  outputFileTracingIncludes: {
    '/**': ['./public/**/*', './app/globals.css', './styles/**/*', './.next/static/css/**/*']
  },
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Escludi i percorsi di routing che entrano in conflitto con file statici nella directory public
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async rewrites() {
    return {
      beforeFiles: [
        // Gestione file statici in public/ con precedenza assoluta
        {
          source: '/sitemap.xml',
          destination: '/sitemap.xml', // Mantenuta per servire il file statico in /public
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600', // Cache per un'ora
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Risolve i problemi con vendor-chunks in modalità sviluppo
    if (dev) {
      // Per il problema con i moduli vendor
      config.optimization.moduleIds = 'named';
      
      // Disabilita completamente splitChunks in modalità sviluppo
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      
      // Disabilita anche la minimizzazione in dev per evitare problemi
      config.optimization.minimize = false;
      
      // Usa singleRuntime invece di runtimeChunk: 'single'
      config.optimization.runtimeChunk = false;
    }
    
    // Assicura che i file CSS globali siano inclusi nel bundle standalone
    if (!dev && isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Assicura che le regole CSS e le relative dipendenze siano tracciate correttamente
        if (entries['app/layout'] && !entries['app/layout'].includes('./app/globals.css')) {
          entries['app/globals'] = './app/globals.css';
        }
        
        return entries;
      };
    }
    
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
