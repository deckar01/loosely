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
   * @param {Path[]} results - The paths that the character matches.
   */
  find(character, results) {
    const size = results.length;
    let paths = [this];
    const history = {};
    // Search until thre are no more paths left.
    while (paths.length) {
      // Only try recursive paths once.
      paths = paths.filter(path => !history[path.node.id]);
      paths.forEach((path) => {
        history[path.node.id] = true;
      });
      // Find the nodes that this character leads to.
      const alternatePaths = [];
      paths.forEach(path => {
        const nextPaths = [];
        path.node.find(character, nextPaths);
        nextPaths.forEach(({ node, value, score }) => {
          const newPath = new Path(node, path.value + value, path.score + score);
          // If alternate characters were found, continue searching those paths.
          if (score === 0) { alternatePaths.push(newPath); }
          // If the character matched any tokens, add those paths to the results.
          else { results.push(newPath); }
        });
      });
      paths = alternatePaths;
    }
    if(results.length === size) { results.push(this); }
  }

  /**
   * Get a random path that this path leads to.
   * @returns {Path} - The path.
   */
  sample() {
    const path = this.node.sample();
    if (path === null) return null;
    return new Path(path.node, this.value + path.value, this.score + path.score);
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
