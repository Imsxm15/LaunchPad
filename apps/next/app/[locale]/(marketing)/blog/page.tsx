import { IconClipboardText } from '@tabler/icons-react';
import { type Metadata } from 'next';

import ClientSlugHandler from '../ClientSlugHandler';
import { BlogCard } from '@/components/blog-card';
import { BlogPostRows } from '@/components/blog-post-rows';
import { Container } from '@/components/container';
import { AmbientColor } from '@/components/decorations/ambient-color';
import { FeatureIconContainer } from '@/components/dynamic-zone/features/feature-icon-container';
import { Heading } from '@/components/elements/heading';
import { Subheading } from '@/components/elements/subheading';
import fetchContentType from '@/lib/cms/fetchContentType';
import { generateMetadataObject } from '@/lib/shared/metadata';
import { Article } from '@/types/types';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const pageData = await fetchContentType(
    'blog-page',
    {
      filters: { locale: params.locale },
      populate: 'seo.metaImage',
    },
    true
  );

  const seo = pageData?.seo;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function Blog(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const blogPage = await fetchContentType(
    'blog-page',
    {
      filters: { locale: params.locale },
    },
    true
  );
  const articles = await fetchContentType(
    'articles',
    {
      filters: { locale: params.locale },
    },
    false
  );

  const localizedSlugs = (blogPage?.localizations ?? []).reduce(
    (acc: Record<string, string>, localization: any) => {
      if (localization?.locale) {
        acc[localization.locale] = 'blog';
      }
      return acc;
    },
    { [params.locale]: 'blog' } as Record<string, string>
  );
  const heading = blogPage?.heading ?? 'Blog';
  const subheading =
    blogPage?.sub_heading ?? 'Stay up to date with the latest stories.';
  const articlesData = Array.isArray(articles?.data) ? articles.data : [];

  return (
    <div className="relative overflow-hidden py-20 md:py-0">
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <AmbientColor />
      <Container className="flex flex-col items-center justify-between pb-20">
        <div className="relative z-20 py-10 md:pt-40">
          <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
            <IconClipboardText className="h-6 w-6 text-white" />
          </FeatureIconContainer>
          <Heading as="h1" className="mt-4">
            {heading}
          </Heading>
          <Subheading className="max-w-3xl mx-auto">
            {subheading}
          </Subheading>
        </div>

        {articlesData.slice(0, 1).map((article: Article) => (
          <BlogCard
            article={article}
            locale={params.locale}
            key={article.title}
          />
        ))}

        <BlogPostRows articles={articlesData} locale={params.locale} />
      </Container>
    </div>
  );
}
