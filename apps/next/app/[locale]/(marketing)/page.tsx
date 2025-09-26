import { Metadata } from 'next';

import ClientSlugHandler from './ClientSlugHandler';
import fetchContentType from '@/lib/cms/fetchContentType';
import PageContent from '@/lib/shared/PageContent';
import { generateMetadataObject } from '@/lib/shared/metadata';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const pageData = await fetchContentType(
    'pages',
    {
      filters: {
        slug: 'homepage',
        locale: params.locale,
      },
      populate: 'seo.metaImage',
    },
    true
  );

  const seo = pageData?.seo;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const pageData = await fetchContentType(
    'pages',
    {
      filters: {
        slug: 'homepage',
        locale: params.locale,
      },
    },
    true
  );

  const localizedSlugs = (pageData?.localizations ?? []).reduce(
    (acc: Record<string, string>, localization: any) => {
      if (localization?.locale) {
        acc[localization.locale] = '';
      }
      return acc;
    },
    { [params.locale]: '' } as Record<string, string>
  );

  return (
    <>
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <PageContent pageData={pageData} />
    </>
  );
}
