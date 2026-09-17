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
} from 'rxjs';
import {
  defaultIfEmpty,
  filter,
  map,
  shareReplay,
} from 'rxjs/operators';
import { ItemPageLicenseFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/license/item-page-license-field.component';

import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { GeospatialItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/geospatial/geospatial-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { PublicationComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/publication/publication.component';
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

export interface RelatedEntityTab {
  id: string;
  relationType: string;
  labelKey: string;
  hasItems$: Observable<boolean>;
}

@listableObjectComponent('Publication', ViewMode.StandalonePage, Context.Any, 'knbs')
@Component({
  selector: 'ds-publication',
  // styleUrls: ['./publication.component.scss'],
  styleUrls: ['../../../../../../../app/item-page/simple/item-types/publication/publication.component.scss'],
  templateUrl: './publication.component.html',
  // templateUrl: '../../../../../../../app/item-page/simple/item-types/publication/publication.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    AttachmentSectionComponent,
    CollectionsComponent,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    GeospatialItemPageFieldComponent,
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
    UsageStatisticsComponent, OtcloudDescriptionFieldComponent,
  ],
})
export class PublicationComponent extends BaseComponent implements OnInit {

  private relationshipService = inject(RelationshipDataService);

  /**
   * One tab per Publication relationship type defined in relationship-types.xml
   * (excluding isAuthorOfPublication, which is already shown via the authors
   * metadata-representation-list). Each tab only renders once its relation
   * has at least one related item.
   */
  relatedEntityTabs: RelatedEntityTab[];

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
    this.relatedEntityTabs = [
      { id: 'factsheet', relationType: 'isFactSheetOfReport', labelKey: 'relationships.Publication.isFactSheetOfReport.FactSheet' },
      { id: 'volume', relationType: 'isVolumeOfReport', labelKey: 'relationships.Publication.isVolumeOfReport.Publication' },
      { id: 'keyindicator', relationType: 'isKeyIndicatorReportOfReport', labelKey: 'relationships.Publication.isKeyIndicatorReportOfReport.Publication' },
      { id: 'reportofvolume', relationType: 'isReportOfVolume', labelKey: 'relationships.Publication.isReportOfVolume.Publication' },
      { id: 'reportofkeyindicator', relationType: 'isReportOfKeyIndicatorReport', labelKey: 'relationships.Publication.isReportOfKeyIndicatorReport.Publication' },
      { id: 'project', relationType: 'isProjectOfPublication', labelKey: 'relationships.Publication.isProjectOfPublication.Project' },
      { id: 'dataset', relationType: 'isDatasetOfPublication', labelKey: 'relationships.Publication.isDatasetOfPublication.Dataset' },
    ].map((tab) => ({ ...tab, hasItems$: this.hasRelatedItems(tab.relationType) }));

    this.anyRelatedEntitiesHaveItems$ = combineLatest(this.relatedEntityTabs.map((tab) => tab.hasItems$)).pipe(
      map((flags) => flags.some(Boolean)),
    );
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
      // shared so #related-entities-shortcuts and #related-entities can both bind to the
      // same result without triggering a second request
      shareReplay(1),
    );
  }
}
