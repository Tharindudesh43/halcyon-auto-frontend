import Footer from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { CookieBanner } from "@/components/site/cookie-banner";
import { AdPopup } from "@/components/site/ad-popup";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { contact, popup } = await getSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar phone={contact.phone} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
      {popup.enabled && popup.image && (
        <AdPopup image={popup.image} link={popup.link} alt={popup.alt} version={popup.version} />
      )}
    </>
  );
}
