let userConfig = undefined
try {
  // Prova a importare il file di configurazione utente
  userConfig = await import('./v0-user-next.config.mjs').catch(() => 
    // Fallback: prova con estensione .js
    import('./v0-user-next.config.js').catch(() => {
      console.log('Nessun file di configurazione utente trovato, uso configurazione default.');
      return { default: {} };
    })
  );
  
  // Estrai il default export dal modulo
  userConfig = userConfig.default || {};
} catch (e) {
  console.log('Errore nel caricamento della configurazione utente:', e.message);
  userConfig = {};
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
    // Configurazione specifica per Netlify
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    ppr: false,  // Disabilita Progressive Rendering per evitare errori
    staticWorkerRequestDeduping: true, // Deduplicazione per migliorare performance
  },
  outputFileTracingIncludes: {
    '/**': ['./public/**/*', './app/globals.css', './styles/**/*', './.next/static/css/**/*']
  },
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
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

// Applica la configurazione utente alla configurazione base
mergeConfig(nextConfig, userConfig);

// Funzione per combinare le configurazioni
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig || typeof userConfig !== 'object') {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      typeof userConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig
