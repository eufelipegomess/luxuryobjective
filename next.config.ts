import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // 90 para as fotografias (ver lib/images.ts); 75 é o valor por omissão.
    qualities: [75, 90],
    // Sem o host listado aqui, o `next/image` recusa-se a servir a imagem — não
    // é um erro de rede, é uma recusa deliberada do Next a hosts não declarados.
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/**' },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: '/storage/v1/object/**',
            },
          ]
        : []),
    ],
  },
  // O painel nunca é indexável, mesmo quando o resto do site abrir aos motores
  // de busca. Vive aqui, e não no netlify.toml: as regras de header da Netlify
  // não chegam às respostas servidas pelo runtime do Next, que é o caso de
  // todas as páginas de /admin.
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
