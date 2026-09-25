/**
 * A single direct download button on a featured publication card
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
 * Everything a featured publication card renders
 */
export interface FlagshipPublicationView {
  /**
   * The item's UUID, used for *ngFor tracking
   */
  id: string;

  title: string;
  description: string;
  date: string;

  /**
   * The permanent handle URI, e.g. https://hdl.handle.net/knbs-ke-repo/371
   */
  handleUri: string;

  /**
   * Route to the item page
   */
  itemRoute: string;

  downloads: FlagshipDownload[];
}
