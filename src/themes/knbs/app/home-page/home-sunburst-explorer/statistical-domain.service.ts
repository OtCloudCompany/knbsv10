import { Injectable } from '@angular/core';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import {
  SortDirection,
  SortOptions,
} from '@dspace/core/cache/models/sort-options.model';
import { CollectionDataService } from '@dspace/core/data/collection-data.service';
import { CommunityDataService } from '@dspace/core/data/community-data.service';
import { FindListOptions } from '@dspace/core/data/find-list-options.model';
import { PaginatedList } from '@dspace/core/data/paginated-list.model';
import { RemoteData } from '@dspace/core/data/remote-data';
import { PaginationComponentOptions } from '@dspace/core/pagination/pagination-component-options.model';
import {
  getCollectionPageRoute,
  getCommunityPageRoute,
} from '@dspace/core/router/utils/dso-route.utils';
import { Collection } from '@dspace/core/shared/collection.model';
import { Community } from '@dspace/core/shared/community.model';
import { DSpaceObjectType } from '@dspace/core/shared/dspace-object-type.model';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { PaginatedSearchOptions } from '@dspace/core/shared/search/models/paginated-search-options.model';
import { isEmpty } from '@dspace/shared/utils/empty.util';
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
import { DomainNode } from './statistical-domain.model';

/**
 * The sunburst has three rings, so the tree never needs to be deeper than three levels
 */
export const MAX_DOMAIN_DEPTH = 3;

/**
 * Upper bound on the number of children fetched per node. The explorer is a homepage teaser, not a
 * full browse page: capping the fan-out keeps the number of REST calls (and sunburst arcs) sane.
 */
export const MAX_CHILDREN_PER_NODE = 20;

/**
 * Builds the community/collection tree that backs the KNBS Statistical Domain Explorer.
 *
 * Item counts come straight from the REST API: both CommunityRest and CollectionRest expose
 * "archivedItemsCount", so no extra request (and no backend change) is needed to show the badges.
 */
@Injectable({ providedIn: 'root' })
export class StatisticalDomainService {

  private cachedTree$: Observable<DomainNode[]>;
  private cachedTotal$: Observable<number>;

  constructor(
    private communityDataService: CommunityDataService,
    private collectionDataService: CollectionDataService,
    private dsoNameService: DSONameService,
    private searchService: SearchService,
  ) {
  }

  /**
   * The number of archived items in the whole repository, shown in the core of the sunburst.
   *
   * Deliberately taken from Discovery rather than by adding up the community counts: an item that
   * is mapped into more than one community would otherwise be counted twice.
   */
  getTotalItems(): Observable<number> {
    if (this.cachedTotal$ === undefined) {
      this.cachedTotal$ = this.searchService.search(new PaginatedSearchOptions({
        pagination: Object.assign(new PaginationComponentOptions(), {
          id: 'knbs-total',
          pageSize: 1,
          currentPage: 1,
        }),
        dsoTypes: [DSpaceObjectType.ITEM],
      })).pipe(
        getFirstCompletedRemoteData(),
        map((rd: RemoteData<PaginatedList<any>>) => rd.hasSucceeded ? rd.payload.totalElements : 0),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cachedTotal$;
  }

  /**
   * The full statistical domain tree, sorted by title and shared between subscribers.
   */
  getDomainTree(): Observable<DomainNode[]> {
    if (this.cachedTree$ === undefined) {
      this.cachedTree$ = this.communityDataService.findTop(this.findOptions()).pipe(
        getFirstCompletedRemoteData(),
        switchMap((rd: RemoteData<PaginatedList<Community>>) => this.toNodes(rd.hasSucceeded ? rd.payload.page : [], 0)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cachedTree$;
  }

  private findOptions(): FindListOptions {
    return Object.assign(new FindListOptions(), {
      currentPage: 1,
      elementsPerPage: MAX_CHILDREN_PER_NODE,
      sort: new SortOptions('dc.title', SortDirection.ASC),
    });
  }

  /**
   * Convert a page of communities/collections into DomainNodes, recursively resolving their children
   */
  private toNodes(comcols: (Community | Collection)[], level: number): Observable<DomainNode[]> {
    if (isEmpty(comcols)) {
      return of([]);
    }
    return observableCombineLatest(comcols.map((comcol: Community | Collection) => this.toNode(comcol, level)));
  }

  private toNode(comcol: Community | Collection, level: number): Observable<DomainNode> {
    const isCommunity = comcol instanceof Community;
    return this.childrenOf(comcol, level).pipe(
      map((children: DomainNode[]) => ({
        id: comcol.uuid,
        name: this.dsoNameService.getName(comcol),
        count: comcol.archivedItemsCount ?? 0,
        level,
        type: isCommunity ? 'community' as const : 'collection' as const,
        route: isCommunity ? getCommunityPageRoute(comcol.uuid) : getCollectionPageRoute(comcol.uuid),
        children,
      })),
    );
  }

  /**
   * The sub-communities and collections of a community. Collections are leaves, so they never
   * trigger another request.
   */
  private childrenOf(comcol: Community | Collection, level: number): Observable<DomainNode[]> {
    if (!(comcol instanceof Community) || level + 1 >= MAX_DOMAIN_DEPTH) {
      return of([]);
    }
    return observableCombineLatest([
      this.communityDataService.findByParent(comcol.uuid, this.findOptions()).pipe(getFirstCompletedRemoteData(), map(pageOf)),
      this.collectionDataService.findByParent(comcol.uuid, this.findOptions()).pipe(getFirstCompletedRemoteData(), map(pageOf)),
    ]).pipe(
      switchMap(([subCommunities, collections]: [Community[], Collection[]]) =>
        this.toNodes([...subCommunities, ...collections], level + 1)),
    );
  }

}

/**
 * The page of a RemoteData<PaginatedList>, or an empty array when the request failed
 */
function pageOf<T>(rd: RemoteData<PaginatedList<T>>): T[] {
  return rd.hasSucceeded ? rd.payload.page : [];
}
