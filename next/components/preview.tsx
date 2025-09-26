'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const Preview = () => {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = async (message: MessageEvent<any>) => {
      const { origin, data } = message;

      if (origin !== process.env.NEXT_PUBLIC_API_URL) {
        return;
      }

      if (data.type === 'cmsUpdate') {
        router.refresh();
      } else if (data.type === 'cmsScript') {
        const script = window.document.createElement('script');
        script.textContent = data.payload.script;
        window.document.head.appendChild(script);
      }
    };

    // Add the event listener
    window.addEventListener('message', handleMessage);

    // Notify the parent frame that the preview is ready to receive updates
    window.parent?.postMessage({ type: 'cmsPreviewReady' }, '*');

    // Remove the event listener on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  return null;
};
