import { GradientCard } from "@/components/ui/gradient-card"
import { Clock, BarChart2, Bell, CheckCircle, Calendar, Settings } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Timers Personalizáveis",
      description: "Defina suas próprias durações de foco e pausa para combinar com seu ritmo pessoal de produtividade",
      icon: <Clock className="h-6 w-6 text-red-500" />,
    },
    {
      title: "Análise de Produtividade",
      description: "Acompanhe suas sessões de foco e tendências de produtividade ao longo do tempo com estatísticas detalhadas",
      icon: <BarChart2 className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Notificações Inteligentes",
      description: "Receba lembretes suaves quando for hora de focar ou fazer uma pausa",
      icon: <Bell className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: "Gerenciamento de Tarefas",
      description: "Organize seu trabalho com uma lista de tarefas integrada que sincroniza com suas sessões Pomodoro",
      icon: <CheckCircle className="h-6 w-6 text-red-500" />,
    },
    {
      title: "Metas Diárias",
      description: "Defina metas diárias de foco e acompanhe seu progresso em direção a alcançá-las",
      icon: <Calendar className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Bloqueador de Distrações",
      description: "Bloqueio opcional de sites e aplicativos durante sessões de foco para ajudá-lo a manter o foco",
      icon: <Settings className="h-6 w-6 text-yellow-500" />,
    },
  ]

  return (
    <section id="features" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
          Recursos Projetados para o Foco
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          FocusTimer combina a comprovada técnica Pomodoro com recursos modernos para ajudá-lo a alcançar foco profundo e
          maximizar sua produtividade.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <GradientCard key={feature.title}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-white/5">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </GradientCard>
          ))}
        </div>
      </div>
    </section>
  )
}
