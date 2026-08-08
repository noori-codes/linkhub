import type { PublicShopCollection, PublicShopProduct } from "@/lib/types";

export type ShopSection = {
  key: string;
  title: string;
  description?: string;
  products: PublicShopProduct[];
};

export function buildShopSections(
  products: PublicShopProduct[],
  collections: PublicShopCollection[],
  username: string,
): ShopSection[] {
  if (products.length === 0) return [];

  const byId = new Map(products.map((product) => [product._id, product]));
  const claimed = new Set<string>();
  const sections: ShopSection[] = [];

  for (const collection of collections) {
    const items: PublicShopProduct[] = [];
    for (const productId of collection.products) {
      const product = byId.get(productId);
      if (!product || claimed.has(product._id)) continue;
      items.push(product);
      claimed.add(product._id);
    }

    if (items.length === 0) continue;

    sections.push({
      key: collection._id,
      title: collection.title,
      description: collection.description?.trim() || undefined,
      products: items,
    });
  }

  const rest = products.filter((product) => !claimed.has(product._id));

  if (rest.length === 0) {
    return sections;
  }

  if (sections.length === 0) {
    return [
      {
        key: "shop",
        title: "Shop",
        description: `Picks from @${username}`,
        products: rest,
      },
    ];
  }

  sections.push({
    key: "more",
    title: "More",
    products: rest,
  });

  return sections;
}
