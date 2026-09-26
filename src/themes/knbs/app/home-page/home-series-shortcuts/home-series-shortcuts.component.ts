import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import {
  Params,
  RouterLink,
} from '@angular/router';
import { SortDirection } from '@dspace/core/cache/models/sort-options.model';
import { RemoteData } from '@dspace/core/data/remote-data';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { FacetValue } from '@dspace/core/shared/search/models/facet-value.model';
import { FacetValues } from '@dspace/core/shared/search/models/facet-values.model';
import { SearchFilterConfig } from '@dspace/core/shared/search/models/search-filter-config.model';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import { SearchService } from '../../../../../app/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../app/shared/search/search-configuration.service';
import { KNBS_SEARCH_PAGINATION_ID } from '../home-flagship-publications/flagship-publications.config';
import {
  KNBS_SERIES_CONFIGURATION,
  KNBS_SERIES_FACET,
  KNBS_SERIES_FACET_PAGE_SIZE,
  KNBS_SERIES_SHORTCUTS,
  KNBS_SERIES_SORT_FIELD,
  SeriesShortcut,
} from './series-shortcuts.config';

/**
 * A configured shortcut together with its live item count and search link.
 */
export interface SeriesShortcutView extends SeriesShortcut {
  count: number;
  /**
   * i18n key of the count text: singular for one item, plural otherwise
   */
  countKey: string;
  queryParams: Params;
}

/**
 * Shortcuts into the regular KNBS publication series (CPI, Leading Economic Indicators, Quarterly
 * GDP, Economic Survey, ...).
 *
 * The counts come from a single request for the "series" facet, so the homepage costs one call
 * however many tiles there are. Tiles whose series has no items are left out, and the whole section
 * stays hidden until at least one configured series has items. That lets it ship before the
 * catalogue clean-up has given every item its series, and fill in as that work progresses.
 */
@Component({
  selector: 'ds-knbs-home-series-shortcuts',
  templateUrl: './home-series-shortcuts.component.html',
  styleUrls: ['./home-series-shortcuts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
  ],
})
export class HomeSeriesShortcutsComponent implements OnInit {

  shortcuts$: Observable<SeriesShortcutView[]>;

  constructor(
    private searchConfigurationService: SearchConfigurationService,
    private searchService: SearchService,
  ) {
  }

  ngOnInit(): void {
    this.shortcuts$ = this.seriesCounts().pipe(
      map((counts: Map<string, number>) => KNBS_SERIES_SHORTCUTS
        .map((shortcut: SeriesShortcut) => this.toView(shortcut, counts.get(shortcut.series) ?? 0))
        .filter((view: SeriesShortcutView) => view.count > 0)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  /**
   * Item count per series, keyed by the stored series value. Empty when the facet is not configured
   * on the backend or the request fails, which hides the section rather than breaking the homepage.
   */
  private seriesCounts(): Observable<Map<string, number>> {
    return this.searchConfigurationService.getConfig(undefined, KNBS_SERIES_CONFIGURATION).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<SearchFilterConfig[]>) => rd.hasSucceeded
        ? rd.payload.find((config: SearchFilterConfig) => config.name === KNBS_SERIES_FACET)
        : undefined),
      switchMap((config: SearchFilterConfig) => {
        if (!hasValue(config)) {
          return of(new Map<string, number>());
        }
        // A copy, so the page size used by the search sidebar for this facet stays untouched
        const allValues = Object.assign(new SearchFilterConfig(), config, { pageSize: KNBS_SERIES_FACET_PAGE_SIZE });
        return this.searchService.getFacetValuesFor(allValues, 1).pipe(
          getFirstCompletedRemoteData(),
          map((rd: RemoteData<FacetValues>) => new Map<string, number>(
            (rd.hasSucceeded ? rd.payload.page : []).map((value: FacetValue) => [value.label, value.count]))),
        );
      }),
    );
  }

  private toView(shortcut: SeriesShortcut, count: number): SeriesShortcutView {
    return {
      ...shortcut,
      count,
      countKey: count === 1 ? 'knbs.series.tile.count.one' : 'knbs.series.tile.count.other',
      queryParams: {
        [`f.${KNBS_SERIES_FACET}`]: `${shortcut.series},equals`,
        [`${KNBS_SEARCH_PAGINATION_ID}.sf`]: KNBS_SERIES_SORT_FIELD,
        [`${KNBS_SEARCH_PAGINATION_ID}.sd`]: SortDirection.DESC,
      },
    };
  }

}
