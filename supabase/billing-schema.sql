-- =========================================
-- FOCUSTIMER SAAS — BILLING SCHEMA
-- planos, assinaturas e eventos de pagamento (multi-tenant + RLS)
-- limites: -1 = ilimitado (uso justo). NUNCA limite por GB.
-- =========================================

-- 1) PLANS (público para leitura)
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_month INTEGER NOT NULL DEFAULT 0,   -- centavos (BRL)
  price_year INTEGER NOT NULL DEFAULT 0,    -- centavos (BRL)
  stripe_price_month TEXT,
  stripe_price_year TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  per_seat BOOLEAN NOT NULL DEFAULT false,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  sort INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_select_all" ON public.plans;
CREATE POLICY "plans_select_all" ON public.plans FOR SELECT USING (true);

-- 2) SUBSCRIPTIONS (uma por usuário)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL DEFAULT 'free' REFERENCES public.plans(slug),
  status TEXT NOT NULL DEFAULT 'active',   -- active | trialing | past_due | canceled | incomplete
  cycle TEXT NOT NULL DEFAULT 'month',     -- month | year
  seats INTEGER NOT NULL DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subs_select_own" ON public.subscriptions;
CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- writes apenas via service_role (bypassa RLS)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(stripe_customer_id);

-- 3) PAYMENT EVENTS (idempotência + auditoria) — deny-all p/ clientes
CREATE TABLE IF NOT EXISTS public.payment_events (
  id TEXT PRIMARY KEY,                      -- stripe event id
  type TEXT,
  user_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- 4) ADMIN AUDIT LOGS (deny-all p/ clientes)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_email TEXT,
  action TEXT,
  target TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 5) trigger de updated_at
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6) handle_new_user: cria profile + subscription free automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_slug, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7) SEED dos 4 planos (preços do plano-preco.md)
INSERT INTO public.plans (slug, name, description, price_month, price_year, features, limits, per_seat, highlighted, sort) VALUES
('free', 'Inicial', 'Para conhecer a técnica Pomodoro e criar o hábito. Sem cartão.', 0, 0,
  '["Timer Pomodoro completo (trabalho, pausa curta e longa)","Durações padrão (25/5/15) com 1 preset","Até 3 projetos e 30 tarefas ativas","Meta diária de pomodoros","Estatísticas do dia + gráfico de 7 dias","Histórico de sessões: 7 dias","Notificações do navegador e alerta sonoro","PWA (mobile + desktop) e modo offline","Sincronização em 1 dispositivo","Suporte por comunidade"]'::jsonb,
  '{"projects":3,"tasks":30,"history_days":7,"devices":1,"presets":1,"advanced_stats":false,"blocker":false,"calendar":false,"export":false}'::jsonb,
  false, false, 0),

('starter', 'Starter', 'Para quem quer histórico completo e relatórios.', 1490, 14300,
  '["Tudo do Inicial","Projetos e tarefas ilimitados (uso justo)","Durações personalizadas + até 5 presets","Prioridades e estimativa de pomodoros por tarefa","Estatísticas semanais e mensais","Histórico de sessões: 90 dias","Exportação de dados (CSV)","Sincronização em até 3 dispositivos","Temas e sons de foco adicionais","Sem anúncios","Suporte por e-mail"]'::jsonb,
  '{"projects":-1,"tasks":-1,"history_days":90,"devices":3,"presets":5,"advanced_stats":false,"blocker":false,"calendar":false,"export":"csv"}'::jsonb,
  false, false, 1),

('pro', 'Pro', 'Para profissionais e estudantes que levam produtividade a sério.', 2990, 28700,
  '["Tudo do Starter","Análises avançadas: tendências, horários produtivos, streaks e insights","Presets de timer ilimitados e perfis por projeto","Bloqueador de distrações (sites/apps)","Integração com calendário (Google/Outlook)","Histórico de sessões ilimitado","Relatórios em PDF/CSV","Lembretes e agendamento de sessões","Sincronização em dispositivos ilimitados","Backup automático","Suporte prioritário"]'::jsonb,
  '{"projects":-1,"tasks":-1,"history_days":-1,"devices":-1,"presets":-1,"advanced_stats":true,"blocker":true,"calendar":true,"export":"pdf"}'::jsonb,
  false, true, 2),

('enterprise', 'Enterprise', 'Para times e empresas. Mínimo de 3 assentos. NF-e.', 3990, 38300,
  '["Tudo do Pro para todos os membros","Painel de administração da organização","Equipes e departamentos com papéis e permissões","Relatórios agregados de produtividade por equipe","SSO / login corporativo (Google/SAML)","API e webhooks","Integrações de equipe (Slack, Notion)","Exportação em massa e relatórios corporativos","DPA (LGPD), privacidade e logs de auditoria","White-label opcional (add-on)","Onboarding assistido e treinamento","Gerente de conta dedicado e SLA","Suporte prioritário 24/7"]'::jsonb,
  '{"projects":-1,"tasks":-1,"history_days":-1,"devices":-1,"presets":-1,"advanced_stats":true,"blocker":true,"calendar":true,"export":"pdf","seats":3,"admin":true,"api":true}'::jsonb,
  true, false, 3)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, price_month=EXCLUDED.price_month,
  price_year=EXCLUDED.price_year, features=EXCLUDED.features, limits=EXCLUDED.limits,
  per_seat=EXCLUDED.per_seat, highlighted=EXCLUDED.highlighted, sort=EXCLUDED.sort, updated_at=NOW();
