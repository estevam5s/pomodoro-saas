import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { ShineBorder } from "@/components/ui/shine-border"

export function PricingSection() {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      description: "Perfeito para começar com a técnica Pomodoro",
      features: ["Timer Pomodoro básico", "Gerenciamento de tarefas", "Estatísticas diárias", "Apps mobile e desktop"],
      buttonText: "Baixar Grátis",
      buttonVariant: "outline",
    },
    {
      name: "Pro",
      price: "R$ 24,90",
      period: "por mês",
      description: "Recursos avançados para entusiastas sérios de produtividade",
      features: [
        "Tudo do Gratuito",
        "Durações de timer personalizadas",
        "Análises avançadas",
        "Integração com calendário",
        "Bloqueador de sites",
        "Suporte prioritário",
      ],
      buttonText: "Obter Pro",
      buttonVariant: "default",
      highlight: true,
    },
  ]

  return (
    <section id="pricing" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Preços Simples e Transparentes</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Escolha o plano que se adapta às suas necessidades de produtividade
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <ShineBorder
              key={plan.name}
              className={`h-full ${plan.highlight ? "z-10" : ""}`}
              borderClassName={`border ${plan.highlight ? "border-red-500/50" : "border-white/10"} rounded-xl`}
            >
              <div className={`p-8 h-full ${plan.highlight ? "bg-gradient-to-b from-black to-black/80" : ""}`}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant as "outline" | "default"}
                  className={`w-full ${plan.highlight ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90" : ""}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </ShineBorder>
          ))}
        </div>
      </div>
    </section>
  )
}
