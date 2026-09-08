import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component } from '@angular/core';

import { ThemedHeaderComponent } from '../../../../app/header/themed-header.component';
import { HeaderNavbarWrapperComponent as BaseComponent } from '../../../../app/header-nav-wrapper/header-navbar-wrapper.component';

/**
 * Wrapper around the KNBS header.
 *
 * The base theme renders the header and the navbar as two stacked bands; here the navbar has moved
 * into the header itself, so this wrapper no longer renders <ds-navbar>. It keeps `position:
 * relative` (from the base stylesheet) because the mobile navigation panel is positioned against it.
 */
@Component({
  selector: 'ds-themed-header-navbar-wrapper',
  styleUrls: ['./header-navbar-wrapper.component.scss'],
  templateUrl: './header-navbar-wrapper.component.html',
  imports: [
    AsyncPipe,
    NgClass,
    ThemedHeaderComponent,
  ],
})
export class HeaderNavbarWrapperComponent extends BaseComponent {
}
