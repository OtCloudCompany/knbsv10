import { isPlatformBrowser } from '@angular/common';
import {
    Inject,
    Injectable,
    PLATFORM_ID,
} from '@angular/core';
// Import world map data
import worldMap from '@highcharts/map-collection/custom/world.geo.json';
import Highcharts from 'highcharts/esm/highcharts.js';
// Since Highcharts 12 the feature modules register themselves against the instance they are built
// on rather than exporting a factory to call, so these are side effect imports. They have to be the
// ESM entry points to match the ESM core above: the UMD build under `highcharts/modules/` resolves
// its own copy of the core and would leave this instance without maps or exporting.
import 'highcharts/esm/modules/map.js';
import 'highcharts/esm/modules/exporting.js';
// Types only, and not needed for anything this service does: upstream's exporting.d.ts declares
// `Chart.exporting: Exporting`, but the `Exporting` class it refers to is declared in
// export-data.d.ts. Without this the exporting module's own typings do not compile.
import type {} from 'highcharts/esm/modules/export-data.js';

@Injectable({
    providedIn: 'root',
})
export class HighchartsService {
    Highcharts: any = Highcharts;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            // Add map data to Highcharts
            Highcharts.maps['custom/world'] = worldMap;
        }
    }

    getHighcharts(): any {
        return this.Highcharts;
    }

}
