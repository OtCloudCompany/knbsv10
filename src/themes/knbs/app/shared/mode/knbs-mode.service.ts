import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

/**
 * The site-wide colour modes. Each one is a block of CSS custom properties in
 * themes/knbs/styles/_theme_modes.scss, selected by the data-knbs-mode attribute this service
 * stamps on the document element.
 */
export type KnbsMode = 'light' | 'medium';

export interface KnbsModeOption {
  id: KnbsMode;
  labelKey: string;
  descriptionKey: string;
  /** Font Awesome icon shown next to the option. */
  icon: string;
  /** The colour shown in the switcher, so the modes are recognisable without applying them. */
  swatch: string;
}

export const KNBS_MODES: KnbsModeOption[] = [
  {
    id: 'light',
    labelKey: 'knbs.mode.light.label',
    descriptionKey: 'knbs.mode.light.description',
    icon: 'fa-sun',
    swatch: '#ffffff',
  },
  {
    id: 'medium',
    labelKey: 'knbs.mode.medium.label',
    descriptionKey: 'knbs.mode.medium.description',
    icon: 'fa-cloud-sun',
    swatch: '#efe3dd',
  },
];

export const KNBS_MODE_DEFAULT: KnbsMode = 'light';

const STORAGE_KEY = 'knbs-mode';

/**
 * Holds the colour mode in effect and mirrors it onto the document element as data-knbs-mode, which
 * drives the KNBS and DSpace variables in _theme_modes.scss.
 *
 * The choice is a per-visitor preference, so it is kept in localStorage rather than on the server:
 * during SSR, and before the stored value can be read, the page renders the default mode, which is
 * also the one compiled into bare :root. A stored value that is no longer offered — 'dark', from
 * when the theme still shipped one — fails the check in restore() and falls back to the default.
 */
@Injectable({ providedIn: 'root' })
export class KnbsModeService {

  readonly modes: KnbsModeOption[] = KNBS_MODES;

  readonly current = signal<KnbsMode>(KNBS_MODE_DEFAULT);

  private readonly document: Document = inject(DOCUMENT);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.apply(this.restore());
  }

  select(mode: KnbsMode): void {
    this.apply(mode);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Storage can be unavailable (private browsing, blocked site data); the mode still applies
        // for this page view, it just will not survive a reload.
      }
    }
  }

  private apply(mode: KnbsMode): void {
    this.current.set(mode);
    this.document.documentElement.setAttribute('data-knbs-mode', mode);
  }

  private restore(): KnbsMode {
    if (!isPlatformBrowser(this.platformId)) {
      return KNBS_MODE_DEFAULT;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return KNBS_MODES.some((mode: KnbsModeOption) => mode.id === stored) ? stored as KnbsMode : KNBS_MODE_DEFAULT;
    } catch {
      return KNBS_MODE_DEFAULT;
    }
  }
}
