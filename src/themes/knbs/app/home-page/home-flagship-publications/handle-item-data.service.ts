import { Injectable } from '@angular/core';
import { RemoteDataBuildService } from '@dspace/core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '@dspace/core/cache/object-cache.service';
import { IdentifiableDataService } from '@dspace/core/data/base/identifiable-data.service';
import { RemoteData } from '@dspace/core/data/remote-data';
import { RequestService } from '@dspace/core/data/request.service';
import { HALEndpointService } from '@dspace/core/shared/hal-endpoint.service';
import { Item } from '@dspace/core/shared/item.model';
import { Observable } from 'rxjs';

/**
 * Resolves an Item from its persistent identifier through the REST 'pid' endpoint
 * (/api/pid/find?id=<handle>).
 *
 * DsoRedirectService uses the same endpoint but immediately performs a hard redirect, which is not
 * what the flagship publication cards need: they only want the object.
 */
@Injectable({ providedIn: 'root' })
export class HandleItemDataService extends IdentifiableDataService<Item> {

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super(
      'pid', requestService, rdbService, objectCache, halService, undefined,
      // the pid endpoint takes the identifier as a query parameter instead of a path segment
      (endpoint: string, resourceID: string): string => endpoint.replace(/{\?id}/, `?id=${resourceID}`),
    );
  }

  /**
   * Look up an Item by its handle, e.g. '20.500.14351/1234'
   */
  findByHandle(handle: string): Observable<RemoteData<Item>> {
    return this.findById(`hdl:${handle}`);
  }

}
