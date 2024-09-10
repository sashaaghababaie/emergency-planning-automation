import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex flex-col h-screen w-screen items-center justify-center">
      <h1 className="font-bold text-6xl">Emergency Design</h1>
      <h1 className="font-semibold text-4xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Automation</h1>
      <h2 className="mt-12">By: Sasha Aghababaie</h2>
      <h2 className="mt-12">NOT ARSHAM!</h2>
      <Link
        href="app/generate"
        className="mt-12 p-4 bg-blue-700 font-light text-2xl text-white duration-200 transition hover:bg-blue-600 rounded-lg"
      >
        Enter App
      </Link>
    </main>
  );
}
