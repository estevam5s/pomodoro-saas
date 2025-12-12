"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { InteractiveGrid } from '@/components/ui/interactive-grid'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Settings, LogOut, Plus, Check, Trash2, Home, BarChart3, ListTodo, Clock, Calendar, TrendingUp, Award } from 'lucide-react'
import { supabase, Task, DailyStatistics, PomodoroSession } from '@/lib/supabase'
import Link from 'next/link'

type TabType = 'timer' | 'statistics' | 'tasks' | 'settings'

export default function DashboardPage() {
  const { user, preferences, profile, loading: authLoading, signOut, updatePreferences } = useAuth()
  const router = useRouter()

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('timer')

  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work')
  const [completedSessions, setCompletedSessions] = useState(0)

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Statistics state
  const [todayStats, setTodayStats] = useState<DailyStatistics | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<DailyStatistics[]>([])
  const [allSessions, setAllSessions] = useState<PomodoroSession[]>([])

  // Settings state
  const [editingPreferences, setEditingPreferences] = useState(false)
  const [tempPreferences, setTempPreferences] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!authLoading && user && !preferences) {
      router.push('/onboarding')
    }
  }, [preferences, authLoading, user, router])

  useEffect(() => {
    if (preferences) {
      setTimeLeft(preferences.work_duration * 60)
      setTempPreferences(preferences)
    }
  }, [preferences])

  useEffect(() => {
    if (user) {
      loadTasks()
      loadTodayStats()
      loadWeeklyStats()
      loadAllSessions()
    }
  }, [user])

  const loadTasks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
  }

  const loadTodayStats = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_statistics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (data) {
      setTodayStats(data)
    } else {
      const { data: newStats } = await supabase
        .from('daily_statistics')
        .insert({ user_id: user.id, date: today })
        .select()
        .single()
      if (newStats) setTodayStats(newStats)
    }
  }

  const loadWeeklyStats = async () => {
    if (!user) return
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data } = await supabase
      .from('daily_statistics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (data) setWeeklyStats(data)
  }

  const loadAllSessions = async () => {
    if (!user) return
    const { data } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('started_at', { ascending: false })
      .limit(50)

    if (data) setAllSessions(data)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    setIsRunning(false)
    if (!user || !preferences) return

    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      session_type: sessionType,
      duration: sessionType === 'work' ? preferences.work_duration : preferences.short_break_duration,
      completed: true,
      task_description: currentTaskId ? tasks.find(t => t.id === currentTaskId)?.title : null,
      completed_at: new Date().toISOString(),
    })

    if (sessionType === 'work') {
      setCompletedSessions((prev) => prev + 1)
      await updateDailyStats('pomodoro')
    }

    if (preferences.enable_notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Sessão concluída!', {
        body: sessionType === 'work' ? 'Hora de fazer uma pausa!' : 'Hora de voltar ao trabalho!',
      })
    }

    if (preferences.enable_sound) {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {})
    }

    if (sessionType === 'work') {
      const nextBreak = (completedSessions + 1) % preferences.sessions_until_long_break === 0 ? 'long_break' : 'short_break'
      setSessionType(nextBreak)
      setTimeLeft(nextBreak === 'long_break' ? preferences.long_break_duration * 60 : preferences.short_break_duration * 60)
    } else {
      setSessionType('work')
      setTimeLeft(preferences.work_duration * 60)
    }

    loadAllSessions()
  }

  const updateDailyStats = async (type: 'pomodoro' | 'task') => {
    if (!user || !todayStats) return
    const updates: any = {}
    if (type === 'pomodoro') {
      updates.total_pomodoros = (todayStats.total_pomodoros || 0) + 1
      updates.total_work_time = (todayStats.total_work_time || 0) + (preferences?.work_duration || 25)
    } else if (type === 'task') {
      updates.completed_tasks = (todayStats.completed_tasks || 0) + 1
    }
    const { data } = await supabase
      .from('daily_statistics')
      .update(updates)
      .eq('id', todayStats.id)
      .select()
      .single()
    if (data) {
      setTodayStats(data)
      loadWeeklyStats()
    }
  }

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false)
    } else {
      setIsRunning(true)
      if (preferences?.enable_notifications && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (preferences) {
      if (sessionType === 'work') setTimeLeft(preferences.work_duration * 60)
      else if (sessionType === 'short_break') setTimeLeft(preferences.short_break_duration * 60)
      else setTimeLeft(preferences.long_break_duration * 60)
    }
  }

  const addTask = async () => {
    if (!user || !newTaskTitle.trim()) return
    const { data } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: newTaskTitle,
        project_name: preferences?.main_project,
      })
      .select()
      .single()
    if (data) {
      setTasks([data, ...tasks])
      setNewTaskTitle('')
    }
  }

  const toggleTaskComplete = async (task: Task) => {
    const { data } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      })
      .eq('id', task.id)
      .select()
      .single()
    if (data) {
      setTasks(tasks.map((t) => (t.id === task.id ? data : t)))
      if (!task.completed) await updateDailyStats('task')
    }
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const savePreferences = async () => {
    if (!tempPreferences) return
    await updatePreferences(tempPreferences)
    setEditingPreferences(false)
    setTimeLeft(tempPreferences.work_duration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!preferences) return 0
    const total = sessionType === 'work' ? preferences.work_duration * 60 :
                  sessionType === 'short_break' ? preferences.short_break_duration * 60 :
                  preferences.long_break_duration * 60
    return ((total - timeLeft) / total) * 100
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  if (authLoading || !user || !preferences) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FocusTimer</h1>
              <p className="text-sm text-gray-400">Olá, {profile?.full_name || 'Usuário'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={signOut}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-t border-white/10">
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'timer'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Timer
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-4 h-4 inline mr-2" />
              Tarefas
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'statistics'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configurações
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Timer Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSessionType('work')
                        setTimeLeft(preferences.work_duration * 60)
                        setIsRunning(false)
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        sessionType === 'work'
                          ? 'bg-red-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Trabalho
                    </button>
                    <button
                      onClick={() => {
                        setSessionType('short_break')
                        setTimeLeft(preferences.short_break_duration * 60)
                        setIsRunning(false)
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        sessionType === 'short_break'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Pausa Curta
                    </button>
                    <button
                      onClick={() => {
                        setSessionType('long_break')
                        setTimeLeft(preferences.long_break_duration * 60)
                        setIsRunning(false)
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        sessionType === 'long_break'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Pausa Longa
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center mb-8">
                  <svg className="transform -rotate-90" width="300" height="300">
                    <circle cx="150" cy="150" r="140" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                    <circle
                      cx="150"
                      cy="150"
                      r="140"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 140}`}
                      strokeDashoffset={`${2 * Math.PI * 140 * (1 - getProgress() / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
                      <div className="text-gray-400 text-sm">
                        {sessionType === 'work' ? 'Tempo de Foco' : sessionType === 'short_break' ? 'Pausa Curta' : 'Pausa Longa'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 px-8"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="lg"
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                {currentTaskId && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Trabalhando em:</p>
                    <p className="text-white font-medium">{tasks.find(t => t.id === currentTaskId)?.title}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Progresso de Hoje</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 rounded-xl border border-red-500/20">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                      {todayStats?.total_pomodoros || 0}
                    </div>
                    <div className="text-gray-300 text-sm">Pomodoros completos</div>
                    <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${((todayStats?.total_pomodoros || 0) / preferences.daily_goal) * 100}%` }}
                      />
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Meta: {preferences.daily_goal} pomodoros</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-2xl font-bold text-white">{todayStats?.total_work_time || 0}m</div>
                      <div className="text-gray-400 text-xs">Tempo Focado</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="text-2xl font-bold text-white">{todayStats?.completed_tasks || 0}</div>
                      <div className="text-gray-400 text-xs">Tarefas Feitas</div>
                    </div>
                  </div>
                </div>
              </div>

              {preferences.main_project && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-2">Projeto Atual</h2>
                  <p className="text-gray-300">{preferences.main_project}</p>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                      {preferences.project_type}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Minhas Tarefas</h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Adicionar nova tarefa..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  onClick={addTask}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ListTodo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma tarefa ainda. Adicione uma acima!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        task.completed
                          ? 'bg-green-500/10 border-green-500/20'
                          : currentTaskId === task.id
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskComplete(task)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-white ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.project_name && (
                          <p className="text-xs text-gray-500 mt-1">{task.project_name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentTaskId(currentTaskId === task.id ? null : task.id)}
                        className={`px-3 py-1 rounded text-xs transition-all ${
                          currentTaskId === task.id
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {currentTaskId === task.id ? 'Em foco' : 'Focar'}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS TAB */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{todayStats?.total_pomodoros || 0}</div>
                </div>
                <p className="text-gray-400 text-sm">Pomodoros Hoje</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{todayStats?.total_work_time || 0}</div>
                </div>
                <p className="text-gray-400 text-sm">Minutos Focados</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{todayStats?.completed_tasks || 0}</div>
                </div>
                <p className="text-gray-400 text-sm">Tarefas Completas</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {weeklyStats.reduce((acc, stat) => acc + (stat.total_pomodoros || 0), 0)}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Total na Semana</p>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Últimos 7 Dias</h2>
              <div className="flex items-end justify-between gap-2 h-64">
                {weeklyStats.length > 0 ? (
                  weeklyStats.map((stat, index) => {
                    const maxPomodoros = Math.max(...weeklyStats.map(s => s.total_pomodoros || 0), 1)
                    const height = ((stat.total_pomodoros || 0) / maxPomodoros) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400">{stat.total_pomodoros || 0}</span>
                          <div
                            className="w-full bg-gradient-to-t from-red-500 to-orange-500 rounded-t transition-all hover:opacity-80"
                            style={{ height: `${height}%`, minHeight: stat.total_pomodoros ? '20px' : '4px' }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(stat.date)}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="w-full text-center text-gray-400">
                    Nenhum dado disponível ainda
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Sessões Recentes</h2>
              <div className="space-y-3">
                {allSessions.length > 0 ? (
                  allSessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.session_type === 'work'
                            ? 'bg-red-500/20'
                            : session.session_type === 'short_break'
                            ? 'bg-orange-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          <Clock className={`w-5 h-5 ${
                            session.session_type === 'work'
                              ? 'text-red-500'
                              : session.session_type === 'short_break'
                              ? 'text-orange-500'
                              : 'text-yellow-500'
                          }`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {session.session_type === 'work' ? 'Trabalho' :
                             session.session_type === 'short_break' ? 'Pausa Curta' : 'Pausa Longa'}
                          </p>
                          {session.task_description && (
                            <p className="text-sm text-gray-400">{session.task_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{session.duration} min</p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.started_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Nenhuma sessão registrada ainda
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Configurações do Pomodoro</h2>
                {!editingPreferences ? (
                  <Button
                    onClick={() => setEditingPreferences(true)}
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingPreferences(false)
                        setTempPreferences(preferences)
                      }}
                      variant="outline"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={savePreferences}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                    >
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração do Trabalho (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    disabled={!editingPreferences}
                    value={tempPreferences?.work_duration || 25}
                    onChange={(e) => setTempPreferences({ ...tempPreferences, work_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pausa Curta (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    disabled={!editingPreferences}
                    value={tempPreferences?.short_break_duration || 5}
                    onChange={(e) => setTempPreferences({ ...tempPreferences, short_break_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pausa Longa (minutos)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    disabled={!editingPreferences}
                    value={tempPreferences?.long_break_duration || 15}
                    onChange={(e) => setTempPreferences({ ...tempPreferences, long_break_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Diária (pomodoros)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    disabled={!editingPreferences}
                    value={tempPreferences?.daily_goal || 8}
                    onChange={(e) => setTempPreferences({ ...tempPreferences, daily_goal: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Projeto Principal
                  </label>
                  <input
                    type="text"
                    disabled={!editingPreferences}
                    value={tempPreferences?.main_project || ''}
                    onChange={(e) => setTempPreferences({ ...tempPreferences, main_project: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    placeholder="Ex: Estudar para certificação"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white font-medium">Notificações</div>
                    <div className="text-gray-400 text-sm">Receber alertas quando o timer terminar</div>
                  </div>
                  <button
                    disabled={!editingPreferences}
                    onClick={() => setTempPreferences({ ...tempPreferences, enable_notifications: !tempPreferences.enable_notifications })}
                    className={`w-14 h-8 rounded-full transition-all disabled:opacity-50 ${
                      tempPreferences?.enable_notifications ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-all ${
                        tempPreferences?.enable_notifications ? 'ml-7' : 'ml-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white font-medium">Som</div>
                    <div className="text-gray-400 text-sm">Tocar som quando o timer terminar</div>
                  </div>
                  <button
                    disabled={!editingPreferences}
                    onClick={() => setTempPreferences({ ...tempPreferences, enable_sound: !tempPreferences.enable_sound })}
                    className={`w-14 h-8 rounded-full transition-all disabled:opacity-50 ${
                      tempPreferences?.enable_sound ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-all ${
                        tempPreferences?.enable_sound ? 'ml-7' : 'ml-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Perfil</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                  <p className="text-white px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                    {profile?.full_name || 'Não definido'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <p className="text-white px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                    {profile?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Membro desde</label>
                  <p className="text-white px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                    {new Date(profile?.created_at || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
