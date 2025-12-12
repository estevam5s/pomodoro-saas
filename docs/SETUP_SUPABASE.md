# Configuração do Supabase - FocusTimer

Este guia mostrará como configurar o banco de dados do Supabase para o FocusTimer.

## Passos para Configuração

### 1. Acessar o Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `pomodoro-saas` ou o projeto correspondente

### 2. Executar o Script SQL

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New query** para criar uma nova query
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. Copie **TODO** o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

O script irá criar automaticamente:
- ✅ Todas as tabelas necessárias
- ✅ Políticas de Row Level Security (RLS)
- ✅ Triggers automáticos
- ✅ Índices para melhor performance

### 3. Verificar a Instalação

Após executar o script, você deve ver as seguintes tabelas criadas:

1. **profiles** - Perfis dos usuários
2. **user_preferences** - Preferências do Pomodoro
3. **pomodoro_sessions** - Histórico de sessões
4. **daily_statistics** - Estatísticas diárias
5. **tasks** - Lista de tarefas

Para verificar, vá em **Table Editor** no menu lateral e confirme que todas as tabelas estão listadas.

### 4. Testar a Segurança (RLS)

O Row Level Security garante que:
- ✅ Cada usuário só vê seus próprios dados
- ✅ Ninguém pode acessar dados de outros usuários
- ✅ Isolamento total dos dados (Multi-tenancy seguro)

Para verificar as políticas de segurança:
1. Vá em **Authentication** > **Policies**
2. Selecione cada tabela
3. Confirme que as políticas estão ativas

## Estrutura das Tabelas

### profiles
Armazena informações adicionais do usuário vinculadas ao sistema de autenticação do Supabase.

### user_preferences
Configurações personalizadas do Pomodoro:
- Duração do trabalho, pausas curtas e longas
- Projeto principal
- Meta diária de pomodoros
- Preferências de notificações e som

### pomodoro_sessions
Histórico completo de todas as sessões Pomodoro realizadas pelo usuário.

### daily_statistics
Estatísticas agregadas por dia:
- Total de pomodoros completados
- Tempo total focado
- Tarefas completadas

### tasks
Lista de tarefas do usuário com:
- Título e descrição
- Status de conclusão
- Estimativa de pomodoros necessários
- Prioridade

## Configuração Concluída

Após executar o script SQL com sucesso, seu banco de dados está pronto para uso!

Agora você pode:
1. Iniciar o servidor de desenvolvimento: `npm run dev`
2. Acessar `http://localhost:2999`
3. Criar uma conta de usuário
4. Configurar suas preferências no onboarding
5. Começar a usar o FocusTimer!

## Solução de Problemas

### Erro: "relation already exists"
Se você já executou o script antes, algumas tabelas podem já existir. Para recriar tudo do zero:
1. No SQL Editor, execute: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. Execute o script `schema.sql` novamente

### Erro de permissões
Certifique-se de estar usando a Service Role Key quando necessário, mas para o uso normal da aplicação, a Anon Key é suficiente.

### RLS não está funcionando
Verifique se as políticas foram criadas corretamente:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

## Suporte

Para mais informações sobre o Supabase, consulte a [documentação oficial](https://supabase.com/docs).
