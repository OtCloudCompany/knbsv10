/**
 * A flagship national release promoted on the KNBS homepage.
 *
 * The four cards are curated rather than discovered, so that the homepage keeps showing the same
 * four national releases regardless of what was submitted last. Everything that is shown on a card
 * (title, description, issue date, handle URI, downloads) is read from the live item once the
 * handle resolves; the fallback* values are only used until the handle is filled in, or when the
 * item is not (yet) available.
 */
export interface FlagshipPublicationConfig {
  /**
   * Stable key, used for translations and *ngFor tracking
   */
  key: string;

  /**
   * The persistent handle of the item, e.g. 'knbs-ke-repo/371'.
   * Leave empty to render the curated fallback copy and a Discovery search link instead.
   */
  handle: string;

  /**
   * Shown while the handle is empty or cannot be resolved
   */
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackDate: string;

  /**
   * Discovery query used by the card's fallback link when the handle cannot be resolved
   */
  searchQuery: string;
}

/**
 * The four national releases promoted on the homepage.
 *
 * NOTE FOR CURATORS: `handle` points at a specific item, so recurring releases have to be
 * repointed when a new edition is published (monthly for the Leading Economic Indicators, annually
 * for the Economic Survey and the Statistical Abstract). Clearing a handle is always safe: the card
 * then falls back to the curated copy below and links into a Discovery search.
 */
export const KNBS_FLAGSHIP_PUBLICATIONS: FlagshipPublicationConfig[] = [
  {
    key: 'economic-survey',
    handle: 'knbs-ke-repo/371',
    fallbackTitle: 'Economic Survey',
    fallbackDescription: 'The annual review of Kenya\'s economic performance, with national accounts, ' +
      'production, employment, prices and public finance statistics.',
    fallbackDate: 'Annual',
    searchQuery: 'Economic Survey',
  },
  {
    key: 'kphc-2019',
    handle: 'knbs-ke-repo/454',
    fallbackTitle: '2019 Kenya Population and Housing Census',
    fallbackDescription: 'Volume reports of the 2019 census: population distribution, household ' +
      'characteristics, and socio-economic indicators down to sub-county level.',
    fallbackDate: '2019',
    searchQuery: 'Kenya Population and Housing Census',
  },
  {
    key: 'statistical-abstract',
    handle: 'knbs-ke-repo/372',
    fallbackTitle: 'Statistical Abstract',
    fallbackDescription: 'A consolidated annual compendium of official statistics across every ' +
      'sector of the Kenyan economy.',
    fallbackDate: 'Annual',
    searchQuery: 'Statistical Abstract',
  },
  {
    key: 'leading-economic-indicators',
    // Monthly release: repoint this at the newest indicator each month
    handle: 'knbs-ke-repo/429',
    fallbackTitle: 'Leading Economic Indicators',
    fallbackDescription: 'Monthly short-term indicators tracking the direction of the economy: ' +
      'trade, transport, energy, tourism and monetary aggregates.',
    fallbackDate: 'Monthly',
    searchQuery: 'Leading Economic Indicators',
  },
];

/**
 * Bundle that direct download buttons are read from
 */
export const KNBS_DOWNLOAD_BUNDLE = 'ORIGINAL';

/**
 * Maximum number of download buttons rendered per card
 */
export const KNBS_MAX_DOWNLOADS_PER_CARD = 6;

/**
 * Human readable labels for the file types KNBS publishes. Anything not in this map falls back to
 * the uppercased file extension.
 */
export const KNBS_DOWNLOAD_LABELS: { [extension: string]: string } = {
  pdf: 'PDF',
  xlsx: 'XLSX',
  xls: 'XLS',
  csv: 'CSV',
  geojson: 'GeoJSON',
  json: 'JSON',
  zip: 'ZIP',
  docx: 'DOCX',
  doc: 'DOC',
  txt: 'TXT',
};
