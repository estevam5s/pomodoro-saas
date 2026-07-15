"use client";

import {
  memo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------- keyframes + estilos injetados localmente (sem framer-motion) ---------- */
const STYLES = `
@keyframes aauth-orbit {
  0%   { transform: rotate(0deg) translateY(calc(var(--r) * 1px)) rotate(0deg); }
  100% { transform: rotate(360deg) translateY(calc(var(--r) * 1px)) rotate(-360deg); }
}
@keyframes aauth-ripple {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(0.9); }
}
@keyframes aauth-reveal {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* O conteúdo é visível por padrão (opacity:1); a animação só o "sobe". Assim,
   mesmo que a animação não rode, o formulário NUNCA fica invisível. */
.aauth-reveal { animation: aauth-reveal 0.5s ease both; }
`;

/* ---------- Input com spotlight radial que segue o mouse (CSS puro) ---------- */
export function SpotlightInput({
  accent = "#3b82f6",
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { accent?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - left, y: e.clientY - top });
  }

  const bg = pos
    ? `radial-gradient(110px circle at ${pos.x}px ${pos.y}px, ${accent}, transparent 80%)`
    : "transparent";

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos(null)}
      style={{ background: bg }}
      className="group/input rounded-xl p-[1.5px] transition-[background] duration-300"
    >
      <input
        className={cn(
          "flex h-12 w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white outline-none transition duration-300",
          "placeholder:text-white/30 group-hover/input:border-transparent",
          "focus-visible:ring-2 focus-visible:ring-white/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/* ---------- Reveal: fade-up em CSS. Conteúdo visível por padrão. ---------- */
export const BoxReveal = memo(function BoxReveal({
  children,
  width = "fit-content",
  className,
}: {
  children: ReactNode;
  boxColor?: string;
  duration?: number;
  width?: string;
  className?: string;
}) {
  return (
    <div style={{ width }} className={cn("aauth-reveal", className)}>
      {children}
    </div>
  );
});

/* ---------- Ripple: círculos concêntricos pulsando ---------- */
export function Ripple({ accent = "#3b82f6", count = 9 }: { accent?: string; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,black,transparent)]">
      {Array.from({ length: count }).map((_, i) => {
        const size = 180 + i * 80;
        return (
          <span
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              opacity: 0.22 - i * 0.02,
              borderColor: `${accent}55`,
              borderStyle: i === count - 1 ? "dashed" : "solid",
              top: "50%",
              left: "50%",
              animation: `aauth-ripple 2.4s ease ${i * 0.12}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------- Ícones orbitando (nicho do SaaS) ---------- */
export type OrbitIcon = {
  icon: LucideIcon;
  radius: number;
  duration?: number;
  delay?: number;
  size?: number;
  reverse?: boolean;
};

function Orbit({ accent, orbit }: { accent: string; orbit: OrbitIcon }) {
  const { icon: Icon, radius, duration = 22, delay = 0, size = 40, reverse } = orbit;
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50%" cy="50%" r={radius} fill="none" className="stroke-white/[0.06]" strokeWidth={1} />
      </svg>
      <div
        style={{
          // @ts-expect-error CSS var
          "--r": radius,
          width: size,
          height: size,
          animation: `aauth-orbit ${duration}s linear ${-delay}s infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur"
      >
        <Icon style={{ width: size * 0.5, height: size * 0.5, color: accent }} />
      </div>
    </>
  );
}

export function TechOrbit({
  accent,
  icons,
  text,
}: {
  accent: string;
  icons: OrbitIcon[];
  text: string;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <Ripple accent={accent} />
      <span
        className="pointer-events-none z-10 max-w-[70%] text-center text-4xl font-bold leading-tight text-transparent xl:text-5xl"
        style={{ backgroundImage: `linear-gradient(to bottom, #ffffff, ${accent})`, WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        {text}
      </span>
      {icons.map((o, i) => (
        <Orbit key={i} accent={accent} orbit={o} />
      ))}
    </div>
  );
}

/* ---------- Botão com gradiente inferior no hover ---------- */
function BottomGradient({ accent }: { accent: string }) {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full opacity-0 transition duration-500 group-hover/btn:opacity-100" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
    </>
  );
}

/* ---------- Formulário animado (wire externo) ---------- */
export type AuthField = {
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
  required?: boolean;
};

export function AnimatedAuthForm({
  accent = "#3b82f6",
  title,
  subtitle,
  fields,
  submitLabel,
  loading,
  error,
  info,
  onSubmit,
  onGoogle,
  googleLabel = "Continuar com Google",
  footer,
  beforeForm,
}: {
  accent?: string;
  title: string;
  subtitle?: string;
  fields: AuthField[];
  submitLabel: string;
  loading?: boolean;
  error?: string;
  info?: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoogle?: () => void;
  googleLabel?: string;
  footer?: ReactNode;
  beforeForm?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <BoxReveal>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </BoxReveal>
      {subtitle && (
        <BoxReveal className="pb-1">
          <p className="max-w-sm text-sm text-white/50">{subtitle}</p>
        </BoxReveal>
      )}

      {beforeForm && <BoxReveal width="100%">{beforeForm}</BoxReveal>}

      {onGoogle && (
        <>
          <BoxReveal width="100%">
            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              className="group/btn relative flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/12 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" /></svg>
              {googleLabel}
              <BottomGradient accent={accent} />
            </button>
          </BoxReveal>
          <BoxReveal width="100%">
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="h-px flex-1 bg-white/10" /> ou com e-mail <span className="h-px flex-1 bg-white/10" />
            </div>
          </BoxReveal>
        </>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
        )}
        {info && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{info}</div>
        )}

        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <BoxReveal width="100%">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-white/80">{f.label}</label>
                {f.trailing}
              </div>
            </BoxReveal>
            <BoxReveal width="100%">
              <div className="relative">
                <SpotlightInput
                  accent={accent}
                  type={f.type === "password" ? (visible ? "text" : "password") : f.type}
                  value={f.value}
                  onChange={f.onChange}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  required={f.required}
                  className={f.type === "password" ? "pr-11" : undefined}
                />
                {f.type === "password" && (
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </BoxReveal>
          </div>
        ))}

        <BoxReveal width="100%">
          <button
            type="submit"
            disabled={loading}
            className="group/btn relative mt-1 block h-11 w-full rounded-lg font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
            style={{ background: `linear-gradient(to bottom right, ${accent}, ${accent}cc)` }}
          >
            {loading ? "..." : <>{submitLabel} &rarr;</>}
            <BottomGradient accent={accent} />
          </button>
        </BoxReveal>
      </form>

      {footer && (
        <BoxReveal width="100%">
          <div className="text-center text-sm text-white/50">{footer}</div>
        </BoxReveal>
      )}
    </section>
  );
}

/* ---------- Layout split: painel orbital à esquerda, form à direita ---------- */
export function AnimatedAuthLayout({
  accent = "#3b82f6",
  panelText,
  orbitIcons,
  children,
}: {
  accent?: string;
  panelText: string;
  orbitIcons: OrbitIcon[];
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#05070d]">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {/* glow de fundo */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: `${accent}22` }} />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: `${accent}18` }} />

      {/* painel esquerdo (nicho) */}
      <div className="relative hidden w-1/2 lg:block">
        <TechOrbit accent={accent} icons={orbitIcons} text={panelText} />
      </div>

      {/* form */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
