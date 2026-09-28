import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Context } from '@dspace/core/shared/context.model';
import { ItemSearchResult } from '@dspace/core/shared/object-collection/item-search-result.model';
import { ViewMode } from '@dspace/core/shared/view-mode.model';
import { TranslateModule } from '@ngx-translate/core';

import { MetadataDirective } from '../../../../../../../../../app/shared/metadata.directive';
import { MetadataLinkViewComponent } from '../../../../../../../../../app/shared/metadata-link-view/metadata-link-view.component';
import { ThemedAccessStatusBadgeComponent } from '../../../../../../../../../app/shared/object-collection/shared/badges/access-status-badge/themed-access-status-badge.component';
import { ThemedStatusBadgeComponent } from '../../../../../../../../../app/shared/object-collection/shared/badges/status-badge/themed-status-badge.component';
import { ThemedBadgesComponent } from '../../../../../../../../../app/shared/object-collection/shared/badges/themed-badges.component';
import { listableObjectComponent } from '../../../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent as BaseComponent } from '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TruncatableComponent } from '../../../../../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { ThemedThumbnailComponent } from '../../../../../../../../../app/thumbnail/themed-thumbnail.component';

/**
 * Discovery filter over dc.type, from the step 9 facets in discovery.xml
 */
const ITEM_TYPE_FILTER = 'itemtype';

/**
 * Contexts where editors pick or manage items. They keep the stock badges, entity type included,
 * because that is what relationship and workflow decisions turn on.
 */
const EDITOR_CONTEXTS: ReadonlySet<Context> = new Set([
  Context.EntitySearchModal,
  Context.EntitySearchModalWithNameVariants,
  Context.SideBarSearchModal,
  Context.SideBarSearchModalCurrent,
  Context.Workflow,
  Context.Workspace,
  Context.SupervisedItems,
  Context.AdminWorkflowSearch,
  Context.MyDSpaceArchived,
  Context.MyDSpaceWorkspace,
  Context.MyDSpaceWorkflow,
  Context.MyDSpaceDeclined,
  Context.MyDSpaceApproved,
  Context.MyDSpaceWaitingController,
  Context.MyDSpaceValidation,
]);

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement, Context.Any, 'knbs')
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.Any, 'knbs')
@Component({
  selector: 'ds-item-search-result-list-element',
  // styleUrls: ['./item-search-result-list-element.component.scss'],
  styleUrls: ['../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html',
  // templateUrl: '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.html',
  imports: [
    AsyncPipe,
    MetadataDirective,
    MetadataLinkViewComponent,
    NgClass,
    RouterLink,
    ThemedAccessStatusBadgeComponent,
    ThemedBadgesComponent,
    ThemedStatusBadgeComponent,
    ThemedThumbnailComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class ItemSearchResultListElementComponent extends BaseComponent {

  /**
   * On public lists the badge shows the item type (dc.type) instead of the entity type, which is
   * "Publication" for nearly every KNBS item and so tells the reader nothing
   */
  get showItemTypeBadge(): boolean {
    return !EDITOR_CONTEXTS.has(this.context);
  }

  /**
   * The item type, or undefined when the item has none; the badge is then left out rather than
   * falling back to the entity type
   */
  get itemType(): string {
    return this.dso?.firstMetadataValue('dc.type');
  }

  /**
   * Search for every item of the given type
   */
  itemTypeQueryParams(itemType: string): Record<string, string> {
    return { [`f.${ITEM_TYPE_FILTER}`]: `${itemType},equals` };
  }
}
