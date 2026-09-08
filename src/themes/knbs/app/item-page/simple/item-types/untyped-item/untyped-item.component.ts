import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Context } from '@dspace/core/shared/context.model';
import { Item } from '@dspace/core/shared/item.model';
import { ViewMode } from '@dspace/core/shared/view-mode.model';
import { TranslateModule } from '@ngx-translate/core';

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
export class UntypedItemComponent extends BaseComponent {
}
