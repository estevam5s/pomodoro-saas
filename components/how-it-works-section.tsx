import { ShineBorder } from "@/components/ui/shine-border"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Configure Seu Timer",
      description: "Escolha uma tarefa e configure o timer para 25 minutos (um Pomodoro padrão)",
      color: "from-red-500 to-red-600",
    },
    {
      number: "02",
      title: "Foque Profundamente",
      description: "Trabalhe em sua tarefa com foco completo até o timer tocar",
      color: "from-orange-500 to-orange-600",
    },
    {
      number: "03",
      title: "Faça uma Pausa",
      description: "Faça uma pausa curta de 5 minutos para descansar sua mente",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      number: "04",
      title: "Repita e Acompanhe",
      description: "Repita o ciclo e acompanhe sua produtividade ao longo do tempo",
      color: "from-red-500 to-red-600",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 px-6 bg-black/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Como a Técnica Pomodoro Funciona</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          A Técnica Pomodoro é um método de gerenciamento de tempo desenvolvido por Francesco Cirillo que usa um timer para dividir
          o trabalho em intervalos, tradicionalmente de 25 minutos, separados por pausas curtas.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <ShineBorder key={step.number} className="h-full" borderClassName="border border-white/10 rounded-xl">
              <div className="p-6 h-full">
                <div className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${step.color} mb-4`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute bottom-6 right-0 transform translate-x-1/2 translate-y-1/2 z-10">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 8L20 32M20 32L32 20M20 32L8 20"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={index % 2 === 0 ? "rotate-90" : "rotate-0"}
                      />
                    </svg>
                  </div>
                )}
              </div>
            </ShineBorder>
          ))}
        </div>
      </div>
    </section>
  )
}
