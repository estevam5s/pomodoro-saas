import Link from "next/link";
export const metadata = { title: "Página não encontrada" };
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6 text-center dark:from-slate-950 dark:to-slate-900">
      <p className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">A página que você procura não existe, foi movida ou o endereço está incorreto.</p>
      <Link href="/" className="mt-8 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700">Voltar ao início</Link>
    </main>
  );
}
