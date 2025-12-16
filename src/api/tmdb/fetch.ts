import { tmdbClient } from './client';

export const fetchFromTMDB = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> => {
  const res = await tmdbClient.get(endpoint, { params });
  return res.data;
};
