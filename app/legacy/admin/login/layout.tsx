import Footer from "@/app/footer";
import { pageReads } from "@/server/composition";

export default async function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { title } = await pageReads().siteSettings();

  return (
    <>
      <header className="bg-bar text-bar-fg">
        <div className="max-w-6xl mx-auto px-3 lg:px-8 py-3 font-semibold">
          {title} Admin
        </div>
      </header>
      <main className="flex-1 flex flex-col px-3 lg:px-8 py-6 lg:pb-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
