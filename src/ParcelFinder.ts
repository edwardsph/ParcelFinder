const TYPE_ERROR_MSG = 'Point coordinates must be an array of strings in the form "x,y"';
const RANGE_ERROR_MSG = 'Point coordinates values must be in the range 0 to 99';
const MAX_VALUE = 99;

/**
 * ParcelFinder
 */
export class ParcelFinder {
  /**
   * Given a set of points, compute a list of perimeters for any parcels this defines
   * @param points Array of strings containing x,y coordinates e.g. "0,0"
   * @returns {*[]} Array of numbers representing the perimeter count for each parcel found
   */
  computeParcelPerimeters(points: string[]): number[] {
    if (!points || !points.length) {
      return [];
    }
    const gridData: IGrid = parsePoints(points);
    return findParcels(gridData);
  }
}

interface IPoint {
  x:number
  y:number
}

interface IGrid {
  grid: number[][],
  maxX: number,
  maxY: number
}

/**
 * Parse the array of points to check they are correctly defined and add them to a grid of the correct size
 * @param points Array of strings containing x,y coordinates e.g. "0,0"
 * @returns {{grid: *[], maxY: number, maxX: number}} Populated 2D grid containing points and the size limits of the axes
 */
function parsePoints(points: string[]): IGrid {
  const parsedPoints: IPoint[] = [];
  let maxX = -1;
  let maxY = -1;
  points.forEach((point: string) => {
    // check each point is of the form "1,1" and are positive integers
    const coords: string[] = point.match(/^(\d+)\s*,\s*(\d+)$/);
    if (!coords || coords.length !== 3) {
      throw new TypeError(TYPE_ERROR_MSG);
    }
    // check the points are within range
    const gridPoint: IPoint = {
      x: parseInt(coords[1], 10),
      y: parseInt(coords[2], 10)
    };
    if (gridPoint.x > MAX_VALUE || gridPoint.y > MAX_VALUE) {
      throw new RangeError(RANGE_ERROR_MSG);
    }
    parsedPoints.push(gridPoint);
    maxX = Math.max(maxX, gridPoint.x);
    maxY = Math.max(maxY, gridPoint.y);
  });
  // set up the empty grid of the correct size and populate it with the points provided
  const grid = createEmptyGrid(maxX, maxY);
  parsedPoints.forEach((point) => {
    grid[point.x][point.y] = 1;
  })
  return {grid, maxX, maxY};
}

/**
 * Find parcels in a grid by checking each coordinate and tracing parcels from any points set as a 1
 * @param grid Populated 2D grid containing points
 * @param maxX Limit of x axis
 * @param maxY Limit of y axis
 * @returns {[]} Array of numbers representing the perimeter count for each parcel found
 */
function findParcels(gridData: IGrid): number[] {
  const perimeters = [];
  for (let x=0; x<=gridData.maxX; x++) {
    for (let y=0; y<=gridData.maxY; y++) {
      if (gridData.grid[x][y]) {
        // trace a new parcel
        perimeters.push(traceParcel(gridData, x, y))
      }
    }
  }
  return perimeters;
}

/**
 * Trace a parcel by looking for connected points, counting open edges as it goes based on a Depth First Search algorithm.
 * It uses a stack to build a list of connected points that need evaluating.
 * It also uses a Set to keep track of points that have already been evaluated to avoid cycling over the same points.
 * The input point is added to the stack first, then while the stack is not empty, the loop pops points off the stack to
 * be evaluated as follows:
 *   The point's value is set to 0 in the grid so that it is not evaluated again and not used as a starting point to trace another parcel.
 *   If the point has not been seen before, we look at any possible neighbouring cells in the grid
 *    - if they are defined as points and have not been visited before it adds them to the stack for later evaluation
 *    - otherwise, if the cell was not seen before, add to the count of open edges
 * @param grid Populated 2D grid containing points
 * @param pX X coordinate of first point in the parcel
 * @param pY Y coordinate of first point in the parcel
 * @param maxX Limit of x axis
 * @param maxY Limit of y axis
 * @returns {number} Number of open edges for the parcel
 */
function traceParcel(gridData: IGrid, pX: number, pY: number) {
  let openEdges = 0;
  const seen: Set<string> = new Set();
  const hasNotBeenSeen = (x: number, y: number) => !seen.has([x, y].join(' '));
  const isNewNeighbour = (x: number, y: number) => gridData.grid[x][y] && hasNotBeenSeen(x, y);
  // create a stack of points to be examined
  const stack: IPoint[] = [{x:pX, y:pY}];
  while (stack.length) {
    const evaluatedPoint: IPoint = stack.pop();
    // unset this point so it is not evaluated again
    gridData.grid[evaluatedPoint.x][evaluatedPoint.y] = 0;
    if (hasNotBeenSeen(evaluatedPoint.x, evaluatedPoint.y)) {
      // look left if not in first column
      if (evaluatedPoint.x > 0 && isNewNeighbour(evaluatedPoint.x - 1, evaluatedPoint.y)) {
        stack.push({x:evaluatedPoint.x - 1, y:evaluatedPoint.y});
      } else if (hasNotBeenSeen(evaluatedPoint.x - 1, evaluatedPoint.y)) {
        openEdges++;
      }
      // look right if not in last column
      if (evaluatedPoint.x < gridData.maxX && isNewNeighbour(evaluatedPoint.x + 1, evaluatedPoint.y)) {
        stack.push({x:evaluatedPoint.x + 1, y:evaluatedPoint.y});
      } else if (hasNotBeenSeen(evaluatedPoint.x + 1, evaluatedPoint.y)) {
        openEdges++;
      }
      // look down if not in bottom row
      if (evaluatedPoint.y > 0 && isNewNeighbour(evaluatedPoint.x, evaluatedPoint.y - 1)) {
        stack.push({x:evaluatedPoint.x, y:evaluatedPoint.y - 1});
      } else if (hasNotBeenSeen(evaluatedPoint.x, evaluatedPoint.y - 1)) {
        openEdges++;
      }
      // look up if not in top row
      if (evaluatedPoint.y < gridData.maxY && isNewNeighbour(evaluatedPoint.x, evaluatedPoint.y + 1)) {
        stack.push({x:evaluatedPoint.x, y:evaluatedPoint.y + 1});
      } else if (hasNotBeenSeen(evaluatedPoint.x, evaluatedPoint.y + 1)) {
        openEdges++;
      }
      // mark point as seen (concat coords for lookup as a string)
      seen.add([evaluatedPoint.x, evaluatedPoint.y].join(' '));
    }
  }
  return openEdges;
}

/**
 * Create grid containing zeros
 * @param x Limit of x axis
 * @param y Limit of y axis
 * @returns {any[]} A 2D grid of points set to 0
 */
function createEmptyGrid(x: number, y: number): number[][] {
  const grid: number[][] = Array(x + 1);
  for (let i=0; i<=x; i++) {
    grid[i] = Array(y + 1).fill(0);
  }
  return grid;
}
