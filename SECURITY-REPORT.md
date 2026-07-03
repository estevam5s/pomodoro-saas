# Relatório de Segurança — FocusTimer (pomodoro)

**Data:** 2026-07-03 · **Escopo:** app Next.js 15 (PWA) + Supabase (uso autorizado, defensivo, não-destrutivo)
**Alvo:** https://pomodoro-saas-rho.vercel.app · Supabase `drqbvvwjjkqjmamedctg`

## Sumário executivo

Postura **forte**. RLS efetivo (0 tabelas com leitura anônima), webhook Stripe valida assinatura (400),
sem segredos no histórico git, **0 dependências vulneráveis**. Já tinha headers parciais (XFO/nosniff/
Referrer); completei com CSP, HSTS e Permissions-Policy. Retest confirmado.

| Antes | Depois |
|---|---|
| 3 findings de headers (faltavam CSP/HSTS/Permissions) | 2 findings LOW residuais |

## Findings & correções

### ✅ Corrigido — Headers de segurança incompletos (MÉDIO · A05)
- Tinha X-Frame-Options, X-Content-Type-Options e Referrer-Policy; **faltavam CSP, HSTS e Permissions-Policy**.
- **Correção:** `next.config.mjs` → adicionadas CSP (allowlist Supabase/Stripe/Google Fonts), HSTS (2 anos)
  e Permissions-Policy + `poweredByHeader:false`, preservando o setup PWA (next-pwa). Retest: 3 → 2.

### ✅ OK — RLS / PostgREST (A01) · Webhook Stripe (A08) · Dependências (A06) · Segredos
- Nenhuma tabela legível anonimamente; webhook sem assinatura → 400; **`scan-deps` = 0 findings**; nenhum
  segredo em arquivos rastreados nem no histórico git (3 ocorrências LOW = chaves públicas/falsos positivos).

## Residual (aceito · LOW)
- CSP `unsafe-inline`/`unsafe-eval` (runtime Next + PWA); CORS `*` em assets estáticos (sem credenciais).

## Mapa OWASP 2021
A01 ✅ · A02 ✅ (HSTS) · A03 (CSP) · A05 ✅ · A06 ✅ · A08 ✅
