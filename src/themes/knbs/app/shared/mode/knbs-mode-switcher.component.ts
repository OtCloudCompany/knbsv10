import {
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import {
  KNBS_MODE_DEFAULT,
  KnbsMode,
  KnbsModeOption,
  KnbsModeService,
} from './knbs-mode.service';

/**
 * Switches the site between the light, medium and dark colour modes. It lives in the government
 * utility strip, next to the language switcher, because it is a site-wide preference rather than a
 * control belonging to any one page.
 */
@Component({
  selector: 'ds-knbs-mode-switcher',
  styleUrls: ['knbs-mode-switcher.component.scss'],
  templateUrl: 'knbs-mode-switcher.component.html',
  imports: [
    NgbDropdownModule,
    TranslateModule,
  ],
})
export class KnbsModeSwitcherComponent {

  readonly modeService: KnbsModeService = inject(KnbsModeService);

  /** The mode in effect, so the toggle can name it without the template searching the list. */
  readonly activeOption: Signal<KnbsModeOption> = computed(() => {
    const current: KnbsMode = this.modeService.current();
    return this.modeService.modes.find((mode: KnbsModeOption) => mode.id === current)
      ?? this.modeService.modes.find((mode: KnbsModeOption) => mode.id === KNBS_MODE_DEFAULT);
  });

  select(mode: KnbsMode): void {
    this.modeService.select(mode);
  }
}
