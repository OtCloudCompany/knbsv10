import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedItemAlertsComponent } from '../../../../../app/item-page/alerts/themed-item-alerts.component';
import { AccessByTokenNotificationComponent } from '../../../../../app/item-page/simple/access-by-token-notification/access-by-token-notification.component';
import { CustomUrlConflictErrorComponent } from '../../../../../app/item-page/simple/custom-url-conflict-error/custom-url-conflict-error.component';
import { ItemPageComponent as BaseComponent } from '../../../../../app/item-page/simple/item-page.component';
import { NotifyRequestsStatusComponent } from '../../../../../app/item-page/simple/notify-requests-status/notify-requests-status-component/notify-requests-status.component';
import { QaEventNotificationComponent } from '../../../../../app/item-page/simple/qa-event-notification/qa-event-notification.component';
import { ItemVersionsComponent } from '../../../../../app/item-page/versions/item-versions.component';
import { ItemVersionsNoticeComponent } from '../../../../../app/item-page/versions/notice/item-versions-notice.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ListableObjectComponentLoaderComponent } from '../../../../../app/shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { UsageStatisticsComponent } from '../../otcloud-apps/usage-statistics/usage-statistics.component';
import { CitationGeneratorComponent } from '../../otcloud-apps/citation-generator/citation-generator.component';
import { ItemPageNavbarComponent } from '../../otcloud-apps/item-page-navbar/item-page-navbar.component';
import { OtcloudAbstractFieldComponent } from '../../otcloud-apps/otcloud-abstract-field/otcloud-abstract-field.component';
import { OtcloudDescriptionFieldComponent } from '../../otcloud-apps/otcloud-description-field/otcloud-description-field.component';
import { UsageMetricsComponent } from '../../otcloud-apps/usage-metrics/usage-metrics.component';

@Component({
  selector: 'ds-themed-item-page',
  styleUrls: ['../../../../../app/item-page/simple/item-page.component.scss'],
  templateUrl: '../../../../../app/item-page/simple/item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  imports: [
    AccessByTokenNotificationComponent,
    AsyncPipe,
    CustomUrlConflictErrorComponent,
    ErrorComponent,
    ItemVersionsComponent,
    ItemVersionsNoticeComponent,
    ListableObjectComponentLoaderComponent,
    NotifyRequestsStatusComponent,
    QaEventNotificationComponent,
    ThemedItemAlertsComponent,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective
  ],
})
export class ItemPageComponent extends BaseComponent {
  /**
   * Converts an ISO language code to its full English display name.
   * @param isoCode standard ISO language code
   * @returns full language name in English
   */
  getLanguageName(isoCode: string): string {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      return displayNames.of(isoCode) || isoCode;
    } catch (e) {
      return isoCode;
    }
  }
}
