import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CookieSettingsButton } from "@/components/site/cookie-banner";

export const metadata: Metadata = {
  title: "Privacy & cookies",
  description: "How Halcyon Auto handles your information and cookies.",
};

const UPDATED = "15 October 2026";

export default async function PrivacyPage() {
  const { contact, location } = await getSettings();

  const h2 = "mt-10 font-heading text-2xl font-bold text-ink";
  const p = "mt-3 leading-relaxed text-muted-foreground";

  return (
    <div className="container-page page-top pb-8">
      <div className="max-w-3xl">
        <header className="animate-rise">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">Privacy &amp; cookies</h1>
          <p className="mt-4 text-muted-foreground">Last updated {UPDATED}</p>
        </header>

        <section className="animate-rise rise-1">
          <h2 className={h2}>Who we are</h2>
          <p className={p}>
            Halcyon Auto is a car marketplace{location.address ? ` based in ${location.address}` : ""}. This page explains what
            information we collect on this website and how we use it.
            {contact.email && (
              <> Questions? Email <a className="font-semibold text-primary hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>.</>
            )}
          </p>

          <h2 className={h2}>Information you give us</h2>
          <p className={p}>
            If you use the contact form we receive your name, email address and message, and we use them only to reply to you.
            If you contact us by phone, email or WhatsApp, that conversation also happens on those services and is subject to
            their own privacy policies.
          </p>

          <h2 className={h2}>Cookies and similar storage</h2>
          <p className={p}>We keep this to a minimum. Here is everything the website stores in your browser:</p>
          <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-border">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-muted text-ink">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Lasts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card text-muted-foreground">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ink">cookie_consent</td>
                  <td className="px-4 py-3">Remembers your cookie choice</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ink">halcyon_ad_seen</td>
                  <td className="px-4 py-3">Stops the promotion pop-up from appearing more than once every 2 hours</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">Until cleared</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ink">halcyon_token</td>
                  <td className="px-4 py-3">Keeps staff signed in to the admin area (not set for visitors)</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">30 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ink">Google Maps</td>
                  <td className="px-4 py-3">Shows our location map. Google may set its own cookies.</td>
                  <td className="px-4 py-3">Third party only if you accept</td>
                  <td className="px-4 py-3">Set by Google</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={p}>
            We don&apos;t use advertising or analytics cookies. The map only loads after you accept cookies or choose to load it.
            Pictures are served by Cloudinary and fonts by Google Fonts, which may receive your IP address when your browser
            fetches them.
          </p>

          <h2 className={h2}>Your choices</h2>
          <p className={p}>
            You can accept all cookies or keep to essential only using the banner. Changed your mind?{" "}
            <CookieSettingsButton className="font-semibold text-primary underline-offset-4 hover:underline" />. You can also
            clear cookies and site data at any time in your browser settings.
          </p>

          <h2 className={h2}>Changes to this page</h2>
          <p className={p}>If we change how we use cookies or information, we&apos;ll update this page and the date above.</p>
        </section>
      </div>
    </div>
  );
}
