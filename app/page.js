import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex h-screen w-screen items-center justify-centerr">
      <Link
        href="app/generate"
        className="p-4 bg-blue-500 font-bold text-2xl text-white duration-200 transition hover:bg-blue-300 rounded-lg"
      >
        Enter App
      </Link>
    </main>
  );
}
