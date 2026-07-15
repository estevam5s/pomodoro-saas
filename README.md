<div align="center">

<img src="public/brand-logo.png" alt="FocusTimer" width="130" />

# FocusTimer — Produtividade com a Técnica Pomodoro

**Trabalhe em sprints focados: timer Pomodoro, gestão de tarefas, metas diárias, estatísticas e relatórios — um app de foco responsivo (PWA), com planos.**

O **FocusTimer** ajuda você a se manter produtivo com a **Técnica Pomodoro**: cicla foco e pausas, organiza **tarefas** e **metas diárias**, e mostra **estatísticas** e **relatórios** da sua concentração. Web responsivo (PWA), com onboarding, autenticação e assinatura.

🔗 **Produção:** [pomodoro-saas-rho.vercel.app](https://pomodoro-saas-rho.vercel.app)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix_UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Deploy_Vercel](https://img.shields.io/badge/Deploy_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 🎯 O que é o FocusTimer

Um **cronômetro Pomodoro** com produtividade em volta: sprints de foco, tarefas, metas e analytics — para quem quer trabalhar concentrado e medir a evolução.

## 👥 Para quem serve

- **Estudantes e profissionais** que querem foco e constância.
- Quem usa a **Técnica Pomodoro** no dia a dia.
- Quem gosta de **metas e estatísticas** de produtividade.

## ✨ Funcionalidades

- **Timer Pomodoro** — sprints de foco e pausas
- **Tarefas e metas** — organização e metas diárias
- **Estatísticas e relatórios** — evolução da produtividade (`/dashboard`)
- **PWA / offline** — uso responsivo e offline (`/offline`)
- **Onboarding** — (`/onboarding`)
- **Billing e admin** — (`/dashboard/billing`, `/admin`)

## 💳 Billing (Stripe)

`/api/checkout` → `/api/webhook` (assinado) → `/api/portal`. Recursos avançados por plano.

## 🧰 Stack tecnológica

- **Next.js** (App Router) · **React** · **TypeScript**
- **Tailwind CSS** + **Radix UI**
- **Supabase** (Postgres, Auth, RLS)
- **Stripe** (assinaturas) · **PWA** · **Vercel**

## 🧭 Rotas principais

- **Público**: `/`, `/login`, `/signup`, `/2fa`, `/offline`
- **App**: `/dashboard`, `/dashboard/billing`, `/onboarding`
- **Admin**: `/admin`
- **API**: `/api/checkout`, `/api/subscription`, `/api/portal`, `/api/webhook`, `/api/admin`

## 🔐 Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ▶️ Como rodar localmente

```bash
npm install\ncp .env.example .env.local   # preencha as variáveis\nnpm run dev
```

## 📜 Scripts

| Script | Ação |\n|---|---|\n| `npm run dev` | desenvolvimento |\n| `npm run build` | build de produção |\n| `npm run start` | sobe o build |\n| `npm run lint` | lint |

## 🛡️ Segurança

- Autenticação e isolamento de dados por conta (RLS no Supabase).\n- Webhooks de pagamento assinados; chave `service_role` restrita ao servidor.\n- 2FA quando disponível e boas práticas de headers/CSP.

## 🗺️ Roadmap

- Sons ambientes e temas de foco
- Integração com calendário
- Ranking/streaks de foco
- App mobile

## 📄 Licença

Projeto proprietário. Todos os direitos reservados ao autor.

---

<div align="center">
Feito com ❤ · <a href="https://pomodoro-saas-rho.vercel.app">pomodoro-saas-rho.vercel.app</a>
</div>
