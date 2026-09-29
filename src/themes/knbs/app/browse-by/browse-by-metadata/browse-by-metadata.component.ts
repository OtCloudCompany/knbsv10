import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { BrowseByDataType } from '@dspace/core/browse/browse-by-data-type';
import { BrowseEntrySearchOptions } from '@dspace/core/browse/browse-entry-search-options.model';
import {
  SortDirection,
  SortOptions,
} from '@dspace/core/cache/models/sort-options.model';
import { TranslateModule } from '@ngx-translate/core';

import { BrowseByMetadataComponent as BaseComponent } from '../../../../../app/browse-by/browse-by-metadata/browse-by-metadata.component';
import {
  BROWSE_BY_DECORATOR_MAP,
  DEFAULT_BROWSE_BY_CONTEXT,
} from '../../../../../app/browse-by/browse-by-switcher/browse-by-decorator';
import { ThemedBrowseByComponent } from '../../../../../app/shared/browse-by/themed-browse-by.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';

/**
 * Sort option (from the backend's webui.itemlist.sort-option list) used for the items of a browse value
 */
const KNBS_BROWSE_ITEMS_SORT_FIELD = 'dateissued';

@Component({
  selector: 'ds-browse-by-metadata',
  // styleUrls: ['./browse-by-metadata.component.scss'],
  styleUrls: ['../../../../../app/browse-by/browse-by-metadata/browse-by-metadata.component.scss'],
  // templateUrl: './browse-by-metadata.component.html',
  templateUrl: '../../../../../app/browse-by/browse-by-metadata/browse-by-metadata.component.html',
  imports: [
    AsyncPipe,
    ThemedBrowseByComponent,
    ThemedLoadingComponent,
    TranslateModule,
  ],
})
export class BrowseByMetadataComponent extends BaseComponent {

  /**
   * The items of a browse value (one series, type or subject: /browse/series?value=...) are listed
   * newest issue date first, so the latest release of a series is at the top.
   *
   * Stock DSpace sorts them by the browse index's own sort, which for a metadata index falls back to
   * title A-Z: a series then opens on its oldest, alphabetically-first edition. The list of values
   * itself (/browse/series without a value) is untouched and stays alphabetical. A direction chosen
   * explicitly on the page (the `<pagination id>.sd` query parameter) is still honoured.
   */
  updatePageWithItems(searchOptions: BrowseEntrySearchOptions, value: string, authority: string) {
    const explicit = this.route.snapshot.queryParamMap.get(`${this.paginationConfig.id}.sd`);
    const direction = explicit === String(SortDirection.ASC) ? SortDirection.ASC : SortDirection.DESC;
    const byDateIssued = Object.assign(Object.create(Object.getPrototypeOf(searchOptions)), searchOptions, {
      sort: new SortOptions(KNBS_BROWSE_ITEMS_SORT_FIELD, direction),
    });
    super.updatePageWithItems(byDateIssued, value, authority);
  }
}

// Browse pages are picked from BROWSE_BY_DECORATOR_MAP by type, context and theme name. Without this
// entry the knbs theme keeps using the stock component and the override above never runs. The file is
// listed in ../../../eager-theme-components.ts so this runs at start-up.
BROWSE_BY_DECORATOR_MAP.get(BrowseByDataType.Metadata).get(DEFAULT_BROWSE_BY_CONTEXT).set('knbs', BrowseByMetadataComponent);
