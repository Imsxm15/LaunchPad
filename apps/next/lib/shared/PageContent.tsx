import { AmbientColor } from '@/components/decorations/ambient-color';
import DynamicZoneManager from '@/components/dynamic-zone/manager';

type PageContentProps = {
  pageData: any | null | undefined;
};

export default function PageContent({ pageData }: PageContentProps) {
  const dynamicZone = Array.isArray(pageData?.dynamic_zone)
    ? pageData.dynamic_zone
    : [];
  const locale = typeof pageData?.locale === 'string' ? pageData.locale : 'en';

  return (
    <div className="relative overflow-hidden w-full">
      <AmbientColor />
      {dynamicZone.length ? (
        <DynamicZoneManager dynamicZone={dynamicZone} locale={locale} />
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-neutral-400">
          <p>The content for this page is not available yet.</p>
        </div>
      )}
    </div>
  );
}
