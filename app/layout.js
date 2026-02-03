import './globals.css'

export const metadata = {
  title: 'Gestor de Finanças Pessoais Mensal Pro',
  description: 'Controle profissional de finanças pessoais com backup e compartilhamento',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
