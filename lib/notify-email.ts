// Notificações por e-mail — provider-agnostic, SEM dependências (usa fetch).
// Suporta Resend (RESEND_API_KEY) e Brevo (BREVO_API_KEY). Sem chave = no-op
// silencioso (apenas loga), então é seguro deixar plugado mesmo sem configurar.
// FocusTimer e https://pomodoro-saas-rho.vercel.app são preenchidos por SaaS na cópia.

const APP_NAME = "FocusTimer";
const APP_URL = "https://pomodoro-saas-rho.vercel.app";
const FROM = process.env.EMAIL_FROM || `${APP_NAME} <nao-responda@estevamsouza.com.br>`;

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!to || !to.includes("@")) return false;
  try {
    const resend = process.env.RESEND_API_KEY;
    if (resend) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [to], subject, html }),
      });
      return r.ok;
    }
    const brevo = process.env.BREVO_API_KEY;
    if (brevo) {
      const m = FROM.match(/^(.*?)\s*<(.+)>$/);
      const sender = m ? { name: m[1], email: m[2] } : { email: FROM };
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevo, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }),
      });
      return r.ok;
    }
    console.log(`[email:no-op] to=${to} subject=${subject} (nenhum provedor configurado)`);
    return false;
  } catch (e) {
    console.error("[email] falha ao enviar:", e);
    return false;
  }
}

function shell(title: string, body: string): string {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
    <h2 style="margin:0 0 12px">${title}</h2>
    <div style="font-size:15px;line-height:1.6;color:#333">${body}</div>
    <p style="margin-top:24px"><a href="${APP_URL}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px">Acessar ${APP_NAME}</a></p>
    <p style="margin-top:24px;font-size:12px;color:#999">Você recebeu este e-mail porque tem uma conta no ${APP_NAME}. Em conformidade com a LGPD.</p>
  </div>`;
}

export const notifyWelcome = (to: string, name?: string) =>
  sendEmail(to, `Bem-vindo(a) ao ${APP_NAME}! 🎉`,
    shell(`Bem-vindo(a) ao ${APP_NAME}!`,
      `Olá${name ? " " + name : ""}, sua conta foi criada com sucesso. Estamos felizes em ter você conosco — explore os recursos e qualquer dúvida é só responder este e-mail.`));

export const notifyCancellation = (to: string, name?: string) =>
  sendEmail(to, `Sua assinatura no ${APP_NAME} foi cancelada`,
    shell(`Assinatura cancelada`,
      `Olá${name ? " " + name : ""}, confirmamos o cancelamento da sua assinatura no ${APP_NAME}. Você continua com acesso ao plano gratuito. Mudou de ideia? É só reativar a qualquer momento pela sua conta.`));

export const notifyDunning = (to: string, name?: string) =>
  sendEmail(to, `Falha no pagamento — ação necessária no ${APP_NAME}`,
    shell(`Não conseguimos processar seu pagamento`,
      `Olá${name ? " " + name : ""}, tivemos um problema ao cobrar sua assinatura do ${APP_NAME}. Para não perder o acesso, atualize sua forma de pagamento na sua conta. Faremos novas tentativas nos próximos dias.`));
