import { flatten } from './utils';

/**
 * A path contains a node and the input that lead to it.
 */
export default class Path {
  /**
   * Initialize the path properties.
   * @param {Node} node - The last node in the path.
   * @param {String} value - The sequence of characters that forged this path.
   * @param {Number} score - The number of input characters in the value.
   */
  constructor(node, value, score) {
    this.node = node;
    this.value = value;
    this.score = score;
  }

  /**
   * Find the paths that the given character leads to.
   * @param {String} character - The character to match tokens against.
   * @returns {Path[]} - The paths that the character matches.
   */
  find(character) {
    const results = [];
    let paths = [this];
    // Search until thre are no more paths left.
    while (paths.length) {
      paths = paths.map((path) => {
        // Find the nodes that this character leads to.
        const nextPaths = path.node.find(character)
        .map(({ node, value, score }) => new Path(node, path.value + value, path.score + score));
        // If the path didn't have any where to go, add the path to the results.
        if (nextPaths.length === 0) results.push(path);
        return nextPaths;
      });
      paths = flatten(paths);
      // If the character matched any tokens, add those paths to the results.
      results.push(...paths.filter(({ score }) => score > this.score));
      // If alternate characters were found, continue searching those paths.
      paths = paths.filter(({ score }) => score === this.score);
    }
    return results;
  }

  /**
   * Compare paths by highest score and use the shortest value to break ties.
   * @param {Path} a - The first path.
   * @param {Path} b - The second path.
   * @returns {Number} - A signed number that is positive number if a is better
   *   than b, zero if they are equal, and negative if a is worse than b.
   */
  static compare(a, b) {
    return a.score - b.score || b.value.length - a.value.length;
  }
}
