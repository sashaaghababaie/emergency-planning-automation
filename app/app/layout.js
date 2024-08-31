import Link from "next/link";

export default function AppLayout({ children }) {
  return (
    <main className="flex h-screen">
      <aside className="h-screen hidden md:block w-[250px] border-r-[1px] border-r-black text-sm">
        <Link
          className="transition duration-200 flex w-full py-1 px-2 hover:bg-zinc-200"
          href="/app/generate"
        >
          Generate new
        </Link>
        <Link
          className="transition duration-200 flex w-full py-1 px-2 hover:bg-zinc-200"
          href="/app/edit"
        >
          Edit
        </Link>
      </aside>
      <section className="bg-blue-50 p-2 w-full">{children}</section>
    </main>
  );
}
