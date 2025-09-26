import { IconShoppingCartUp } from '@tabler/icons-react';
import { Metadata } from 'next';

import ClientSlugHandler from '../ClientSlugHandler';
import { Container } from '@/components/container';
import { AmbientColor } from '@/components/decorations/ambient-color';
import { FeatureIconContainer } from '@/components/dynamic-zone/features/feature-icon-container';
import { Heading } from '@/components/elements/heading';
import { Subheading } from '@/components/elements/subheading';
import { Featured } from '@/components/products/featured';
import { ProductItems } from '@/components/products/product-items';
import fetchContentType from '@/lib/cms/fetchContentType';
import { fetchMedusaProducts } from '@/lib/medusa/products';
import { generateMetadataObject } from '@/lib/shared/metadata';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const pageData = await fetchContentType(
    'product-page',
    {
      filters: {
        locale: params.locale,
      },
    },
    true
  );

  const seo = pageData?.seo;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function Products(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  // Fetch the product-page and products data
  const productPage = await fetchContentType(
    'product-page',
    {
      filters: {
        locale: params.locale,
      },
    },
    true
  );
  const products = await fetchMedusaProducts();

  const localizedSlugs = productPage.localizations?.reduce(
    (acc: Record<string, string>, localization: any) => {
      acc[localization.locale] = 'products';
      return acc;
    },
    { [params.locale]: 'products' }
  );
  const featured = products.slice(0, 3);

  return (
    <div className="relative overflow-hidden w-full">
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <AmbientColor />
      <Container className="pt-40 pb-40">
        <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
          <IconShoppingCartUp className="h-6 w-6 text-white" />
        </FeatureIconContainer>
        <Heading as="h1" className="pt-4">
          {productPage.heading}
        </Heading>
        <Subheading className="max-w-3xl mx-auto">
          {productPage.sub_heading}
        </Subheading>
        <Featured products={featured} locale={params.locale} />
        <ProductItems products={products} locale={params.locale} />
      </Container>
    </div>
  );
}
