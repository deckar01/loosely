import Path from './path';
import { flatten } from './utils';

/**
 * A node of tokens in a graph. Tokens represent a single characters or
 * character classes.
 */
export default class Node {
  /**
   * Create an empty node.
   * @param {Node} token - The token for this node.
   * @param {Node} parent - The parent node of this node.
   */
  constructor(token, parent) {
    this.token = token;
    this.parent = parent;
    this.children = [];
  }

  /**
   * Add a child.
   * @param {Node} node - The child node.
   * @return {Node} - The child node.
   */
  add(node) {
    this.children.push(node);
    return node;
  }

  /**
   * Create a child.
   * @param {Token} [token] - The token for the child node.
   * @return {Node} - The child node.
   */
  spawn(token) {
    return this.add(new Node(token, this));
  }

  /**
   * Find paths to nodes that matches the given character.
   * @param {String} character - The character to match tokens against.
   * @returns {Path[]} - The paths that the character matches.
   */
  find(character) {
    const paths = this.children.map((child) => {
      // Pass through nodes with no token.
      if (!child.token) return child.find(character);
      // If the character matches the token, use it and give it a score of one.
      if (child.token.match(character)) { return new Path(child, character, 1); }
      // If there is only one path, use it and give it a score of zero.
      const onlyOnePath = (child.token.choices === 1);
      if (onlyOnePath) { return new Path(child, child.token.value, 0); }
      return null;
    });
    return flatten(paths).filter(path => path);
  }
}
