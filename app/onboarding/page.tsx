"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { InteractiveGrid } from '@/components/ui/interactive-grid'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function OnboardingPage() {
  const { user, refreshPreferences } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Estado do formulário
  const [formData, setFormData] = useState({
    projectType: '',
    mainProject: '',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    dailyGoal: 8,
    enableNotifications: true,
    enableSound: true,
  })

  const projectTypes = [
    { value: 'work', label: 'Trabalho', icon: '💼' },
    { value: 'study', label: 'Estudos', icon: '📚' },
    { value: 'personal', label: 'Projeto Pessoal', icon: '🎨' },
    { value: 'fitness', label: 'Exercícios', icon: '💪' },
    { value: 'other', label: 'Outro', icon: '⭐' },
  ]

  const workDurations = [
    { value: 15, label: '15 min' },
    { value: 25, label: '25 min (Recomendado)' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' },
  ]

  const dailyGoals = [
    { value: 4, label: '4 pomodoros' },
    { value: 6, label: '6 pomodoros' },
    { value: 8, label: '8 pomodoros (Recomendado)' },
    { value: 10, label: '10 pomodoros' },
    { value: 12, label: '12 pomodoros' },
  ]

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Salvar preferências no banco. upsert (não insert) para não dar 409 se o
      // usuário já tiver uma linha (refresh, onboarding refeito) — UNIQUE(user_id).
      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: user.id,
          project_type: formData.projectType,
          main_project: formData.mainProject,
          work_duration: formData.workDuration,
          short_break_duration: formData.shortBreakDuration,
          long_break_duration: formData.longBreakDuration,
          daily_goal: formData.dailyGoal,
          enable_notifications: formData.enableNotifications,
          enable_sound: formData.enableSound,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

      if (error) throw error

      // Atualizar contexto
      await refreshPreferences()

      // Redirecionar para o dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      alert('Erro ao salvar suas preferências. Tente novamente.')
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
    else handleSubmit()
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-12">
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Vamos configurar seu FocusTimer</h1>
            <p className="text-gray-400">Personalize sua experiência em 3 passos simples</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    s <= step ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400">
              Passo {step} de 3
            </p>
          </div>

          {/* Step 1: Tipo de Projeto */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Qual é seu foco principal?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Isso nos ajuda a personalizar sua experiência
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {projectTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, projectType: type.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.projectType === type.value
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-4xl mb-2">{type.icon}</div>
                      <div className="text-white font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descreva seu projeto ou objetivo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.mainProject}
                  onChange={(e) => setFormData({ ...formData, mainProject: e.target.value })}
                  placeholder="Ex: Preparar para certificação AWS"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Duração do Pomodoro */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Quanto tempo você consegue focar?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Configure a duração ideal de trabalho concentrado
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workDurations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setFormData({ ...formData, workDuration: duration.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.workDuration === duration.value
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-white font-medium">{duration.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pausa curta (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.shortBreakDuration}
                    onChange={(e) => setFormData({ ...formData, shortBreakDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pausa longa (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={formData.longBreakDuration}
                    onChange={(e) => setFormData({ ...formData, longBreakDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Meta Diária */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Qual sua meta diária?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Quantos pomodoros você quer completar por dia?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dailyGoals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, dailyGoal: goal.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.dailyGoal === goal.value
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-white font-medium">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white font-medium">Notificações</div>
                    <div className="text-gray-400 text-sm">Receber alertas quando o timer terminar</div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, enableNotifications: !formData.enableNotifications })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      formData.enableNotifications ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-all ${
                        formData.enableNotifications ? 'ml-7' : 'ml-1'
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
                    onClick={() => setFormData({ ...formData, enableSound: !formData.enableSound })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      formData.enableSound ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-all ${
                        formData.enableSound ? 'ml-7' : 'ml-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={loading || (step === 1 && !formData.projectType)}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
            >
              {loading ? 'Salvando...' : step === 3 ? 'Começar' : 'Próximo'}
              {step < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
