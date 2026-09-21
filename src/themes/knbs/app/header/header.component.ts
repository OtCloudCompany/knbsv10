import { AsyncPipe } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { KnbsModeSwitcherComponent } from '../shared/mode/knbs-mode-switcher.component';

/**
 * A link in the government utility strip above the header.
 */
interface UtilityLink {
  labelKey: string;
  href: string;
}

/**
 * The KNBS header: a government utility strip, the institutional brand block and — unlike the base
 * theme, where the navbar is a separate band below the header — the main navigation itself, which
 * sits on the same row as the brand from md upwards.
 *
 * Below md the navigation keeps its stock behaviour: it is hidden and only rolls down as the
 * full-width mobile panel when the burger button on the right of the header row is pressed. That is
 * why {@link ThemedNavbarComponent} is rendered here and no longer by the header/navbar wrapper.
 */
@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  imports: [
    AsyncPipe,
    ContextHelpToggleComponent,
    ImpersonateNavbarComponent,
    KnbsModeSwitcherComponent,
    NgbDropdownModule,
    RouterLink,
    ThemedAuthNavMenuComponent,
    ThemedLangSwitchComponent,
    ThemedNavbarComponent,
    ThemedSearchNavbarComponent,
    TranslateModule,
  ],
})
export class HeaderComponent extends BaseComponent implements OnInit {

  /**
   * The host the repository is served from, shown next to the brand (e.g. repository.knbs.or.ke).
   * Derived from the UI config so it stays correct across environments.
   */
  repositoryHost: string;

  // TODO: confirm these two destinations with the repository team before go-live
  utilityLinks: UtilityLink[] = [
    // { labelKey: 'knbs.header.link.resource-centre', href: 'https://www.knbs.or.ke/' },
    { labelKey: 'knbs.header.link.open-data', href: 'https://kenya.opendataforafrica.org/' },
  ];

  protected readonly appConfig: AppConfig = inject(APP_CONFIG);

  ngOnInit(): void {
    super.ngOnInit();
    this.repositoryHost = this.appConfig?.ui?.host;
  }
}
