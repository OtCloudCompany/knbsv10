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
import { RemoteData } from '@dspace/core/data/remote-data';
import { PaginationComponentOptions } from '@dspace/core/pagination/pagination-component-options.model';
import { getItemPageRoute } from '@dspace/core/router/utils/dso-route.utils';
import { DSpaceObjectType } from '@dspace/core/shared/dspace-object-type.model';
import { Item } from '@dspace/core/shared/item.model';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { PaginatedSearchOptions } from '@dspace/core/shared/search/models/paginated-search-options.model';
import { SearchFilter } from '@dspace/core/shared/search/models/search-filter.model';
import { SearchObjects } from '@dspace/core/shared/search/models/search-objects.model';
import { SearchResult } from '@dspace/core/shared/search/models/search-result.model';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchService } from '../../../../../app/shared/search/search.service';
import { KNBS_SEARCH_PAGINATION_ID } from '../home-flagship-publications/flagship-publications.config';

/**
 * Discovery facet and value that mark a statistical release (dc.type, Steps 4 and 9 of the
 * discovery rollout). The "equals" match is case sensitive.
 */
const KNBS_RELEASE_FILTER = 'f.itemtype';
const KNBS_RELEASE_TYPE = 'Statistical Release';

/**
 * Newest release first. Issue date rather than accession date: many releases were backfilled from
 * the website, so the order they were added in says nothing about how recent they are.
 */
const KNBS_RELEASE_SORT_FIELD = 'dc.date.issued';

/**
 * Number of releases listed on the homepage
 */
const KNBS_LATEST_RELEASES = 6;

/**
 * One row of the list.
 */
export interface LatestReleaseView {
  id: string;
  title: string;
  series: string;
  date: string;
  itemRoute: string;
}

/**
 * The most recently issued statistical releases (CPI, Leading Economic Indicators, quarterly GDP,
 * ...), newest first.
 *
 * Unlike the stock "recent submissions" list, which orders by when an item was added to the
 * repository, this orders by issue date and only lists items typed as a Statistical Release. The
 * section stays hidden when no item carries that type.
 */
@Component({
  selector: 'ds-knbs-home-latest-releases',
  templateUrl: './home-latest-releases.component.html',
  styleUrls: ['./home-latest-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
  ],
})
export class HomeLatestReleasesComponent implements OnInit {

  releases$: Observable<LatestReleaseView[]>;

  /**
   * Query parameters of the "view all" link: the same filter and sort as the list, in the form the
   * search page reads them.
   */
  readonly viewAllParams: Params = {
    [KNBS_RELEASE_FILTER]: `${KNBS_RELEASE_TYPE},equals`,
    [`${KNBS_SEARCH_PAGINATION_ID}.sf`]: KNBS_RELEASE_SORT_FIELD,
    [`${KNBS_SEARCH_PAGINATION_ID}.sd`]: SortDirection.DESC,
  };

  constructor(
    private searchService: SearchService,
    private dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    this.releases$ = this.searchService.search<Item>(new PaginatedSearchOptions({
      configuration: 'default',
      dsoTypes: [DSpaceObjectType.ITEM],
      filters: [new SearchFilter(KNBS_RELEASE_FILTER, [`${KNBS_RELEASE_TYPE},equals`])],
      sort: new SortOptions(KNBS_RELEASE_SORT_FIELD, SortDirection.DESC),
      pagination: Object.assign(new PaginationComponentOptions(), {
        id: 'knbs-latest-releases',
        pageSize: KNBS_LATEST_RELEASES,
        currentPage: 1,
      }),
    })).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<SearchObjects<Item>>) => (rd.hasSucceeded ? rd.payload.page : [])
        .map((result: SearchResult<Item>) => this.toView(result.indexableObject))),
    );
  }

  private toView(item: Item): LatestReleaseView {
    return {
      id: item.uuid,
      title: this.dsoNameService.getName(item),
      series: item.firstMetadataValue('dc.relation.ispartofseries') ?? '',
      date: item.firstMetadataValue('dc.date.issued') ?? '',
      itemRoute: getItemPageRoute(item),
    };
  }

}
