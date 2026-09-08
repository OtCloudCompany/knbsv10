import { FlagshipPublicationConfig } from './flagship-publications.config';

/**
 * A single direct download button on a flagship publication card
 */
export interface FlagshipDownload {
  /**
   * Short format label, e.g. 'PDF', 'XLSX', 'CSV', 'GeoJSON'
   */
  label: string;

  /**
   * Lowercased file extension, used to colour the button
   */
  extension: string;

  /**
   * The bitstream filename, used as the accessible name of the button
   */
  name: string;

  sizeBytes: number;

  /**
   * Route to the bitstream content endpoint (/bitstreams/<uuid>/download)
   */
  route: string;
}

/**
 * Everything a flagship publication card renders
 */
export interface FlagshipPublicationView {
  config: FlagshipPublicationConfig;

  /**
   * False when the configured handle is empty or could not be resolved; the card then falls back
   * to the curated title/description and links into a Discovery search.
   */
  resolved: boolean;

  title: string;
  description: string;
  date: string;

  /**
   * The permanent handle URI, e.g. https://hdl.handle.net/20.500.14351/1234
   */
  handleUri: string;

  /**
   * Route to the item page, only set when the item resolved
   */
  itemRoute: string;

  downloads: FlagshipDownload[];
}
