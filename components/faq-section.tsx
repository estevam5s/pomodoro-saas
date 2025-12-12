"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function FaqSection() {
  const faqs = [
    {
      question: "O que é a Técnica Pomodoro?",
      answer:
        "A Técnica Pomodoro é um método de gerenciamento de tempo desenvolvido por Francesco Cirillo no final dos anos 1980. Ela usa um timer para dividir o trabalho em intervalos, tradicionalmente de 25 minutos, separados por pausas curtas. Esses intervalos são conhecidos como 'pomodoros'.",
    },
    {
      question: "Como o FocusTimer ajuda com produtividade?",
      answer:
        "FocusTimer implementa a Técnica Pomodoro com recursos adicionais como gerenciamento de tarefas, análise de produtividade e timers personalizáveis. Ao trabalhar em sprints focados e fazer pausas regulares, você pode manter altos níveis de concentração e evitar o esgotamento.",
    },
    {
      question: "Posso personalizar as durações do timer?",
      answer:
        "Sim! Com a versão Pro, você pode personalizar completamente as durações de suas sessões de foco e pausas para combinar com seu ritmo pessoal de produtividade.",
    },
    {
      question: "O FocusTimer está disponível em dispositivos móveis?",
      answer:
        "Sim, FocusTimer está disponível para iOS e Android, assim como aplicativos desktop para Windows e macOS. Seus dados sincronizam em todos os seus dispositivos.",
    },
    {
      question: "Como funciona o bloqueador de sites?",
      answer:
        "O bloqueador de sites (disponível no Pro) permite que você crie uma lista de sites que distraem e que serão automaticamente bloqueados durante suas sessões de foco, ajudando você a manter o foco.",
    },
    {
      question: "Posso exportar meus dados de produtividade?",
      answer: "Sim, usuários Pro podem exportar seus dados de produtividade em formato CSV para análise adicional ou manutenção de registros.",
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 px-6 bg-black/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Perguntas Frequentes</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Tem dúvidas sobre o FocusTimer? Encontre respostas para perguntas comuns abaixo.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                className="flex justify-between items-center w-full p-6 text-left"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              {openIndex === index && <div className="p-6 pt-0 text-gray-400">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
