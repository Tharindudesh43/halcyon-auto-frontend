import type { MetadataRoute } from "next";
import { carHref, listCars } from "@/lib/cars";
import { listArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";
import type { CarListing } from "@/lib/types";

export const revalidate = 3600;

async function allAvailableCars(): Promise<CarListing[]> {
  try {
    const first = await listCars({ per_page: "100", page: "1" });
    const all = [...first.data];
    for (let page = 2; page <= first.last_page; page++) {
      all.push(...(await listCars({ per_page: "100", page: String(page) })).data);
    }
    return all.filter((c) => c.status !== "sold");
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cars, articles] = await Promise.all([allAvailableCars(), listArticles({ per_page: "24" })]);

  const pages = ["", "/cars", "/finance", "/articles", "/about", "/our-trust", "/faq", "/contact", "/careers"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/cars" ? ("daily" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/cars" ? 0.9 : 0.5,
  }));

  return [
    ...pages,
    ...cars.map((car) => ({
      url: `${SITE_URL}${carHref(car)}`,
      lastModified: car.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(articles?.data ?? []).map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
