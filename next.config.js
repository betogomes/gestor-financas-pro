/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido output: 'export' para permitir rotas dinâmicas
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig