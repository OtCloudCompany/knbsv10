/**
 * A single node of the KNBS statistical domain tree.
 *
 * The tree is at most three tiers deep, which maps onto the three rings of the sunburst:
 * level 0 = top-level community, level 1 = sub-community or collection, level 2 = collection.
 */
export interface DomainNode {
  /**
   * The uuid of the underlying Community/Collection. Doubles as the Highcharts point id.
   */
  id: string;

  /**
   * The dc.title of the Community/Collection
   */
  name: string;

  /**
   * The number of archived items, as reported by the REST API (archivedItemsCount)
   */
  count: number;

  /**
   * 0 for top-level communities, 1 for their children, 2 for the collections below those
   */
  level: number;

  type: 'community' | 'collection';

  /**
   * The Angular route to the community or collection page
   */
  route: string;

  children: DomainNode[];
}

/**
 * The id used for the artificial root node rendered in the core of the sunburst
 */
export const KNBS_DOMAIN_ROOT_ID = 'knbs-repository-root';

/**
 * Total number of archived items in a list of nodes
 */
export function totalItems(nodes: DomainNode[]): number {
  return nodes.reduce((total: number, node: DomainNode) => total + node.count, 0);
}

/**
 * Depth-first flattening of a domain tree, parents before children
 */
export function flattenDomainTree(nodes: DomainNode[]): DomainNode[] {
  return nodes.reduce((flat: DomainNode[], node: DomainNode) => [...flat, node, ...flattenDomainTree(node.children)], []);
}
