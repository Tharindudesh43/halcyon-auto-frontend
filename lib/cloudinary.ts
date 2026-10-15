const CLD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

type Opts = { h?: number; fill?: boolean };

export function cld(url: string | null | undefined, width: number, opts: Opts = {}): string {
  if (!url) return "";
  const m = url.match(CLD);
  if (!m) return url;
  if (/^[a-z]{1,3}_[^/]+(,|\/)/.test(m[2]) && !/^v\d+\//.test(m[2])) return url;

  const t = ["f_auto", "q_auto", `w_${width}`];
  if (opts.h) t.push(`h_${opts.h}`);
  t.push(opts.fill || opts.h ? "c_fill" : "c_limit");
  return `${m[1]}${t.join(",")}/${m[2]}`;
}

export function cldSrcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url || !CLD.test(url)) return undefined;
  return widths.map((w) => `${cld(url, w)} ${w}w`).join(", ");
}
