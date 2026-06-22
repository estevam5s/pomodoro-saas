# ⏱️ Planos & Preços — FocusTimer

> **FocusTimer** é a plataforma SaaS de produtividade baseada na técnica **Pomodoro**: timer de foco configurável, gerenciamento de tarefas, metas diárias, estatísticas e relatórios de produtividade, notificações inteligentes e sincronização entre dispositivos (web, mobile e desktop via PWA).
>
> **Moeda:** Real (BRL) · **Cobrança:** mensal ou anual via Stripe · **Cancele quando quiser** · Preços com tributos inclusos (modelo B2C).
>
> _Documento de referência para precificação, posicionamento e conformidade. Última revisão: junho/2026._

---

## 1) O produto (o que já existe hoje)

Stack: Next.js 15 · React 19 · TypeScript · Tailwind · Supabase (Auth + Postgres + RLS) · PWA.

Funcionalidades implementadas e mapeadas no código:

| Área | Recurso |
|------|---------|
| **Timer Pomodoro** | Sessões de Trabalho, Pausa Curta e Pausa Longa; ciclo automático; durações personalizáveis; barra de progresso circular |
| **Tarefas** | Lista de tarefas (CRUD), foco por tarefa, vínculo com projeto, prioridade, estimativa de pomodoros |
| **Estatísticas** | Pomodoros do dia, minutos focados, tarefas concluídas, total semanal |
| **Relatórios** | Gráfico dos últimos 7 dias, histórico de sessões recentes |
| **Metas** | Meta diária de pomodoros com acompanhamento de progresso |
| **Projetos** | Projeto principal e tipo de projeto (trabalho, estudo, pessoal) |
| **Notificações** | Notificações do navegador + alerta sonoro ao fim de cada sessão |
| **Conta** | Autenticação Supabase, onboarding, perfil, sincronização multi-dispositivo |
| **Plataforma** | PWA instalável (mobile + desktop), modo offline básico, SEO |

Esse inventário define o que entra no **plano gratuito** e o que é reservado aos planos pagos. Os recursos de planos superiores marcados como _(roadmap)_ são extensões naturais do produto (já citadas no marketing atual: bloqueador de distrações, integração com calendário, análises avançadas, integrações).

---

## 2) Análise de mercado (2026)

### 2.1 Concorrentes diretos e preços de referência

| App | Modelo | Preço (USD) | Equivalente aprox. (BRL)¹ |
|-----|--------|-------------|---------------------------|
| **Focus To-Do** | Pomodoro + tarefas | US$ 1,99/mês · US$ 9,99/ano · US$ 11,99 vitalício | ~R$ 11/mês |
| **Forest** | Foco/gamificação | US$ 1,99 (compra única) + premium US$ 3,99 | ~R$ 11 único |
| **TickTick Premium** | Tarefas + Pomodoro | US$ 3,99/mês · US$ 35,99/ano | ~R$ 21/mês |
| **Todoist Pro** | Tarefas/produtividade | ~US$ 4–5/usuário/mês | ~R$ 22–27/mês |
| **Todoist Business** | Times | US$ 8/usuário/mês | ~R$ 43/usuário/mês |
| **Toggl Track** | Time tracking (times) | Starter ~US$ 9 · Premium ~US$ 18/usuário/mês | ~R$ 49–97/usuário/mês |

> ¹ Conversão ilustrativa (~US$ 1 ≈ R$ 5,40, jun/2026). Apps internacionais não cobram em BRL e raramente aplicam paridade de poder de compra para o Brasil — isso **abre espaço para um SaaS nacional cobrar em Real, com nota fiscal e suporte em português**, fator competitivo relevante.

### 2.2 Faixas de mercado

- **Apps individuais de Pomodoro/foco:** US$ 2–4/mês (≈ R$ 11–22).
- **Apps de produtividade/tarefas com Pomodoro:** US$ 4–6/mês (≈ R$ 22–32).
- **Planos de equipe (B2B, por usuário):** US$ 8–18/usuário/mês (≈ R$ 43–97).

### 2.3 Posicionamento do FocusTimer

1. **Inicial (grátis):** aquisição via PLG — produto utilizável de verdade, sem cartão, para criar hábito.
2. **Starter:** entrada acessível (abaixo do TickTick), mira o usuário individual que quer histórico e relatórios completos.
3. **Pro:** o "sweet spot" — alinhado a TickTick/Todoist Pro, com análises avançadas, integrações e bloqueador de distrações.
4. **Enterprise:** B2B por assento, para times/empresas que querem gestão, relatórios agregados e administração — faixa Todoist Business/Toggl, porém em BRL e com NF-e.

**Diferenciais competitivos:** cobrança em Real com nota fiscal, suporte em português, LGPD nativa, e foco em **produtividade mensurável** (relatórios), não só timer.

---

## 3) Conformidade legal e regulatória (Brasil) — "nada irregular"

Itens verificados para que a oferta esteja em conformidade e sem práticas abusivas:

- **CDC (Lei 8.078/1990):**
  - Informação clara e ostensiva de preço, periodicidade e o que cada plano inclui (art. 6º, III e art. 31).
  - **Direito de arrependimento de 7 dias** para contratação fora do estabelecimento (art. 49) — reembolso integral se solicitado nesse prazo.
  - Vedação a publicidade enganosa/abusiva (art. 37) — claims como "ilimitado" acompanhados de **Política de Uso Justo**; nada de promessa de resultado garantido.
- **Facilitação de cancelamento (Decreto 11.034/2022):** cancelamento deve ser tão simples quanto a contratação (autoatendimento, mesmo canal) — implementado via portal de cobrança self-service do Stripe.
- **Transparência de recorrência:** aviso prévio de renovação e de reajustes; o plano gratuito **nunca** vira cobrança automática sem consentimento explícito.
- **LGPD (Lei 13.709/2018):** base legal para tratamento, consentimento, política de privacidade, direitos do titular, e — para Enterprise — DPA (acordo de processamento de dados) e registro de operações. Dados isolados por usuário (RLS).
- **Marco Civil da Internet (Lei 12.965/2014):** guarda e proteção de registros conforme exigido.
- **Tributação (SaaS no Brasil):** software como serviço incide **ISS** (municipal, ~2% a 5%) conforme LC 116/2003 (item 1.05) — preços B2C anunciados com tributos inclusos; para B2B, possibilidade de destacar valores + impostos conforme regime (Simples/Lucro Presumido).
- **Pagamentos:** processamento via gateway certificado **PCI-DSS** (Stripe/Pagar.me); não armazenamos dados de cartão.
- **Publicidade comparativa (CONAR):** comparações de preço usam dados públicos e verificáveis, sem denegrir concorrentes — as referências da seção 2 são ilustrativas e datadas.
- **Acessibilidade e idioma:** termos, política e suporte em português (PT-BR).

> ⚖️ Este documento é um guia de produto/precificação e **não substitui parecer jurídico ou contábil**. Recomenda-se validação com advogado e contador antes do go-live, especialmente quanto a ISS do município-sede e ao texto dos Termos de Uso/Política de Privacidade.

---

## 4) Os 4 planos

> 🔒 **Política de diferenciação:** os limites são por **tempo de retenção de histórico, quantidade de itens (projetos/tarefas/presets) e capacidades (integrações, equipe, suporte)** — **não há limite por armazenamento em GB**. "Ilimitado" segue Política de Uso Justo para evitar abuso/automação.

### 🆓 Inicial — **R$ 0** (para sempre)
_Para conhecer a técnica Pomodoro e criar o hábito. Sem cartão de crédito._

- Timer Pomodoro completo (trabalho, pausa curta e pausa longa)
- Durações padrão (25/5/15) com 1 preset
- Até **3 projetos** e **30 tarefas ativas**
- Meta diária de pomodoros
- Estatísticas do dia + gráfico dos **últimos 7 dias**
- Histórico de sessões: **7 dias**
- Notificações do navegador e alerta sonoro
- PWA (instalável em mobile e desktop) + modo offline
- Sincronização em **1 dispositivo**
- Suporte: central de ajuda / comunidade

### ⭐ Starter — **R$ 14,90/mês** · ou **R$ 143,00/ano** (≈ R$ 11,92/mês, ~20% off)
_Para o usuário individual que quer histórico completo e relatórios._

Tudo do Inicial, mais:
- **Projetos e tarefas ilimitados** (uso justo)
- **Durações personalizadas** + até **5 presets** de timer
- Prioridades e estimativa de pomodoros por tarefa
- Estatísticas **semanais e mensais**
- Histórico de sessões: **90 dias**
- **Exportação de dados** (CSV)
- Sincronização em **até 3 dispositivos**
- Temas e sons de foco adicionais
- Sem anúncios
- Suporte por e-mail

### 💎 Pro — **R$ 29,90/mês** · ou **R$ 287,00/ano** (≈ R$ 23,92/mês, ~20% off) — **MAIS POPULAR**
_Para profissionais e estudantes que levam produtividade a sério._

Tudo do Starter, mais:
- **Análises avançadas:** tendências de foco, horários mais produtivos, taxa de conclusão, ofensiva (streak) e insights
- **Presets de timer ilimitados** e perfis por projeto
- **Bloqueador de distrações** (sites/apps durante o foco) _(roadmap)_
- **Integração com calendário** (Google/Outlook) _(roadmap)_
- Histórico de sessões: **ilimitado** (uso justo)
- Relatórios em **PDF/CSV**
- Lembretes e agendamento de sessões
- Sincronização em **dispositivos ilimitados**
- Backup automático da conta
- **Suporte prioritário**

### 🏢 Enterprise — **R$ 39,90/usuário/mês** · ou **R$ 383,00/usuário/ano** (≈ R$ 31,92/mês, ~20% off)
_Para times e empresas. Mínimo de 3 assentos. Faturamento com NF-e._

Tudo do Pro, para todos os membros, mais:
- **Painel de administração** da organização e gestão de membros/convites
- **Equipes e departamentos** com papéis e permissões (admin, gestor, membro)
- **Relatórios agregados** de produtividade por equipe e por período
- **SSO / login corporativo** (Google Workspace / SAML) _(roadmap)_
- **API e webhooks** para integrações internas _(roadmap)_
- **Integrações de equipe** (Slack, Notion) _(roadmap)_
- **Exportação em massa** e relatórios corporativos (PDF/CSV)
- **DPA (LGPD)**, controles de privacidade e logs de auditoria
- **White-label** opcional (logo e domínio personalizado) — add-on
- **Onboarding assistido** e treinamento da equipe
- **Gerente de conta dedicado** e **SLA** de atendimento
- Suporte prioritário 24/7

---

## 5) Comparativo de planos

| Recurso | Inicial | Starter | Pro | Enterprise |
|---|:---:|:---:|:---:|:---:|
| Preço mensal | **R$ 0** | **R$ 14,90** | **R$ 29,90** | **R$ 39,90/usuário** |
| Preço anual | — | R$ 143,00 | R$ 287,00 | R$ 383,00/usuário |
| Timer Pomodoro | ✅ | ✅ | ✅ | ✅ |
| Durações personalizadas | ❌ | ✅ | ✅ | ✅ |
| Presets de timer | 1 | 5 | Ilimitado | Ilimitado |
| Projetos | 3 | Ilimitado | Ilimitado | Ilimitado |
| Tarefas ativas | 30 | Ilimitado | Ilimitado | Ilimitado |
| Meta diária | ✅ | ✅ | ✅ | ✅ |
| Estatísticas | Diária + 7 dias | Semanal/Mensal | Avançada + insights | Avançada + equipe |
| Histórico de sessões | 7 dias | 90 dias | Ilimitado | Ilimitado |
| Exportação de dados | ❌ | CSV | PDF/CSV | PDF/CSV + massa |
| Bloqueador de distrações | ❌ | ❌ | ✅ _(roadmap)_ | ✅ _(roadmap)_ |
| Integração com calendário | ❌ | ❌ | ✅ _(roadmap)_ | ✅ _(roadmap)_ |
| Dispositivos sincronizados | 1 | 3 | Ilimitado | Ilimitado |
| Sem anúncios | ❌ | ✅ | ✅ | ✅ |
| Painel de administração | ❌ | ❌ | ❌ | ✅ |
| Equipes / permissões | ❌ | ❌ | ❌ | ✅ |
| Relatórios de equipe | ❌ | ❌ | ❌ | ✅ |
| SSO / SAML | ❌ | ❌ | ❌ | ✅ _(roadmap)_ |
| API / Webhooks | ❌ | ❌ | ❌ | ✅ _(roadmap)_ |
| DPA (LGPD) + auditoria | ❌ | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ❌ | Add-on |
| Suporte | Comunidade | E-mail | Prioritário | 24/7 + SLA + gerente |

> Nenhum plano usa armazenamento em GB como limite — a diferenciação é por capacidade, retenção temporal e quantidade de itens.

---

## 6) Resumo de preços

| Plano | Mensal | Anual | Equivalente/mês | Público-alvo |
|-------|--------|-------|-----------------|--------------|
| Inicial | **R$ 0** | — | — | Quem está começando |
| Starter | **R$ 14,90** | **R$ 143,00** | R$ 11,92 | Usuário individual |
| Pro ⭐ | **R$ 29,90** | **R$ 287,00** | R$ 23,92 | Profissional/estudante |
| Enterprise | **R$ 39,90/usuário** | **R$ 383,00/usuário** | R$ 31,92 | Times e empresas |

**Add-ons (opcionais):**
- White-label (logo + domínio) — sob consulta (Enterprise)
- Assentos adicionais Enterprise — mesmo valor por assento
- Onboarding/treinamento avulso — sob consulta

> Anual ≈ **2 meses grátis** (~20% de desconto). Pagamentos processados com segurança via Stripe. Cancele a qualquer momento pelo portal de cobrança. Reembolso em até 7 dias (CDC art. 49).

---

## 7) Justificativa de precificação

- **Inicial R$ 0:** motor de aquisição (PLG). Limites generosos o bastante para criar hábito, restritos o bastante (histórico de 7 dias, 1 dispositivo, 3 projetos) para incentivar upgrade.
- **Starter R$ 14,90:** posicionado **abaixo do TickTick** (~R$ 21) e do Todoist Pro, capturando o usuário sensível a preço que quer histórico e exportação. Âncora de entrada paga.
- **Pro R$ 29,90:** alinhado à faixa premium de produtividade (TickTick/Todoist Pro) e levemente acima — justificado por análises avançadas, bloqueador e integrações. É o plano-alvo de maior margem.
- **Enterprise R$ 39,90/usuário:** faixa B2B nacional competitiva vs. Todoist Business (~R$ 43) e Toggl (~R$ 49+), com NF-e, LGPD/DPA e administração — valor por assento escala com o tamanho do time.

**Métricas SaaS sugeridas para acompanhar:** conversão free→paid, MRR/ARR, ARPU, churn, LTV/CAC, taxa de upgrade Starter→Pro e expansão de assentos no Enterprise.

---

## 8) Fontes (pesquisa de mercado, jun/2026)

- TickTick — preços 2026: https://checkthat.ai/brands/ticktick/pricing
- Focus To-Do — review e preços 2026: https://goalsandprogress.com/focus-to-do-review-2026/
- Comparativo de apps Pomodoro 2026: https://goalsandprogress.com/pomodoro-apps-comparison/
- Todoist — preços: https://www.todoist.com/pricing
- Todoist Business — atualização de preço: https://www.todoist.com/pt-BR/help/articles/todoist-business-plan-pricing-update-dF5in65YM
- Toggl Track — preços 2026 (Capterra): https://www.capterra.com/p/247745/Toggl/
- Melhores apps de foco 2026: https://habi.app/insights/best-focus-timer-apps/

> Valores de concorrentes são públicos e datados; conversões em BRL são ilustrativas. Revise antes de publicar comparações.
</content>
</invoke>
