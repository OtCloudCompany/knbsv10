import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownViewerComponent } from 'src/app/shared/markdown-viewer/markdown-viewer.component';

import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { RecentItemListComponent } from '../../../../app/home-page/recent-item-list/recent-item-list.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { HomeFlagshipPublicationsComponent } from './home-flagship-publications/home-flagship-publications.component';
import { HomeSunburstExplorerComponent } from './home-sunburst-explorer/home-sunburst-explorer.component';

/**
 * An entry point card at the foot of the hero.
 */
interface HeroCard {
  titleKey: string;
  leadKey: string;
  routerLink: string;
  icon: string;
}

/**
 * The homepage of the KNBS National Statistical Repository.
 *
 * Replaces the stock DSpace homepage (news jumbotron + flat top-level community list) with a
 * branded hero, the Statistical Domain Explorer and the flagship publication cards. Everything the
 * base component provides (CMS home header, Discover filters, recent submissions, COAR notify) is
 * kept, so nothing regresses when those features are switched on in config.
 */
@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html',
  imports: [
    AsyncPipe,
    HomeCoarComponent,
    HomeFlagshipPublicationsComponent,
    HomeSunburstExplorerComponent,
    MarkdownViewerComponent,
    NgTemplateOutlet,
    RecentItemListComponent,
    RouterLink,
    SuggestionsPopupComponent,
    ThemedConfigurationSearchPageComponent,
    ThemedSearchFormComponent,
    TranslateModule,
  ],
})
export class HomePageComponent extends BaseComponent {

  /**
   * Curated searches offered as chips under the hero search box. These are sent to /search as plain
   * queries, so they are phrased the way a user would type them and are not translated.
   */
  // TODO: curate this list with the repository team once there are search logs to curate it from
  trendingSearches: string[] = [
    'Economic Surveys',
    'Population and Housing Censuses',
    'Consumer Price Indices',
    'Agriculture',
    'County Statistical Abstracts',
  ];

  /**
   * The entry points shown as cards at the foot of the hero. They deliberately point at routes that
   * always exist in DSpace, so the homepage cannot advertise a dead end.
   */
  heroCards: HeroCard[] = [
    {
      titleKey: 'knbs.home.hero.link.communities',
      leadKey: 'knbs.home.hero.card.communities.lead',
      routerLink: '/community-list',
      icon: 'fa-sitemap',
    },
    {
      titleKey: 'knbs.home.hero.link.dateissued',
      leadKey: 'knbs.home.hero.card.dateissued.lead',
      routerLink: '/browse/dateissued',
      icon: 'fa-calendar-days',
    },
    {
      titleKey: 'knbs.home.hero.link.subject',
      leadKey: 'knbs.home.hero.card.subject.lead',
      routerLink: '/browse/subject',
      icon: 'fa-tags',
    },
    {
      titleKey: 'knbs.home.hero.link.author',
      leadKey: 'knbs.home.hero.card.author.lead',
      routerLink: '/browse/author',
      icon: 'fa-building-columns',
    },
  ];
}
