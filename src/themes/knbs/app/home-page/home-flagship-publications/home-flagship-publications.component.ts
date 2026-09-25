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
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import {
  SortDirection,
  SortOptions,
} from '@dspace/core/cache/models/sort-options.model';
import { BitstreamDataService } from '@dspace/core/data/bitstream-data.service';
import { PaginatedList } from '@dspace/core/data/paginated-list.model';
import { RemoteData } from '@dspace/core/data/remote-data';
import { PaginationComponentOptions } from '@dspace/core/pagination/pagination-component-options.model';
import {
  getBitstreamDownloadRoute,
  getItemPageRoute,
} from '@dspace/core/router/utils/dso-route.utils';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { BitstreamFormat } from '@dspace/core/shared/bitstream-format.model';
import { DSpaceObjectType } from '@dspace/core/shared/dspace-object-type.model';
import { followLink } from '@dspace/core/shared/follow-link-config.model';
import { Item } from '@dspace/core/shared/item.model';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { PaginatedSearchOptions } from '@dspace/core/shared/search/models/paginated-search-options.model';
import { SearchFilter } from '@dspace/core/shared/search/models/search-filter.model';
import { SearchObjects } from '@dspace/core/shared/search/models/search-objects.model';
import { SearchResult } from '@dspace/core/shared/search/models/search-result.model';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest as observableCombineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import { SearchService } from '../../../../../app/shared/search/search.service';
import { FileSizePipe } from '../../../../../app/shared/utils/file-size-pipe';
import {
  FlagshipDownload,
  FlagshipPublicationView,
} from './flagship-publication.model';
import {
  KNBS_DOWNLOAD_BUNDLE,
  KNBS_DOWNLOAD_LABELS,
  KNBS_FEATURED_CARDS,
  KNBS_FEATURED_CONFIGURATION,
  KNBS_FEATURED_FILTER,
  KNBS_FEATURED_SORT_FIELD,
  KNBS_FEATURED_VALUE,
  KNBS_MAX_DOWNLOADS_PER_CARD,
  KNBS_SEARCH_PAGINATION_ID,
} from './flagship-publications.config';

/**
 * Longest string still plausible as a file extension. Guards against names such as
 * "Economic Survey v1.2 final", where everything after the last dot is not an extension at all.
 */
const MAX_EXTENSION_LENGTH = 8;

/**
 * The national releases promoted on the KNBS homepage.
 *
 * The cards are not curated in the frontend: Discovery is asked for the items carrying the
 * `local.featured` tag, newest issue date first, and the four most recent are rendered. Each card
 * shows the item's title, abstract and issue date, and one direct download button per bitstream in
 * the ORIGINAL bundle (PDF / XLSX / CSV / GeoJSON / ...). When more items are featured than fit on
 * the homepage, a link to the full, sortable list is shown below the grid.
 */
@Component({
  selector: 'ds-knbs-home-flagship-publications',
  templateUrl: './home-flagship-publications.component.html',
  styleUrls: ['./home-flagship-publications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FileSizePipe,
    RouterLink,
    TranslateModule,
  ],
})
export class HomeFlagshipPublicationsComponent implements OnInit {

  publications$: Observable<FlagshipPublicationView[]>;

  /**
   * Whether more items are featured than fit on the homepage, which is when the "view all" link
   * becomes worth showing.
   */
  showViewAll$: Observable<boolean>;

  /**
   * Query parameters of the "view all" link: the same filter and sort order as the homepage, in the
   * form the search page reads them. The sort is only the starting point there, the search page's
   * own sort dropdown stays fully usable.
   */
  readonly viewAllParams: Params = {
    [KNBS_FEATURED_FILTER]: KNBS_FEATURED_VALUE,
    [`${KNBS_SEARCH_PAGINATION_ID}.sf`]: KNBS_FEATURED_SORT_FIELD,
    [`${KNBS_SEARCH_PAGINATION_ID}.sd`]: SortDirection.DESC,
  };

  constructor(
    private searchService: SearchService,
    private bitstreamService: BitstreamDataService,
    private dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    const featured$: Observable<SearchObjects<Item>> = this.searchService.search<Item>(new PaginatedSearchOptions({
      configuration: KNBS_FEATURED_CONFIGURATION,
      dsoTypes: [DSpaceObjectType.ITEM],
      filters: [new SearchFilter(KNBS_FEATURED_FILTER, [KNBS_FEATURED_VALUE])],
      sort: new SortOptions(KNBS_FEATURED_SORT_FIELD, SortDirection.DESC),
      pagination: Object.assign(new PaginationComponentOptions(), {
        id: 'knbs-featured',
        pageSize: KNBS_FEATURED_CARDS,
        currentPage: 1,
      }),
    })).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<SearchObjects<Item>>) => rd.hasSucceeded ? rd.payload : null),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.publications$ = featured$.pipe(
      switchMap((results: SearchObjects<Item>) => this.toViews(
        (results?.page ?? []).map((result: SearchResult<Item>) => result.indexableObject))),
    );

    this.showViewAll$ = featured$.pipe(
      map((results: SearchObjects<Item>) => (results?.totalElements ?? 0) > KNBS_FEATURED_CARDS),
    );
  }

  private toViews(items: Item[]): Observable<FlagshipPublicationView[]> {
    if (items.length === 0) {
      return of([]);
    }
    return observableCombineLatest(items.map((item: Item) => this.withDownloads(item)));
  }

  private withDownloads(item: Item): Observable<FlagshipPublicationView> {
    return this.bitstreamService.findAllByItemAndBundleName(item, KNBS_DOWNLOAD_BUNDLE, {
      elementsPerPage: KNBS_MAX_DOWNLOADS_PER_CARD,
      currentPage: 1,
    }, true, true, followLink('format')).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => this.toDownloads(rd.hasSucceeded ? rd.payload.page : [])),
      map((downloads: FlagshipDownload[]) => this.toView(item, downloads)),
    );
  }

  private toDownloads(bitstreams: Bitstream[]): Observable<FlagshipDownload[]> {
    if (bitstreams.length === 0) {
      return of([]);
    }
    return observableCombineLatest(bitstreams.map((bitstream: Bitstream) => this.toDownload(bitstream)));
  }

  private toDownload(bitstream: Bitstream): Observable<FlagshipDownload> {
    const name = this.dsoNameService.getName(bitstream) ?? '';
    return this.formatOf(bitstream).pipe(
      map((format: BitstreamFormat) => {
        const extension = this.extensionOf(name, format);
        return {
          label: KNBS_DOWNLOAD_LABELS[extension] ?? (extension.length > 0 ? extension.toUpperCase() : 'FILE'),
          extension,
          name,
          sizeBytes: bitstream.sizeBytes,
          route: getBitstreamDownloadRoute(bitstream),
        };
      }),
    );
  }

  /**
   * The embedded bitstream format, or null when it could not be resolved
   */
  private formatOf(bitstream: Bitstream): Observable<BitstreamFormat> {
    if (!hasValue(bitstream.format)) {
      return of(null);
    }
    return bitstream.format.pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<BitstreamFormat>) => rd.hasSucceeded ? rd.payload : null),
    );
  }

  /**
   * Prefer the extension in the filename, and fall back to the registered bitstream format: plenty
   * of KNBS bitstreams are named "2025 Economic Survey - Popular Version" with no extension at all.
   */
  private extensionOf(name: string, format: BitstreamFormat): string {
    const fromName = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    if (fromName.length > 0 && fromName.length <= MAX_EXTENSION_LENGTH && !fromName.includes(' ')) {
      return fromName;
    }
    return format?.extensions?.[0]?.toLowerCase() ?? '';
  }

  private toView(item: Item, downloads: FlagshipDownload[]): FlagshipPublicationView {
    return {
      id: item.uuid,
      title: this.dsoNameService.getName(item),
      description: item.firstMetadataValue('dc.description.abstract') ?? '',
      date: item.firstMetadataValue('dc.date.issued') ?? '',
      handleUri: item.firstMetadataValue('dc.identifier.uri') ?? `https://hdl.handle.net/${item.handle}`,
      itemRoute: getItemPageRoute(item),
      downloads,
    };
  }

}
