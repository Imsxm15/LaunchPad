import { draftMode } from 'next/headers';
import qs from 'qs';

/**
 * Fetches data for a specified content collection from the configured API.
 *
 * @param {string} contentType - The type of content to fetch from the API.
 * @param {Record<string, unknown>} params - Query parameters to append to the API request.
 * @return {Promise<object>} The fetched data.
 */

interface ContentData {
  id: number;
  [key: string]: any; // Allow for any additional fields
}

interface ContentResponse {
  data: ContentData | ContentData[];
}

export function spreadContentData(data: ContentResponse): ContentData | null {
  if (Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0];
  }
  if (!Array.isArray(data.data)) {
    return data.data;
  }
  return null;
}

export default async function fetchContentType(
  contentType: string,
  params: Record<string, unknown> = {},
  spreadData?: boolean
): Promise<any> {
  const { isEnabled: isDraftMode } = await draftMode();

  try {
    const queryParams = { ...params };

    if (isDraftMode) {
      queryParams.status = 'draft';
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = baseUrl
      ? new URL(`api/${contentType}`, baseUrl).href
      : `/api/${contentType}`;

    // Perform the fetch request with the provided query parameters
    const response = await fetch(`${endpoint}?${qs.stringify(queryParams)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch data from API (endpoint=${endpoint}, status=${response.status})`
      );
      // Return appropriate fallback based on expected data structure
      return spreadData ? null : { data: [] };
    }
    const jsonData: ContentResponse = await response.json();
    return spreadData ? spreadContentData(jsonData) : jsonData;
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('FetchContentTypeError', error);
    // Return appropriate fallback based on expected data structure
    return spreadData ? null : { data: [] };
  }
}
