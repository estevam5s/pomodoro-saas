-- =========================================
-- POMODORO SAAS - DATABASE SCHEMA
-- =========================================
-- Este arquivo contém o schema completo do banco de dados
-- com Row Level Security (RLS) habilitado para isolamento de dados

-- =========================================
-- 1. EXTENSÕES
-- =========================================
-- Habilitar UUID para geração de IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 2. TABELA: profiles
-- =========================================
-- Vinculada ao auth.users do Supabase
-- Armazena informações adicionais do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Permitir inserção durante cadastro (via trigger)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =========================================
-- 3. TABELA: user_preferences
-- =========================================
-- Armazena as preferências de Pomodoro do usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Configurações do Pomodoro
  work_duration INTEGER DEFAULT 25 NOT NULL, -- minutos
  short_break_duration INTEGER DEFAULT 5 NOT NULL, -- minutos
  long_break_duration INTEGER DEFAULT 15 NOT NULL, -- minutos
  sessions_until_long_break INTEGER DEFAULT 4 NOT NULL,

  -- Informações do projeto/objetivo
  main_project TEXT,
  project_type TEXT, -- 'work', 'study', 'personal', etc.
  daily_goal INTEGER DEFAULT 8, -- número de pomodoros por dia

  -- Preferências de notificação
  enable_notifications BOOLEAN DEFAULT true,
  enable_sound BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir que cada usuário tenha apenas uma configuração
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias preferências
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias preferências
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias preferências
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================================
-- 4. TABELA: pomodoro_sessions
-- =========================================
-- Armazena o histórico de sessões Pomodoro completadas
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Informações da sessão
  session_type TEXT NOT NULL, -- 'work', 'short_break', 'long_break'
  duration INTEGER NOT NULL, -- duração em minutos
  completed BOOLEAN DEFAULT false,

  -- Informações do projeto/tarefa
  task_description TEXT,
  project_name TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias sessões
CREATE POLICY "Users can view own sessions"
  ON public.pomodoro_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias sessões
CREATE POLICY "Users can insert own sessions"
  ON public.pomodoro_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias sessões
CREATE POLICY "Users can update own sessions"
  ON public.pomodoro_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias sessões
CREATE POLICY "Users can delete own sessions"
  ON public.pomodoro_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================
-- 5. TABELA: daily_statistics
-- =========================================
-- Armazena estatísticas diárias agregadas
CREATE TABLE IF NOT EXISTS public.daily_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Data da estatística
  date DATE NOT NULL,

  -- Estatísticas
  total_pomodoros INTEGER DEFAULT 0,
  total_work_time INTEGER DEFAULT 0, -- em minutos
  total_break_time INTEGER DEFAULT 0, -- em minutos
  completed_tasks INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir que cada usuário tenha apenas uma estatística por dia
  UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias estatísticas
CREATE POLICY "Users can view own statistics"
  ON public.daily_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias estatísticas
CREATE POLICY "Users can insert own statistics"
  ON public.daily_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias estatísticas
CREATE POLICY "Users can update own statistics"
  ON public.daily_statistics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================================
-- 6. TABELA: tasks
-- =========================================
-- Lista de tarefas do usuário
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Informações da tarefa
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  estimated_pomodoros INTEGER DEFAULT 1,
  actual_pomodoros INTEGER DEFAULT 0,

  -- Prioridade e categoria
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  project_name TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias tarefas
CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias tarefas
CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias tarefas
CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias tarefas
CREATE POLICY "Users can delete own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================
-- 7. FUNÇÕES E TRIGGERS
-- =========================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_statistics_updated_at
  BEFORE UPDATE ON public.daily_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =========================================

-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started_at ON public.pomodoro_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_id_date ON public.daily_statistics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);

-- =========================================
-- FIM DO SCHEMA
-- =========================================

-- Para executar este script no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para "SQL Editor"
-- 3. Cole todo este conteúdo
-- 4. Execute o script
-- 5. Todas as tabelas, políticas e triggers serão criados automaticamente
