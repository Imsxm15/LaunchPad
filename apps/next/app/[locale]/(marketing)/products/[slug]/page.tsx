import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Container } from '@/components/container';
import { AmbientColor } from '@/components/decorations/ambient-color';
import DynamicZoneManager from '@/components/dynamic-zone/manager';
import { SingleProduct } from '@/components/products/single-product';
import { fetchMedusaProductByHandle } from '@/lib/medusa/products';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const product = await fetchMedusaProductByHandle(params.slug);

  if (!product) {
    return {};
  }

  const firstImage = product.images?.[0]?.url;

  const metadata: Metadata = {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
  };

  return metadata;
}

export default async function SingleProductPage(props: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const params = await props.params;

  const product = await fetchMedusaProductByHandle(params.slug);

  if (!product) {
    redirect(`/${params.locale}/products`);
  }

  return (
    <div className="relative overflow-hidden w-full">
      <AmbientColor />
      <Container className="py-20 md:py-40">
        <SingleProduct product={product} />
        {!!product?.dynamic_zone?.length && (
          <DynamicZoneManager
            dynamicZone={product?.dynamic_zone}
            locale={params.locale}
          />
        )}
      </Container>
    </div>
  );
}
