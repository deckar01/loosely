import Path from './path';
import { flatten, sample } from './utils';

let COUNTER = 0;

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
    this.id = COUNTER++;
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
   * Clone the node and its child.
   * @return {Node} - The clone.
   */
  clone() {
      const clone = new Node(this.token, this.parent);
      clone.children = this.children.map(child => child.clone());
      clone.id = `${this.id}.${clone.id}`;
      return clone;
  }

  /**
   * Add this node to any nodes that don't have children.
   * @return {Node} - The node to terminate other nodes to.
   */
 terminate(node, history = {}) {
     if (history[this.id]) return;
     history[this.id] = true;
     if (this.children.length) this.children.forEach(child => child.terminate(node, history));
     else this.add(node);
 }

end(history = {}) {
   if (history[this.id]) return this;
   history[this.id] = true;
   if (this.children.length) return this.children[0].end(history);
   else return this;
}

  /**
   * Find paths to nodes that matches the given character.
   * @param {String} character - The character to match tokens against.
   * @returns {Path[]} - The paths that the character matches.
   */
  find(character, emptyNodes={}) {
    const paths = this.children.map((child) => {
      if (!child.token) {
        // Only visit empty loops once.
        if (emptyNodes[child.id]) return null;
        // Pass through nodes with no token.
        return child.find(character, Object.assign({[child.id]: true}, emptyNodes));
      }
      // If the character matches the token, use it and give it a score of one.
      if (child.token.match(character)) { return new Path(child, character, 1); }
      // If there is only one path, use it and give it a score of zero.
      const onlyOnePath = (child.token.choices === 1);
      if (onlyOnePath) { return new Path(child, child.token.value, 0); }
      return null;
    });
    return flatten(paths).filter(path => path);
  }

  /**
   * Find a random path that this node leads to.
   * @returns {Path} - The path.
   */
  sample() {
    const paths = this.children.map((child) => {
      // Pass through nodes with no token.
      if (!child.token) return child.sample();
      // Use a random character that matches the token.
      return new Path(child, child.token.sample(), 1);
    });
    if (paths.length === 0) return null;
    return sample(paths);
  }
}
