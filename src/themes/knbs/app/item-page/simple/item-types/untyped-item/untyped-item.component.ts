import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FindListOptions } from '@dspace/core/data/find-list-options.model';
import { RelationshipDataService } from '@dspace/core/data/relationship-data.service';
import { Context } from '@dspace/core/shared/context.model';
import { Item } from '@dspace/core/shared/item.model';
import { ViewMode } from '@dspace/core/shared/view-mode.model';
import { isNotEmpty } from '@dspace/shared/utils/empty.util';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  defaultIfEmpty,
  filter,
  map,
  shareReplay,
} from 'rxjs/operators';

import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { GeospatialItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/geospatial/geospatial-item-page-field.component';
import { ItemPageLicenseFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/license/item-page-license-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ThemedMetadataRepresentationListComponent } from '../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { RelatedItemsComponent } from '../../../../../../../app/item-page/simple/related-items/related-items-component';
import { AttachmentSectionComponent } from '../../../../../../../app/shared/bitstream-attachment/section/attachment-section.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../../../../app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import { OtcloudAbstractFieldComponent } from 'src/themes/knbs/app/otcloud-apps/otcloud-abstract-field/otcloud-abstract-field.component';
import { ItemPageNavbarComponent } from 'src/themes/knbs/app/otcloud-apps/item-page-navbar/item-page-navbar.component';
import { CitationGeneratorComponent } from 'src/themes/knbs/app/otcloud-apps/citation-generator/citation-generator.component';
import { OtcloudDescriptionFieldComponent } from 'src/themes/knbs/app/otcloud-apps/otcloud-description-field/otcloud-description-field.component';
import { UsageMetricsComponent } from 'src/themes/knbs/app/otcloud-apps/usage-metrics/usage-metrics.component';
import { UsageStatisticsComponent } from 'src/themes/knbs/app/otcloud-apps/usage-statistics/usage-statistics.component';

import { RelatedEntityTab } from '../publication/publication.component';

@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'knbs')
@Component({
  selector: 'ds-untyped-item',
  // styleUrls: ['./untyped-item.component.scss'],
  styleUrls: [
    '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss',
  ],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AttachmentSectionComponent,
    CollectionsComponent,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    GeospatialItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageDateFieldComponent,
    ItemPageLicenseFieldComponent,
    ItemPageUriFieldComponent,
    MetadataFieldWrapperComponent,
    MiradorViewerComponent,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavLink,
    NgbNavOutlet,
    RelatedItemsComponent,
    RouterLink,
    ThemedFileSectionComponent,
    ThemedItemPageTitleFieldComponent,
    ThemedMediaViewerComponent,
    ThemedMetadataRepresentationListComponent,
    ThemedResultsBackButtonComponent,
    ThemedThumbnailComponent,
    TranslateModule, OtcloudAbstractFieldComponent, ItemPageNavbarComponent,
    UsageMetricsComponent, CitationGeneratorComponent,
    UsageStatisticsComponent, OtcloudDescriptionFieldComponent
  ],
})
export class UntypedItemComponent extends BaseComponent implements OnInit {

  private relationshipService = inject(RelationshipDataService);

  /**
   * Relationship types that apply to this item, based on its dspace.entity.type.
   * Person/author relations are intentionally excluded here since authors are
   * already shown via the metadata-representation-list below. See
   * relationship-types.xml for the full set of relations per entity type.
   */
  relatedEntityTabs: RelatedEntityTab[] = [];

  /**
   * Whether any tab in relatedEntityTabs has content, gating the whole
   * #related-entities section.
   */
  anyRelatedEntitiesHaveItems$: Observable<boolean>;

  /**
   * The currently active tab in #related-entities, bound two-way to the ngb-nav so the
   * #related-entities-shortcuts links can open a tab that isn't already active.
   */
  activeRelatedTab: string;

  ngOnInit(): void {
    super.ngOnInit();

    const entityType = this.object?.firstMetadataValue('dspace.entity.type');
    const tabs: { id: string; relationType: string; labelKey: string }[] = [];

    if (entityType === 'EconomicSurvey') {
      tabs.push({ id: 'dataset', relationType: 'isDatasetOfEconomicSurvey', labelKey: 'relationships.EconomicSurvey.isDatasetOfEconomicSurvey.Dataset' });
    }
    if (entityType === 'Dataset') {
      tabs.push({ id: 'publication', relationType: 'isPublicationOfDataset', labelKey: 'relationships.Dataset.isPublicationOfDataset.Publication' });
    }
    if (entityType === 'FactSheet') {
      tabs.push({ id: 'report', relationType: 'isReportOfFactSheet', labelKey: 'relationships.FactSheet.isReportOfFactSheet.Publication' });
    }

    this.relatedEntityTabs = tabs.map((tab) => ({ ...tab, hasItems$: this.hasRelatedItems(tab.relationType) }));

    this.anyRelatedEntitiesHaveItems$ = this.relatedEntityTabs.length > 0
      ? combineLatest(this.relatedEntityTabs.map((tab) => tab.hasItems$)).pipe(map((flags) => flags.some(Boolean)))
      : of(false);
  }

  /**
   * Sets the active #related-entities tab and scrolls it into view.
   * Used by the #related-entities-shortcuts list items.
   */
  scrollToRelatedEntities(tabId: string): void {
    this.activeRelatedTab = tabId;
    document.getElementById('related-entities')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private hasRelatedItems(relationType: string): Observable<boolean> {
    const options = Object.assign(new FindListOptions(), {
      elementsPerPage: 1,
      currentPage: 1,
      fetchThumbnail: false,
    });
    return this.relationshipService.getRelatedItemsByLabel(this.object, relationType, options).pipe(
      filter((rd) => rd.hasCompleted),
      map((rd) => isNotEmpty(rd.payload?.page)),
      // paginatedRelationsToItems() internally does combineLatest() over the page's
      // relationships; when there are zero matching relationships that combineLatest([])
      // never emits, so this pipe would otherwise hang forever instead of reporting "false"
      defaultIfEmpty(false),
      shareReplay(1),
    );
  }
}
