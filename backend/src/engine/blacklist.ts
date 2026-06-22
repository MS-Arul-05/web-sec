import axios from 'axios';
import { env } from '../config/env';
import type { BlacklistInfo } from './types';

/**
 * Checks the URL against Google Safe Browsing when an API key is configured.
 * Without a key, returns { checked:false } so risk scoring can skip it gracefully.
 */
export async function checkBlacklist(url: string): Promise<BlacklistInfo> {
  if (!env.googleSafeBrowsingKey) {
    return { checked: false, listed: false, sources: [] };
  }

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.googleSafeBrowsingKey}`;
    const { data } = await axios.post(
      endpoint,
      {
        client: { clientId: 'secure-web', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      },
      { timeout: 6000 },
    );

    const matches = data?.matches ?? [];
    return {
      checked: true,
      listed: matches.length > 0,
      sources: matches.map((m: { threatType: string }) => m.threatType),
    };
  } catch {
    return { checked: false, listed: false, sources: [] };
  }
}
