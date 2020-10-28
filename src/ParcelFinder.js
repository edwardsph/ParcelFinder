const TYPE_ERROR_MSG = 'Point coordinates must be an array of strings in the form "x,y"';
const RANGE_ERROR_MSG = 'Point coordinates values must be in the range 0 to 99';
const MAX_VALUE = 99;

/**
 * ParcelFinder
 */
module.exports = {
  /**
   * Given a set of points, render a list of perimeters for any parcels this defines
   * @param points Array of strings containing x,y coordinates e.g. "0,0"
   * @returns {*[]} Array of numbers representing the perimeter count for each parcel found
   */
  render(points) {
    if (!points || !points.length) {
      return [];
    }
    const {grid, maxX, maxY} = parsePoints(points);
    return findParcels(grid, maxX, maxY);
  }
}

/**
 * Parse the array of points to check they are correctly defined and add them to a grid of the correct size
 * @param points Array of strings containing x,y coordinates e.g. "0,0"
 * @returns {{grid: *[], maxY: number, maxX: number}} Populated 2D grid containing points and the size limits of the axes
 */
function parsePoints(points) {
  const parsedPoints = [];
  let maxX = -1;
  let maxY = -1;
  if (!Array.isArray(points)) {
    throw new TypeError(TYPE_ERROR_MSG);
  }
  points.forEach((point) => {
    // check each point is of the form "1,1" and are positive integers
    if (typeof point !== 'string') {
      throw new TypeError(TYPE_ERROR_MSG);
    }
    const coords = point.match(/^(\d+)\s*,\s*(\d+)$/);
    if (!coords || coords.length !== 3) {
      throw new TypeError(TYPE_ERROR_MSG);
    }
    // check the points are within range
    const x = parseInt(coords[1], 10);
    const y = parseInt(coords[2], 10);
    if (x > MAX_VALUE || y > MAX_VALUE) {
      throw new RangeError(RANGE_ERROR_MSG);
    }
    parsedPoints.push([x, y]);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  // set up the empty grid of the correct size and populate it with the points provided
  const grid = createEmptyGrid(maxX, maxY);
  parsedPoints.forEach((point) => {
    grid[point[0]][point[1]] = 1;
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
function findParcels(grid, maxX, maxY) {
  const perimeters = [];
  for (let x=0; x<=maxX; x++) {
    for (let y=0; y<=maxY; y++) {
      if (grid[x][y]) {
        // trace a new parcel
        perimeters.push(traceParcel(grid, x, y, maxX, maxY))
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
 * be evaluated.
 *   The point's value is set to 0 in the grid so that it is not evaluated again and not used as a starting point to trace another parcel.
 *   If the point has not been seen before, we look at any possible neighbouring cells in the grid
 *    - if they are defined as points and have not been visited before it adds them to the stack for later evaluation
 *    - otherwise, if the cell was not seen before, add to the count of open edges
 * @param grid Populated 2D grid containing points
 * @param x X coordinate of first point in the parcel
 * @param y Y coordinate of first point in the parcel
 * @param maxX Limit of x axis
 * @param maxY Limit of y axis
 * @returns {number} Number of open edges for the parcel
 */
function traceParcel(grid, x, y, maxX, maxY) {
  let openEdges = 0;
  // create a stack of points to be examined
  const stack = [[x,y]];
  // create a set to contain a list of visited points
  const seen = new Set();
  const hasBeenSeen = (x, y) => seen.has([x, y].join(' '));
  const isNewNeighbour = (x, y) => grid[x][y] && !hasBeenSeen(x, y);
  while (stack.length) {
    const p = stack.pop();
    // unset this point so it is not evaluated again
    grid[p[0]][p[1]] = 0;
    if (!hasBeenSeen(p[0], p[1])) {
      // look at any possible neighbouring cells - if they contain a previously unseen point add them to the stack
      // otherwise, if the neighbouring cell was not seen before increment the count of open edges

      // look left if not in first column
      if (p[0] > 0 && isNewNeighbour(p[0] - 1, p[1])) {
        stack.push([p[0] - 1, p[1]]);
      } else if (!hasBeenSeen(p[0] - 1, p[1])) {
        openEdges++;
      }
      // look right if not in last column
      if (p[0] < maxX && isNewNeighbour(p[0] + 1, p[1])) {
        stack.push([p[0] + 1, p[1]]);
      } else if (!hasBeenSeen(p[0] + 1, p[1])) {
        openEdges++;
      }
      // look down if not in bottom row
      if (p[1] > 0 && isNewNeighbour(p[0], p[1] - 1)) {
        stack.push([p[0], p[1] - 1]);
      } else if (!hasBeenSeen(p[0], p[1] - 1)) {
        openEdges++;
      }
      // look up if not in top row
      if (p[1] < maxY && isNewNeighbour(p[0], p[1] + 1)) {
        stack.push([p[0], p[1] + 1]);
      } else if (!hasBeenSeen(p[0], p[1] + 1)) {
        openEdges++;
      }
      // mark point as seen
      seen.add([p[0], p[1]].join(' '));
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
function createEmptyGrid(x, y) {
  const grid = Array(x + 1);
  for (let i=0; i<=x; i++) {
    grid[i] = Array(y + 1).fill(0);
  }
  return grid;
}
