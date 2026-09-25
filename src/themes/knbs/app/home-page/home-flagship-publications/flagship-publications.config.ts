/**
 * Configuration of the featured publications shown on the KNBS homepage.
 *
 * Which items appear is decided in the repository, not here: curators tag an item with
 * `local.featured` = 'Featured' on the item edit screen, and the homepage shows the most recently
 * issued of them. The backend exposes that metadata field through a plain DiscoverySearchFilter in
 * discovery.xml (indexFieldName "featured"), which is what makes it queryable as `f.featured`.
 */

/**
 * Discovery configuration the featured query runs against
 */
export const KNBS_FEATURED_CONFIGURATION = 'default';

/**
 * Query parameter of the search filter: 'f.' followed by the indexFieldName from discovery.xml
 */
export const KNBS_FEATURED_FILTER = 'f.featured';

/**
 * The value curators tag items with, together with the filter operator.
 *
 * The Solr field behind `equals` is a string field, so this match is case sensitive: an item tagged
 * 'featured' or 'FEATURED' will not show up.
 */
export const KNBS_FEATURED_VALUE = 'Featured,equals';

/**
 * Number of cards on the homepage. Once more than this many items are featured, the section shows
 * a link to the full, sortable list instead of silently dropping the rest.
 */
export const KNBS_FEATURED_CARDS = 4;

/**
 * Newest release first. The field is part of the default configuration's sort options, so the
 * search page offers it in its sort dropdown as well.
 */
export const KNBS_FEATURED_SORT_FIELD = 'dc.date.issued';

/**
 * Pagination id of the search page, which is also the prefix of its sort query parameters
 * ('spc.sf' for the field, 'spc.sd' for the direction).
 */
export const KNBS_SEARCH_PAGINATION_ID = 'spc';

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
