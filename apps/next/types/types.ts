export interface Category {
  name: string;
}

export interface Image {
  url: string;
  alternativeText: string;
}

export interface Article {
  title: string;
  description: string;
  slug: string;
  content: string;
  dynamic_zone: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  image: Image;
  categories: Category[];
}

export interface ProductPlan {
  id?: string;
  name: string;
}

export interface ProductPerk {
  text: string;
}

export interface ProductImage {
  url: string;
  alternativeText?: string | null;
}

export interface ProductCategory {
  id?: string;
  name: string;
}

export interface ProductCollection {
  id?: string;
  title: string;
  handle?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency_code?: string;
  plans: ProductPlan[];
  perks: ProductPerk[];
  featured?: boolean;
  images: ProductImage[];
  categories?: ProductCategory[];
  collections?: ProductCollection[];
  dynamic_zone?: any[];
}
