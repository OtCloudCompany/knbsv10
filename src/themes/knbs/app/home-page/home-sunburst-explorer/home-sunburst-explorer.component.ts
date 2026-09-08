import {
  DecimalPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest as observableCombineLatest,
  fromEvent,
  Subscription,
} from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import {
  DomainNode,
  flattenDomainTree,
  KNBS_DOMAIN_ROOT_ID,
  totalItems,
} from './statistical-domain.model';
import { StatisticalDomainService } from './statistical-domain.service';

/**
 * Below this width the sunburst is hidden by CSS and the left hand list takes over as a
 * full width accordion. Kept in sync with the media query in the component stylesheet.
 */
const MOBILE_BREAKPOINT = 768;

/**
 * The KNBS Statistical Domain Explorer.
 *
 * A two column card: on the left a vertical, expandable listing of the top-level communities with
 * live item counts, on the right a three-tier Highcharts sunburst of the same tree
 * (communities > sub-communities > collections). Hovering either side highlights the other, and
 * clicking a wedge zooms into that sub-tree, or - when the wedge is a leaf - opens the
 * community/collection page behind it. Below 768px the sunburst is dropped and the list becomes a
 * plain accordion.
 *
 * Highcharts is loaded lazily, in the browser only, so it stays out of the main bundle and out of
 * the server side render.
 */
@Component({
  selector: 'ds-knbs-home-sunburst-explorer',
  templateUrl: './home-sunburst-explorer.component.html',
  styleUrls: ['./home-sunburst-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    ThemedLoadingComponent,
    TranslateModule,
  ],
})
export class HomeSunburstExplorerComponent implements OnInit, OnDestroy {

  /**
   * The top-level communities, each with their own children
   */
  topNodes: DomainNode[] = [];

  /**
   * Total number of archived items across all top-level communities, shown in the sunburst core
   */
  total = 0;

  loading = true;
  failed = false;

  /**
   * Ids of the list rows that are currently expanded
   */
  expandedIds = new Set<string>();

  /**
   * The node the user is currently pointing at, on either side of the card
   */
  activeNode: DomainNode = null;

  /**
   * Path from the top-level community down to {@link activeNode}, or to the zoomed in sunburst root
   */
  breadcrumb: DomainNode[] = [];

  /**
   * The node the sunburst is currently zoomed into, or null when showing the whole repository
   */
  zoomedNode: DomainNode = null;

  private nodesById = new Map<string, DomainNode>();
  private parentById = new Map<string, DomainNode>();

  private chartElement: HTMLElement = null;
  private chart: any = null;
  private highcharts: any = null;
  private highlightedId: string = null;

  /**
   * Set while a render is already queued for the next animation frame, so the view query setter and
   * the data subscription cannot queue two builds of the same chart.
   */
  private renderQueued = false;

  /**
   * Watches the canvas for the moment it is given a width. Returning to the homepage replays the
   * cached domain tree synchronously, which can hand the view query a container that has not been
   * laid out yet; without this the wheel would silently stay empty until the next window resize.
   */
  private canvasObserver: ResizeObserver = null;

  private subs: Subscription[] = [];

  constructor(
    private domainService: StatisticalDomainService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
  }

  /**
   * A setter rather than a plain @ViewChild so the chart is built as soon as the container leaves
   * the loading branch of the template.
   */
  @ViewChild('chartContainer')
  set chartContainer(ref: ElementRef<HTMLElement>) {
    const element = ref?.nativeElement ?? null;
    if (element === this.chartElement) {
      return;
    }
    // The old canvas is on its way out of the DOM: drop the chart bound to it before adopting the
    // new one, otherwise Highcharts keeps rendering into a detached element
    this.destroyChart();
    this.unobserveCanvas();
    this.chartElement = element;
    this.queueChartRender();
  }

  ngOnInit(): void {
    this.subs.push(observableCombineLatest({
      nodes: this.domainService.getDomainTree(),
      total: this.domainService.getTotalItems(),
    }).subscribe(({ nodes, total }: { nodes: DomainNode[], total: number }) => {
      this.topNodes = nodes;
      // Discovery is the source of truth for the repository total; the summed domain counts are
      // only a fallback for when that search fails
      this.total = total > 0 ? total : totalItems(nodes);
      this.failed = nodes.length === 0;
      this.loading = false;
      this.indexTree(nodes);
      // Build the wheel from scratch on every emission, whole and unzoomed. On a return visit to
      // the homepage the tree is replayed from the service cache the moment this component is
      // created, so this is what puts the chart back on screen.
      this.zoomedNode = null;
      this.setActiveNode(null);
      this.destroyChart();
      this.queueChartRender();
      this.cdr.markForCheck();
    }));

    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        this.subs.push(fromEvent(window, 'resize').pipe(debounceTime(200)).subscribe(() => this.onResize()));
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
    this.unobserveCanvas();
    this.destroyChart();
  }

  /* ---------------------------------------------------------------- list side */

  isExpanded(node: DomainNode): boolean {
    return this.expandedIds.has(node.id);
  }

  toggleExpanded(node: DomainNode): void {
    if (this.expandedIds.has(node.id)) {
      this.expandedIds.delete(node.id);
    } else {
      this.expandedIds.add(node.id);
    }
  }

  /**
   * Highlight the matching arc while the pointer (or keyboard focus) is on a list row
   */
  onNodeFocus(node: DomainNode): void {
    this.setActiveNode(node);
    this.highlightArc(node.id);
  }

  onNodeBlur(): void {
    this.setActiveNode(this.zoomedNode);
    this.highlightArc(null);
  }

  /* --------------------------------------------------------------- chart side */

  /**
   * Build the chart on the next animation frame. Deferring means the canvas has been laid out by
   * the time its width is read, whether the domain tree arrived over the network or straight from
   * the service cache during this component's very first change detection pass.
   */
  private queueChartRender(): void {
    if (!isPlatformBrowser(this.platformId) || this.renderQueued) {
      return;
    }
    this.renderQueued = true;
    this.zone.runOutsideAngular(() => requestAnimationFrame(() => {
      this.renderQueued = false;
      void this.renderChart();
    }));
  }

  private async renderChart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.chartElement === null || this.chart !== null || this.topNodes.length === 0) {
      return;
    }
    // Either hidden by the mobile media query - down there the accordion is the whole experience -
    // or not laid out yet. Watching the canvas covers both: it fires as soon as it is given a size.
    if (this.chartElement.offsetWidth === 0) {
      this.observeCanvas();
      return;
    }
    const highcharts = await this.loadHighcharts();
    if (this.chartElement === null || this.chart !== null || this.chartElement.offsetWidth === 0) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.chart = highcharts.chart(this.chartElement, this.chartOptions());
    });
  }

  private observeCanvas(): void {
    if (this.canvasObserver !== null || this.chartElement === null || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.canvasObserver = new ResizeObserver(() => {
        if (this.chart === null && this.chartElement !== null && this.chartElement.offsetWidth > 0) {
          void this.renderChart();
        }
      });
      this.canvasObserver.observe(this.chartElement);
    });
  }

  private unobserveCanvas(): void {
    this.canvasObserver?.disconnect();
    this.canvasObserver = null;
  }

  /**
   * Lazily pull in Highcharts and its sunburst + accessibility modules. The ESM entry points are
   * used explicitly so that the modules register themselves against the same Highcharts instance.
   */
  private async loadHighcharts(): Promise<any> {
    if (this.highcharts === null) {
      const core = await import('highcharts/esm/highcharts.js');
      await import('highcharts/esm/modules/sunburst.js');
      await import('highcharts/esm/modules/accessibility.js');
      this.highcharts = core.default;
    }
    return this.highcharts;
  }

  private destroyChart(): void {
    if (this.chart !== null) {
      this.chart.destroy();
      this.chart = null;
      this.highlightedId = null;
    }
  }

  private onResize(): void {
    if (this.chartElement === null) {
      return;
    }
    if (this.chartElement.offsetWidth === 0 || window.innerWidth < MOBILE_BREAKPOINT) {
      this.destroyChart();
    } else if (this.chart === null) {
      this.queueChartRender();
    } else {
      this.chart.reflow();
    }
  }

  private chartOptions(): any {
    return {
      chart: {
        type: 'sunburst',
        backgroundColor: 'transparent',
        // No explicit height: Highcharts reads a percentage height as a percentage of the *width*,
        // so it has to take the height from the (absolutely positioned) container instead
        spacing: [4, 4, 4, 4],
        style: { fontFamily: 'inherit' },
      },
      colors: this.palette(),
      title: { text: undefined },
      credits: { enabled: false },
      tooltip: { enabled: false },
      exporting: { enabled: false },
      series: [{
        type: 'sunburst',
        name: 'KNBS',
        data: this.chartData(),
        allowTraversingTree: true,
        // Levels are counted from the wedge the sunburst is currently zoomed into rather than from
        // the repository root, so every zoom level is coloured like the top level one: a plain core,
        // a ring of full strength palette colours around it and a darker ring outside that. With
        // absolute levels a wedge three tiers down would inherit the washed out outer ring colours
        // and its labels would be white on near white.
        levelIsConstant: false,
        // The traversal breadcrumb has no `enabled` flag, so it is hidden in the stylesheet instead;
        // `floating` is what stops the chart from reserving the plot height it would have taken.
        // Our own breadcrumb above the canvas names the same path, in the theme's own type.
        breadcrumbs: { floating: true },
        cursor: 'pointer',
        borderWidth: 1,
        borderColor: this.cssVar('--knbs-surface', '#ffffff'),
        accessibility: {
          description: 'Interactive sunburst of the KNBS statistical domains. The inner ring holds the top level communities, ' +
            'the middle ring their sub-communities and the outer ring the collections.',
        },
        states: {
          hover: { brightness: 0.08 },
          // Dimmed far enough to push the hovered wedge forward, but not so far that the labels on
          // the rest of the wheel stop being readable
          inactive: { opacity: 0.55 },
        },
        dataLabels: {
          // Sunburst labels sit on top of their own wedge. Saying so is what makes Highcharts
          // resolve the 'contrast' colours below against the wedge fill; without it they are
          // resolved against the (transparent) chart background and every label comes out white -
          // unreadable on the gold wedges and on the pale outer ring.
          inside: true,
          style: {
            fontSize: '11px',
            fontWeight: '600',
            // Black or white per wedge, whichever the fill behind it can carry, haloed in the
            // opposite colour so a label that straddles a wedge border stays readable
            color: 'contrast',
            textOutline: '1px contrast',
          },
          filter: { property: 'innerArcLength', operator: '>', value: 48 },
          rotationMode: 'circular',
        },
        levels: [
          {
            level: 1,
            // The core is only a backdrop for the HTML overlay in the middle of the canvas, so it is
            // kept a shade darker than the panel behind it to read as a disc rather than a hole
            color: this.cssVar('--knbs-tint-strong', '#efe0d9'),
            dataLabels: { enabled: false },
          },
          { level: 2, colorByPoint: true },
          { level: 3, colorVariation: { key: 'brightness', to: -0.3 } },
          { level: 4, colorVariation: { key: 'brightness', to: 0.25 } },
        ],
        point: {
          events: {
            // Highcharts sets event.target to the Point it fired on, so there is no need to rely
            // on the handler's own `this`
            mouseOver: (event: any) => this.zone.run(() => this.onArcHover(event.target?.id ?? null)),
            mouseOut: () => this.zone.run(() => this.onArcHover(null)),
            // Highcharts only drills into wedges that have children, so a leaf click is free to
            // navigate to the collection (or childless community) it stands for
            click: (event: any) => this.zone.run(() => this.onArcClick(event.point?.id ?? event.target?.id ?? null)),
          },
        },
        events: {
          setRootNode: (event: any) => this.zone.run(() => this.onZoom(event.newRootId)),
        },
      }],
    };
  }

  /**
   * Flat Highcharts point list: an artificial root in the core, then one point per node.
   * Only leaves carry a value; Highcharts sums them up the tree, which keeps every ring consistent
   * with the ring outside it.
   */
  private chartData(): any[] {
    const points: any[] = [{
      id: KNBS_DOMAIN_ROOT_ID,
      parent: '',
      name: 'KNBS',
    }];
    flattenDomainTree(this.topNodes).forEach((node: DomainNode) => {
      const point: any = {
        id: node.id,
        parent: this.parentById.get(node.id)?.id ?? KNBS_DOMAIN_ROOT_ID,
        name: node.name,
      };
      if (node.children.length === 0) {
        // Empty collections still get a sliver, otherwise they silently disappear from the ring
        point.value = Math.max(node.count, 1);
      }
      points.push(point);
    });
    return points;
  }

  /**
   * The chart palette lives in the theme stylesheet, so read it back off the rendered element
   * rather than duplicating hex codes here.
   */
  private palette(): string[] {
    return [1, 2, 3, 4, 5, 6, 7, 8]
      .map((index: number) => this.cssVar('--knbs-chart-palette-' + index, ''))
      .filter((color: string) => color.length > 0);
  }

  private cssVar(name: string, fallback: string): string {
    if (!isPlatformBrowser(this.platformId) || this.chartElement === null) {
      return fallback;
    }
    const value = getComputedStyle(this.chartElement).getPropertyValue(name).trim();
    return value.length > 0 ? value : fallback;
  }

  private highlightArc(id: string): void {
    if (this.chart === null) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      if (this.highlightedId !== null) {
        this.chart.get(this.highlightedId)?.setState('');
      }
      if (id !== null) {
        this.chart.get(id)?.setState('hover');
      }
      this.highlightedId = id;
    });
  }

  /* ------------------------------------------------------------------ shared */

  private onArcHover(id: string): void {
    this.setActiveNode(id === null ? this.zoomedNode : this.nodesById.get(id) ?? null);
  }

  /**
   * Open the page behind a leaf wedge. Wedges with children are left to Highcharts, which zooms the
   * sunburst into them instead.
   */
  private onArcClick(id: string): void {
    const node = id === null ? null : this.nodesById.get(id) ?? null;
    if (node !== null && node.children.length === 0) {
      void this.router.navigateByUrl(node.route);
    }
  }

  /**
   * Zoom the sunburst back out to a crumb the user clicked in the breadcrumb above the canvas.
   * Passing null returns to the whole repository. Highcharts answers with its own setRootNode
   * event, so {@link onZoom} is left to update the breadcrumb and the core overlay.
   */
  zoomTo(node: DomainNode): void {
    if (this.chart === null) {
      return;
    }
    this.zone.runOutsideAngular(() => this.chart.series?.[0]?.setRootNode(node?.id ?? KNBS_DOMAIN_ROOT_ID));
  }

  /**
   * The crumbs that can actually be zoomed to: the wheel only ever roots on a wedge that has
   * children, so a leaf crumb - a collection the pointer happens to be over - stays plain text.
   */
  isZoomable(node: DomainNode): boolean {
    return this.chart !== null && node.children.length > 0 && node.id !== this.zoomedNode?.id;
  }

  private onZoom(rootId: string): void {
    this.zoomedNode = rootId === KNBS_DOMAIN_ROOT_ID ? null : this.nodesById.get(rootId) ?? null;
    this.setActiveNode(this.zoomedNode);
  }

  private setActiveNode(node: DomainNode): void {
    this.activeNode = node;
    this.breadcrumb = this.pathTo(node);
    this.cdr.markForCheck();
  }

  private pathTo(node: DomainNode): DomainNode[] {
    const path: DomainNode[] = [];
    let current = node;
    while (current !== null && current !== undefined) {
      path.unshift(current);
      current = this.parentById.get(current.id) ?? null;
    }
    return path;
  }

  private indexTree(nodes: DomainNode[]): void {
    this.nodesById.clear();
    this.parentById.clear();
    const index = (children: DomainNode[], parent: DomainNode) => {
      children.forEach((child: DomainNode) => {
        this.nodesById.set(child.id, child);
        if (parent !== null) {
          this.parentById.set(child.id, parent);
        }
        index(child.children, child);
      });
    };
    index(nodes, null);
  }

}
