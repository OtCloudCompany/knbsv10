import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { BitstreamDataService } from '@dspace/core/data/bitstream-data.service';
import { PaginatedList } from '@dspace/core/data/paginated-list.model';
import { RemoteData } from '@dspace/core/data/remote-data';
import {
  getBitstreamDownloadRoute,
  getItemPageRoute,
} from '@dspace/core/router/utils/dso-route.utils';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { BitstreamFormat } from '@dspace/core/shared/bitstream-format.model';
import { followLink } from '@dspace/core/shared/follow-link-config.model';
import { Item } from '@dspace/core/shared/item.model';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import {
  hasValue,
  isNotEmpty,
} from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest as observableCombineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { FileSizePipe } from '../../../../../app/shared/utils/file-size-pipe';
import {
  FlagshipDownload,
  FlagshipPublicationView,
} from './flagship-publication.model';
import {
  FlagshipPublicationConfig,
  KNBS_DOWNLOAD_BUNDLE,
  KNBS_DOWNLOAD_LABELS,
  KNBS_FLAGSHIP_PUBLICATIONS,
  KNBS_MAX_DOWNLOADS_PER_CARD,
} from './flagship-publications.config';
import { HandleItemDataService } from './handle-item-data.service';

/**
 * Longest string still plausible as a file extension. Guards against names such as
 * "Economic Survey v1.2 final", where everything after the last dot is not an extension at all.
 */
const MAX_EXTENSION_LENGTH = 8;

/**
 * The four flagship national releases promoted on the KNBS homepage.
 *
 * Each card resolves its curated handle to a live item, then renders that item's title, abstract
 * and issue date, its permanent handle URI, and one direct download button per bitstream in the
 * ORIGINAL bundle (PDF / XLSX / CSV / GeoJSON / ...). Cards whose handle is not configured, or
 * whose item is unavailable, fall back to the curated copy and a Discovery search link.
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

  constructor(
    private handleItemService: HandleItemDataService,
    private bitstreamService: BitstreamDataService,
    private dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    this.publications$ = observableCombineLatest(
      KNBS_FLAGSHIP_PUBLICATIONS.map((config: FlagshipPublicationConfig) => this.resolve(config)),
    );
  }

  private resolve(config: FlagshipPublicationConfig): Observable<FlagshipPublicationView> {
    if (!isNotEmpty(config.handle)) {
      return of(this.fallbackView(config));
    }
    return this.handleItemService.findByHandle(config.handle).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd: RemoteData<Item>) => rd.hasSucceeded && rd.payload !== undefined
        ? this.withDownloads(config, rd.payload)
        : of(this.fallbackView(config))),
    );
  }

  private withDownloads(config: FlagshipPublicationConfig, item: Item): Observable<FlagshipPublicationView> {
    return this.bitstreamService.findAllByItemAndBundleName(item, KNBS_DOWNLOAD_BUNDLE, {
      elementsPerPage: KNBS_MAX_DOWNLOADS_PER_CARD,
      currentPage: 1,
    }, true, true, followLink('format')).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => this.toDownloads(rd.hasSucceeded ? rd.payload.page : [])),
      map((downloads: FlagshipDownload[]) => this.toView(config, item, downloads)),
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

  private toView(config: FlagshipPublicationConfig, item: Item, downloads: FlagshipDownload[]): FlagshipPublicationView {
    return {
      config,
      resolved: true,
      title: item.firstMetadataValue('dc.title') ?? config.fallbackTitle,
      description: item.firstMetadataValue('dc.description.abstract') ?? config.fallbackDescription,
      date: item.firstMetadataValue('dc.date.issued') ?? config.fallbackDate,
      handleUri: item.firstMetadataValue('dc.identifier.uri') ?? `https://hdl.handle.net/${item.handle}`,
      itemRoute: getItemPageRoute(item),
      downloads,
    };
  }

  private fallbackView(config: FlagshipPublicationConfig): FlagshipPublicationView {
    return {
      config,
      resolved: false,
      title: config.fallbackTitle,
      description: config.fallbackDescription,
      date: config.fallbackDate,
      handleUri: null,
      itemRoute: null,
      downloads: [],
    };
  }

}
