/**
 * Configuration of the series shortcuts shown on the KNBS homepage.
 *
 * Each tile opens a search filtered on one publication series (dc.relation.ispartofseries), newest
 * reference year first. The backend exposes that field as the "series" facet in discovery.xml
 * (Step 9 of the discovery rollout), and dc.coverage.temporal as a sort option (Step 10).
 */

/**
 * Name of the Discovery facet behind the tiles, as returned by /api/discover/facets
 */
export const KNBS_SERIES_FACET = 'series';

/**
 * Discovery configuration the facet counts are read from
 */
export const KNBS_SERIES_CONFIGURATION = 'default';

/**
 * How many facet values to fetch in one request. Must stay above the number of entries in the
 * knbs_series value-pairs list in submission-forms.xml (32 today), or series near the end of the
 * list would be missing from the counts.
 */
export const KNBS_SERIES_FACET_PAGE_SIZE = 100;

/**
 * Sort applied when a tile opens the search page: reference year, newest first.
 */
export const KNBS_SERIES_SORT_FIELD = 'dc.coverage.temporal';

/**
 * A tile on the homepage.
 */
export interface SeriesShortcut {
  /**
   * The stored value in dc.relation.ispartofseries. Must match an entry of knbs_series in
   * submission-forms.xml exactly: the facet filter uses the "equals" operator, which is case sensitive.
   */
  series: string;
  /**
   * i18n key of the short name printed on the tile
   */
  labelKey: string;
  /**
   * i18n key of the release frequency printed under the name
   */
  frequencyKey: string;
  /**
   * Font Awesome icon class
   */
  icon: string;
}

/**
 * The regular series offered as shortcuts, in display order. Tiles whose series has no items yet
 * are not rendered, so series can be listed here before their items are catalogued.
 */
export const KNBS_SERIES_SHORTCUTS: SeriesShortcut[] = [
  {
    series: 'Kenya Consumer Price Indices and Inflation Rates',
    labelKey: 'knbs.series.cpi',
    frequencyKey: 'knbs.series.frequency.monthly',
    icon: 'fa-cart-shopping',
  },
  {
    series: 'Leading Economic Indicators',
    labelKey: 'knbs.series.lei',
    frequencyKey: 'knbs.series.frequency.monthly',
    icon: 'fa-chart-line',
  },
  {
    series: 'Quarterly Gross Domestic Product',
    labelKey: 'knbs.series.qgdp',
    frequencyKey: 'knbs.series.frequency.quarterly',
    icon: 'fa-sack-dollar',
  },
  {
    series: 'Quarterly Balance of Payments and International Trade',
    labelKey: 'knbs.series.qbop',
    frequencyKey: 'knbs.series.frequency.quarterly',
    icon: 'fa-scale-balanced',
  },
  {
    series: 'Producer Price Indices',
    labelKey: 'knbs.series.ppi',
    frequencyKey: 'knbs.series.frequency.quarterly',
    icon: 'fa-industry',
  },
  {
    series: 'Quarterly Labour Force Report',
    labelKey: 'knbs.series.qlfs',
    frequencyKey: 'knbs.series.frequency.quarterly',
    icon: 'fa-briefcase',
  },
  {
    series: 'Economic Survey',
    labelKey: 'knbs.series.economic-survey',
    frequencyKey: 'knbs.series.frequency.annual',
    icon: 'fa-book',
  },
  {
    series: 'Statistical Abstract',
    labelKey: 'knbs.series.statistical-abstract',
    frequencyKey: 'knbs.series.frequency.annual',
    icon: 'fa-table',
  },
  {
    series: 'County Statistical Abstract',
    labelKey: 'knbs.series.county-abstract',
    frequencyKey: 'knbs.series.frequency.annual',
    icon: 'fa-map-location-dot',
  },
  {
    series: 'Kenya Demographic and Health Survey (KDHS)',
    labelKey: 'knbs.series.kdhs',
    frequencyKey: 'knbs.series.frequency.periodic',
    icon: 'fa-heart-pulse',
  },
  {
    series: 'Kenya Population and Housing Census (KPHC)',
    labelKey: 'knbs.series.kphc',
    frequencyKey: 'knbs.series.frequency.decennial',
    icon: 'fa-people-group',
  },
  {
    series: 'Facts and Figures',
    labelKey: 'knbs.series.facts-figures',
    frequencyKey: 'knbs.series.frequency.annual',
    icon: 'fa-chart-pie',
  },
];
