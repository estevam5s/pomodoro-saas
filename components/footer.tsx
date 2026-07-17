import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/brand-logo.png" alt="FocusTimer" className="rounded-full object-contain" style={{ width: "var(--logo-site-px, 32px)", height: "var(--logo-site-px, 32px)" }} />
              <span className="font-medium text-white">FocusTimer</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              FocusTimer ajuda você a se manter produtivo com a comprovada técnica Pomodoro. Trabalhe em sprints focados, faça
              pausas regulares e acompanhe seu progresso para conquistar mais todos os dias.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-white">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Baixar
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Novidades
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-400 hover:text-white">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-400 hover:text-white">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col items-center gap-3 text-center text-gray-400 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>SSL Secured</span>
            <span className="inline-flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Pagamento seguro via Stripe</span>
            <span className="inline-flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24"/></svg>LGPD Compliant</span>
          </div>
          <p>© {new Date().getFullYear()} FocusTimer. Todos os direitos reservados. · Suporte: contato@estevamsouza.com.br</p>
        </div>
      </div>
    </footer>
  )
}
