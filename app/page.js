import Link from "next/link";

export default async function Home() {
  return (
    <main className="animated-gif h-screen w-screen flex items-center p-10">
      <div>
        <h1 className="font-bold text-6xl text-white">EMERGENCY</h1>
        <h1 className="font-bold text-6xl text-white">DESIGN</h1>
        {/* <h1 className="font-semibold text-4xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"> */}
        <h1 className="font-semibold text-4xl mt-2 bg-clip-text text-indigo-200/70">
          Automation
        </h1>
        <div className="text-white/50">
          <h2 className="mt-12">By</h2>
          <h2 className="mt-1">Arsham Aghababaie</h2>
          <h2 className="mt-1">Mahdiye Pakdel</h2>
        </div>
        <div className="mt-12">
          <Link
            href="app/generate"
            className="font-semibold mt-24 p-4 bg-black font-light text-2xl text-white duration-200 transition hover:bg-black/20 border-2 border-black/50 rounded-lg"
          >
            PLAN IT!
          </Link>
        </div>
      </div>
    </main>
  );
}
