# 🚀 Guia de Deploy na Vercel - FocusTimer SaaS

## ⚡ Passo a Passo para Deploy

### 1. Preparar o Repositório

Certifique-se de que todas as alterações estão commitadas:

```bash
git add .
git commit -m "feat: adicionar PWA, SEO e otimizações de performance"
git push origin main
```

### 2. Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Configure estas variáveis ANTES de fazer o deploy!

#### Acesse seu projeto na Vercel:
1. Vá para [vercel.com](https://vercel.com)
2. Selecione seu projeto `pomodoro-saas`
3. Clique em **Settings**
4. No menu lateral, clique em **Environment Variables**

#### Adicione as seguintes variáveis:

| Nome da Variável | Valor | Ambiente |
|-----------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://arswwunzoilzhbmahedk.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyc3d3dW56b2lsemhibWFoZWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzM5MzEsImV4cCI6MjA4MTE0OTkzMX0.CfpNmn6IdxbIacxNcH2pkRzbow8v7mTBMY100IlC6_4` | Production, Preview, Development |

#### Como adicionar:
1. Clique em **Add New**
2. Cole o nome da variável
3. Cole o valor
4. Selecione os ambientes (Production, Preview, Development)
5. Clique em **Save**

### 3. Fazer o Deploy

#### Opção A: Deploy Automático (Recomendado)
```bash
# Faça push para o branch principal
git push origin main

# A Vercel detectará automaticamente e fará o deploy
```

#### Opção B: Deploy Manual via CLI
```bash
# Instale a Vercel CLI (se ainda não tiver)
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

### 4. Verificar o Deploy

Após o deploy, verifique:

- ✅ Site carrega corretamente
- ✅ Imagens aparecem
- ✅ PWA está instalável
- ✅ Meta tags funcionam (teste compartilhando)
- ✅ Sitemap acessível: `https://focustimer-saas.vercel.app/sitemap.xml`
- ✅ Robots.txt acessível: `https://focustimer-saas.vercel.app/robots.txt`

---

## 🧪 Testar PWA após Deploy

### Android (Chrome):
1. Acesse `https://focustimer-saas.vercel.app`
2. Aguarde o banner de instalação aparecer
3. Clique em "Install App"
4. Ou use Menu > "Adicionar à tela inicial"

### iOS (Safari):
1. Acesse `https://focustimer-saas.vercel.app`
2. Toque no botão de compartilhar (quadrado com seta)
3. Role e selecione "Adicionar à Tela de Início"
4. Confirme

### Desktop (Chrome/Edge):
1. Acesse `https://focustimer-saas.vercel.app`
2. Clique no ícone de instalação na barra de endereços
3. Ou Menu > "Instalar FocusTimer"

---

## 🔍 Validar SEO e Performance

### Google PageSpeed Insights
1. Acesse: https://pagespeed.web.dev/
2. Cole: `https://focustimer-saas.vercel.app`
3. Clique em "Analyze"
4. Verifique scores:
   - Performance: 90+
   - SEO: 95+
   - Best Practices: 90+
   - Accessibility: 90+

### Open Graph (Compartilhamento)
1. Acesse: https://www.opengraph.xyz/
2. Cole: `https://focustimer-saas.vercel.app`
3. Verifique se mostra:
   - Imagem: saas.png
   - Título correto
   - Descrição profissional

### Twitter Card Validator
1. Acesse: https://cards-dev.twitter.com/validator
2. Cole: `https://focustimer-saas.vercel.app`
3. Clique em "Preview card"

---

## 🐛 Troubleshooting

### Erro: "Faltam as credenciais do Supabase"

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas
2. Certifique-se de selecionar TODOS os ambientes (Production, Preview, Development)
3. Faça um novo deploy:
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push origin main
   ```

### PWA não instala

**Soluções:**
1. Verifique HTTPS (Vercel fornece automaticamente)
2. Limpe cache do navegador
3. Verifique DevTools > Application > Manifest
4. Certifique-se de que todos os ícones carregam

### Imagem não aparece ao compartilhar

**Soluções:**
1. Aguarde alguns minutos para cache do Open Graph
2. Use debugger: https://www.opengraph.xyz/
3. Verifique se `/public/saas.png` existe no deploy
4. Tamanho da imagem não pode exceder 5MB

### Service Worker não atualiza

**Soluções:**
1. Desinstale o PWA
2. Limpe cache: DevTools > Application > Storage > Clear site data
3. Reinstale o app

---

## 📊 Monitoramento

### Vercel Analytics (Grátis)

A Vercel fornece analytics automático:
1. Acesse seu projeto na Vercel
2. Clique em "Analytics"
3. Veja métricas de performance em tempo real

### Google Search Console

Para monitorar SEO:
1. Acesse: https://search.google.com/search-console
2. Adicione a propriedade: `https://focustimer-saas.vercel.app`
3. Verifique propriedade
4. Envie sitemap: `https://focustimer-saas.vercel.app/sitemap.xml`

---

## 🔐 Segurança

### Headers de Segurança (Já Configurados)

O projeto já inclui headers de segurança:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- X-DNS-Prefetch-Control: on

### Variáveis de Ambiente Seguras

- ✅ NUNCA commite `.env.local` no Git
- ✅ Use apenas `NEXT_PUBLIC_*` para variáveis do cliente
- ✅ Mantenha service role keys apenas no servidor

---

## ✅ Checklist Pós-Deploy

- [ ] Site carrega em `https://focustimer-saas.vercel.app`
- [ ] Login/Register funcionam
- [ ] Dashboard acessível
- [ ] PWA instalável no mobile
- [ ] Ícone aparece na tela inicial
- [ ] App funciona offline
- [ ] Compartilhamento mostra imagem e descrição
- [ ] Sitemap acessível
- [ ] Robots.txt acessível
- [ ] Lighthouse score 90+
- [ ] Sem erros no console

---

## 🎯 Próximos Passos

1. **Submeta ao Google Search Console**
   - Envia sitemap
   - Solicita indexação

2. **Configure Google Analytics** (Opcional)
   ```bash
   bun add @vercel/analytics
   ```

3. **Teste em Dispositivos Reais**
   - Android
   - iPhone
   - Tablet

4. **Compartilhe nas Redes Sociais**
   - LinkedIn
   - Twitter
   - WhatsApp
   - Instagram

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel
2. Use DevTools > Console para erros
3. Consulte a documentação: `/docs/PWA_SEO_GUIDE.md`

---

## 🎉 Parabéns!

Seu FocusTimer SaaS está pronto para produção com:
- ✅ PWA instalável
- ✅ SEO otimizado
- ✅ Performance máxima
- ✅ Compartilhamento profissional
- ✅ Modo offline

**Bom deploy! 🚀**
