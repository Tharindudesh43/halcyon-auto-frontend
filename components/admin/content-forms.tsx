"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, CircleAlert, CircleCheck, CirclePlus, LoaderCircle, Trash2 } from "lucide-react";
import {
  ImageField,
  FormSection,
  SaveBar,
  TextAreaField,
  TextField,
  ToggleField,
  controlCls,
  uploadImage,
  useSettingsSave,
} from "./form-ui";
import { directionsUrl, mapEmbedUrl, mapQuery } from "@/lib/location";
import { MediaField, useMedia } from "./media-field";
import {
  TRUST_ICON_OPTIONS,
  type AboutSettings,
  type ContactSettings,
  type FinanceSettings,
  type HeroSettings,
  type LocationSettings,
  type PopupSettings,
  type TrustPoint,
  type TrustSettings,
} from "@/lib/settings-types";
import { cn } from "@/lib/utils";

export function useImage(initial: string | null) {
  const [current, setCurrent] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);

  return {
    field: {
      current,
      file,
      removed,
      onPick: (f: File) => {
        setFile(f);
        setRemoved(false);
      },
      onRemove: () => {
        setFile(null);
        setRemoved(true);
      },
      onUndo: () => setRemoved(false),
    },
    async resolve() {
      let url = current;
      if (file) url = await uploadImage(file);
      else if (removed) url = null;
      setCurrent(url);
      setFile(null);
      setRemoved(false);
      return url;
    },
  };
}


export function HeroForm({ initial }: { initial: HeroSettings }) {
  const [title, setTitle] = useState(initial.title);
  const [accent, setAccent] = useState(initial.accent);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const desktop = useMedia(initial.media_desktop ?? (initial.image ? { type: "image", url: initial.image, focus: "center" } : null));
  const mobile = useMedia(initial.media_mobile);
  const { state, save } = useSettingsSave("hero");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => ({
          image: null,
          media_desktop: await desktop.resolve(),
          media_mobile: await mobile.resolve(),
          title,
          accent: accent || null,
          subtitle: subtitle || null,
        }));
      }}
    >
      <FormSection
        title="Hero for computers & tablets"
        subtitle="Shown on screens 768 px wide and up. Use an image, an animated GIF or a short video."
      >
        <MediaField
          label="Background"
          fallback="the default car photo"
          frame="aspect-video w-full"
          hint="Landscape 16:9, for example 1920 × 1080 px. Video: MP4 or WebM, 5-15 seconds, under 40 MB — it plays muted on a loop. Photos under 5 MB, GIFs under 10 MB (a video is much lighter than a GIF)."
          {...desktop.field}
        />
      </FormSection>

      <FormSection
        title="Hero for phones"
        subtitle="Shown on screens narrower than 768 px. Optional - if you leave it empty, the computer version is used."
      >
        <MediaField
          label="Background"
          fallback="the computer version"
          frame="aspect-[9/16] w-44"
          hint="Portrait 9:16, for example 1080 × 1920 px, so it fills a phone screen. The same file types and limits apply."
          {...mobile.field}
        />
      </FormSection>

      <FormSection title="Hero text">
        <TextField label="Headline" value={title} onChange={setTitle} required placeholder="Find the car you'll love." />
        <TextField label="Second line" value={accent} onChange={setAccent} placeholder="Drive it home with confidence." hint="Shown softer, under the headline." />
        <TextAreaField className="sm:col-span-2" label="Sub-heading" value={subtitle} onChange={setSubtitle} rows={3} />
      </FormSection>

      <SaveBar state={state} />
    </form>
  );
}


export function ContactSettingsForm({ initial }: { initial: ContactSettings }) {
  const [v, setV] = useState(initial);
  const set = (key: keyof ContactSettings) => (value: string) => setV((p) => ({ ...p, [key]: value }));
  const { state, save } = useSettingsSave("contact");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val?.toString().trim() || null])));
      }}
    >
      <FormSection title="Owner details" subtitle="Shown on the Contact page, in the footer, and behind the WhatsApp button. (The address lives in the Location tab.) Leave a field empty to hide it.">
        <TextField label="Owner name" value={v.owner_name} onChange={set("owner_name")} placeholder="e.g. Tharindu Deshan" />
        <TextField label="Phone" value={v.phone} onChange={set("phone")} placeholder="+94 77 123 4567" />
        <TextField label="WhatsApp number" value={v.whatsapp} onChange={set("whatsapp")} placeholder="94771234567" hint="Country code first, no + or spaces." />
        <TextField label="Email" type="email" value={v.email} onChange={set("email")} placeholder="you@example.com" />
        <TextField className="sm:col-span-2" label="Opening hours" value={v.hours} onChange={set("hours")} placeholder="Mon–Sat, 9am – 6pm" />
      </FormSection>

      <FormSection title="Social links" subtitle="Full links, starting with https://">
        <TextField label="Facebook" type="url" value={v.facebook} onChange={set("facebook")} placeholder="https://facebook.com/…" />
        <TextField label="Instagram" type="url" value={v.instagram} onChange={set("instagram")} placeholder="https://instagram.com/…" />
        <TextField label="TikTok" type="url" value={v.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@…" />
      </FormSection>

      <FormSection title="Contact page text">
        <TextField className="sm:col-span-2" label="Heading" value={v.heading} onChange={set("heading")} />
        <TextAreaField className="sm:col-span-2" label="Intro" value={v.intro} onChange={set("intro")} rows={3} />
      </FormSection>

      <SaveBar state={state} />
    </form>
  );
}


export function AboutForm({ initial }: { initial: AboutSettings }) {
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const image = useImage(initial.image);
  const { state, save } = useSettingsSave("about");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => ({
          eyebrow: eyebrow || null,
          title,
          body: body || null,
          image: await image.resolve(),
        }));
      }}
    >
      <FormSection title="About Us text">
        <TextField label="Small label above the title" value={eyebrow} onChange={setEyebrow} placeholder="Who We Are" />
        <TextField label="Title" value={title} onChange={setTitle} required />
        <TextAreaField
          className="sm:col-span-2"
          label="Story"
          value={body}
          onChange={setBody}
          rows={10}
          hint="Leave a blank line between paragraphs."
        />
      </FormSection>

      <FormSection title="Photo (optional)" subtitle="Shown under the title on the About page.">
        <ImageField label="About photo" aspect="aspect-[16/9]" {...image.field} />
      </FormSection>

      <SaveBar state={state} />
    </form>
  );
}


export function TrustForm({ initial }: { initial: TrustSettings }) {
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [points, setPoints] = useState<TrustPoint[]>(initial.points);
  const { state, save } = useSettingsSave("trust");

  const update = (i: number, patch: Partial<TrustPoint>) =>
    setPoints((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const move = (i: number, dir: -1 | 1) =>
    setPoints((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => ({ eyebrow: eyebrow || null, title, subtitle: subtitle || null, points }));
      }}
    >
      <FormSection title="Our Trust page">
        <TextField label="Small label above the title" value={eyebrow} onChange={setEyebrow} placeholder="Our Promise" />
        <TextField label="Title" value={title} onChange={setTitle} required />
        <TextAreaField className="sm:col-span-2" label="Intro" value={subtitle} onChange={setSubtitle} rows={3} />
      </FormSection>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Trust points</h2>
            <p className="text-sm text-slate-500">Up to 6 cards. They appear in this order.</p>
          </div>
          <button
            type="button"
            disabled={points.length >= 6}
            onClick={() => setPoints((l) => [...l, { icon: "star", title: "", desc: "" }])}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 transition-colors hover:bg-indigo-100 disabled:opacity-50"
          >
            <CirclePlus className="h-4 w-4" /> Add point
          </button>
        </div>

        <ul className="mt-5 space-y-4">
          {points.map((p, i) => (
            <li key={i} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Icon</span>
                  <select
                    value={p.icon}
                    onChange={(e) => update(i, { icon: e.target.value as TrustPoint["icon"] })}
                    className={cn(controlCls, "h-11")}
                  >
                    {TRUST_ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
                <TextField label="Title" value={p.title} onChange={(v) => update(i, { title: v })} required />
                <TextAreaField className="sm:col-span-2" label="Description" value={p.desc} onChange={(v) => update(i, { desc: v })} rows={2} />
              </div>
              <div className="mt-3 flex gap-2">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                <IconBtn label="Move down" disabled={i === points.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                <IconBtn
                  label="Remove point"
                  danger
                  disabled={points.length <= 1}
                  onClick={() => setPoints((l) => l.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <SaveBar state={state} />
    </form>
  );
}

function IconBtn({
  label,
  children,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-colors disabled:opacity-40",
        danger
          ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-100"
      )}
    >
      {children}
    </button>
  );
}


type LinkStatus = { kind: "idle" | "loading" | "ok" | "error"; text?: string };

export function LocationForm({ initial }: { initial: LocationSettings }) {
  const [v, setV] = useState(initial);
  const [preview, setPreview] = useState(initial);
  const [link, setLink] = useState<LinkStatus>(initial.map_query ? { kind: "ok", text: `Showing: ${initial.map_query}` } : { kind: "idle" });
  const lastResolved = useRef(initial.map_url ?? "");
  const set = (key: keyof LocationSettings) => (value: string) => setV((p) => ({ ...p, [key]: value }));
  const { state, save } = useSettingsSave("location");
  const query = mapQuery(preview);

  async function resolveLink(raw: string) {
    const url = raw.trim();
    if (!url || url === lastResolved.current) return;
    lastResolved.current = url;
    setLink({ kind: "loading" });

    try {
      const res = await fetch(`/api/admin/maps/resolve?url=${encodeURIComponent(url)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.query) {
        lastResolved.current = "";
        setLink({ kind: "error", text: data?.message ?? "Couldn't read that link." });
        return;
      }
      const patch = (p: LocationSettings): LocationSettings => ({
        ...p,
        map_url: url,
        map_query: data.query,
        directions_url: null,
        name: p.name || data.name || p.name,
      });
      setV(patch);
      setPreview(patch);
      setLink({ kind: "ok", text: data.lat !== null ? `Found location: ${data.query}` : `Found place: ${data.query}` });
    } catch {
      lastResolved.current = "";
      setLink({ kind: "error", text: "Can't reach the server. Check your connection." });
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val?.toString().trim() || null])));
      }}
    >
      <FormSection
        title="Showroom location"
        subtitle="Shown on the Contact page, the home page and in the footer, with a map and a Get directions button."
      >
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="map_url" className="text-sm font-medium text-slate-700">Google Maps link</label>
          <input
            id="map_url"
            type="url"
            value={v.map_url ?? ""}
            placeholder="Paste a link from Google Maps — the map updates automatically"
            onChange={(e) => set("map_url")(e.target.value)}
            onPaste={(e) => resolveLink(e.clipboardData.getData("text"))}
            onBlur={(e) => resolveLink(e.target.value)}
            className={cn(controlCls, "h-11")}
          />
          <div aria-live="polite" className="min-h-5 text-sm">
            {link.kind === "loading" && (
              <p className="inline-flex items-center gap-2 text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Reading link…
              </p>
            )}
            {link.kind === "ok" && (
              <p className="inline-flex items-center gap-2 font-medium text-emerald-600">
                <CircleCheck className="h-4 w-4" /> {link.text}
              </p>
            )}
            {link.kind === "error" && (
              <p role="alert" className="inline-flex items-center gap-2 font-medium text-rose-600">
                <CircleAlert className="h-4 w-4" /> {link.text}
              </p>
            )}
            {link.kind === "idle" && (
              <p className="text-slate-500">
                In Google Maps, open your place, tap Share, and copy the link. Short links (maps.app.goo.gl) work too.
              </p>
            )}
          </div>
        </div>

        <TextField label="Place name" value={v.name} onChange={set("name")} placeholder="Halcyon Auto" />
        <TextField label="Address" value={v.address} onChange={set("address")} placeholder="174 Kandy Road, Kadawatha" />
        <TextField
          className="sm:col-span-2"
          label="Map location (optional)"
          value={v.map_query}
          onChange={set("map_query")}
          placeholder="Filled in from the link above"
          hint="Set automatically from the link. You can also type an address or coordinates like 7.0016, 79.9507."
        />
      </FormSection>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Map preview</h2>
            <p className="text-sm text-slate-500">Updates when you paste a link. Check the pin before you save.</p>
          </div>
          <button
            type="button"
            onClick={() => setPreview(v)}
            className="inline-flex h-10 items-center rounded-xl bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 transition-colors hover:bg-indigo-100"
          >
            Update preview
          </button>
        </div>
        {query ? (
          <>
            <div className="mt-4 h-72 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              <iframe
                key={query}
                src={mapEmbedUrl(preview)}
                title="Map preview"
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
            <a
              href={directionsUrl(preview)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              Test the Get directions link
            </a>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Paste a Google Maps link above to see the map.</p>
        )}
      </section>

      <SaveBar state={state} />
    </form>
  );
}


export function PopupForm({ initial }: { initial: PopupSettings }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [link, setLink] = useState(initial.link);
  const [alt, setAlt] = useState(initial.alt);
  const [reshow, setReshow] = useState(false);
  const image = useImage(initial.image);
  const { state, save } = useSettingsSave("popup");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => {
          const url = await image.resolve();
          if (enabled && !url) throw new Error("Choose an image before turning the pop-up on.");
          // A new image (or the checkbox) bumps the version, so everyone sees it again.
          const changed = image.field.file !== null || url !== initial.image;
          return {
            enabled,
            image: url,
            link: link?.trim() || null,
            alt: alt?.trim() || null,
            version: reshow || changed ? Date.now().toString() : initial.version,
          };
        });
      }}
    >
      <FormSection
        title="Pop-up ad"
        subtitle="An image that opens over the site. Each visitor sees it again only 2 hours after the last time they saw it."
      >
        <ToggleField
          label={enabled ? "Pop-up is on" : "Pop-up is off"}
          description="Turn off to stop showing it without losing the image."
          checked={enabled}
          onChange={setEnabled}
        />
        <ImageField
          label="Ad image"
          hint="Portrait or square images look best (for example 800 × 1000 px). The whole image is shown, nothing is cropped."
          aspect="aspect-[4/3]"
          fit="contain"
          {...image.field}
        />
        <TextField
          className="sm:col-span-2"
          label="Link (optional)"
          type="url"
          value={link}
          onChange={setLink}
          placeholder="https://…"
          hint="If set, clicking the image opens this page in a new tab."
        />
        <TextField
          className="sm:col-span-2"
          label="Description for screen readers"
          value={alt}
          onChange={setAlt}
          placeholder="e.g. 10% off all hybrid cars this weekend"
        />
        <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={reshow}
            onChange={(e) => setReshow(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            Show it again to everyone who has already seen it
            <span className="block text-slate-500">Uploading a new image does this automatically.</span>
          </span>
        </label>
      </FormSection>

      <SaveBar state={state} />
    </form>
  );
}


export function FinanceForm({ initial }: { initial: FinanceSettings }) {
  const [v, setV] = useState({
    default_rate: String(initial.default_rate),
    rate_type: initial.rate_type,
    default_years: String(initial.default_years),
    max_years: String(initial.max_years),
    ltv_used: String(initial.ltv_used),
    ltv_new: String(initial.ltv_new),
    note: initial.note ?? "",
  });
  const set = (key: keyof typeof v) => (value: string) => setV((p) => ({ ...p, [key]: value }));
  const { state, save } = useSettingsSave("finance");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => {
          const max = Number(v.max_years);
          const def = Number(v.default_years);
          if (def > max) throw new Error("The starting duration can't be longer than the maximum duration.");
          return {
            default_rate: Number(v.default_rate),
            rate_type: v.rate_type,
            default_years: def,
            max_years: max,
            ltv_used: Number(v.ltv_used),
            ltv_new: Number(v.ltv_new),
            note: v.note.trim() || null,
          };
        });
      }}
    >
      <FormSection
        title="Calculator defaults"
        subtitle="What visitors see first on the Finance page and on each car page. They can change everything."
      >
        <TextField label="Interest rate (% a year)" type="number" value={v.default_rate} onChange={set("default_rate")} required hint="Use a typical rate from the lenders you work with." />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Rate type</span>
          <select value={v.rate_type} onChange={(e) => set("rate_type")(e.target.value)} className={cn(controlCls, "h-11")}>
            <option value="reducing">Reducing balance</option>
            <option value="flat">Flat rate</option>
          </select>
        </label>
        <TextField label="Starting duration (years)" type="number" value={v.default_years} onChange={set("default_years")} required />
        <TextField label="Longest duration offered (years)" type="number" value={v.max_years} onChange={set("max_years")} required hint="Most lenders go up to 7." />
      </FormSection>

      <FormSection
        title="Down payment rules"
        subtitle="The most a lender may finance, as a % of the car's price (loan-to-value). Update these if the Central Bank changes the rules."
      >
        <TextField label="Cars registered over 1 year (max loan %)" type="number" value={v.ltv_used} onChange={set("ltv_used")} required hint="60% since 25 May 2026 → buyer pays at least 40% down." />
        <TextField label="New or registered under 1 year (max loan %)" type="number" value={v.ltv_new} onChange={set("ltv_new")} required hint="40% since 25 May 2026 → buyer pays at least 60% down." />
        <TextAreaField
          className="sm:col-span-2"
          label="Note shown under the calculator (optional)"
          value={v.note}
          onChange={set("note")}
          rows={3}
          placeholder="e.g. We work with several banks and leasing companies — message us for a quote."
        />
      </FormSection>

      <SaveBar state={state} />
    </form>
  );
}
