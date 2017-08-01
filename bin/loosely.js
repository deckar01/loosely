'use strict';

/**
 * Find the maximum value in the set using the given comparison criteria.
 * @param {Any[]} set - The set to search.
 * @param {Function} compare - The comparison criteria.
 * @returns {Any} - The maximum item in the set.
 */
function max(set, compare) {
  return set.reduce((best, item) => (compare(item, best) > 0 ? item : best), set[0]);
}

/**
 * Flattens a set of sets into a set.
 * @param {Any[][]} sets - A set of sets.
 * @returns {Any[]} - A flattened set.
 */
function flatten(sets) { return [].concat(...sets); }

/**
 * Builds a regular expression that enforces full text matching.
 * @param {String|RegExp} mask - The regular expression source.
 * @returns {RegExp} - The full text regular expression.
 */
function maskToRegex(mask) {
  let source = mask.source || mask;
  if (source[0] !== '^') source = `^${source}`;
  if (source[source.length - 1] !== '$') source = `${source}$`;
  return new RegExp(source);
}

/**
 * A path contains a node and the input that lead to it.
 */
class Path {
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

/**
 * A node of tokens in a graph. Tokens represent a single characters or
 * character classes.
 */
class Node {
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

/**
 * An abstract class for matching characters.
 */
class Token {
  /**
   * Set the value of the token.
   * @param {Any} value - The value of the token.
   */
  constructor(value, choices) {
    this.value = value;
    this.choices = choices;
  }

  /**
   * Compare a value to the token's value.
   * @name match
   * @method
   * @param {String} value - A character.
   * @returns {Boolean} - True if the character matches the token.
   */
}

/**
 * A token for matching a character to a character.
 */
class CharacterToken extends Token {
  /**
   * Set the value of the token to a character.
   * @param {String} value - The token character.
   */
  constructor(value) { super(value, 1); }

  /**
   * Compare a value to the token's character value.
   * @param {String} value - A character.
   * @returns {Boolean} - True if the character matches the token.
   */
  match(value) { return value === this.value; }
}

/**
 * A token for matching a character to a single character regular expression.
 */
class ClassToken extends Token {
  /**
   * Set the value of the token to a regular expression.
   * @param {String} value - The source of the regular expression.
   */
  constructor(value) { super(new RegExp(value), Infinity); }

  /**
   * Compare a value to the token's character value.
   * @param {String} value - A character.
   */
  match(value) { return this.value.test(value); }
}

/**
 * A graph provides access to the branching structure of a regular expression.
 * The nodes of the graph are tokens that either contain a single character or
 * a regular expression that only matches a single character.
 */
class Graph {
  /**
   * Build a graph of tokens from a regular expression.
   * @param {RegExp} regex - The regular expression to parse.
   */
  constructor(regex) {
    this.rootNode = new Node();
    let currentNode = this.rootNode;
    const groupNodes = [currentNode];
    // Parse the regex source into a graph of tokens.
    for (let i = 0; i < regex.source.length; i += 1) {
      switch (regex.source[i]) {

        /* Groups */
        case '(':
          currentNode = currentNode.spawn();
          groupNodes.push(currentNode);
          if (regex.source[i + 1] === '?') {
            i += 1;
            if (regex.source[i + 1] === ':') { i += 1; }
          }
          break;
        case ')': {
          const nextNode = groupNodes.pop().spawn();
          currentNode.add(nextNode);
          currentNode = nextNode;
          break;
        }
        case '[': {
          let setEnd = i + 1;
          while (setEnd < regex.source.length) {
            if (regex.source[setEnd] === ']' && regex.source[setEnd - 1] !== '\\') break;
            setEnd += 1;
          }
          const set = regex.source.substring(i, setEnd + 1);
          currentNode = currentNode.spawn(new ClassToken(set));
          i = setEnd;
          break;
        }
        case '{': {
          let rangeEnd = i + 1;
          while (rangeEnd < regex.source.length) {
            if (regex.source[rangeEnd] === '}' && regex.source[rangeEnd - 1] !== '\\') break;
            rangeEnd += 1;
          }
          const range = regex.source.substring(i + 1, rangeEnd).split(',').map(Number);
          const min = range[0];
          const max$$1 = range.length < 2 ? min : (range[1] || Infinity);
          for (let n = 1; n < min; n += 1) currentNode = currentNode.spawn(currentNode.token);
          if (max$$1 === Infinity) currentNode.add(currentNode);
          else {
            const minNode = currentNode;
            for (let n = min; n < max$$1; n += 1) {
              currentNode = currentNode.spawn(currentNode.token);
              minNode.add(currentNode);
            }
            currentNode = currentNode.spawn();
            minNode.add(currentNode);
          }
          i = rangeEnd;
          break;
        }

        /* Operators */
        case '|':
          currentNode = groupNodes[groupNodes.length - 1];
          break;
        case '+':
          currentNode.add(currentNode);
          break;
        case '*': {
          currentNode.add(currentNode);
          const nextNode = currentNode.parent.spawn();
          currentNode.add(nextNode);
          currentNode = nextNode;
          break;
        }
        case '?': {
          const nextNode = currentNode.parent.spawn();
          currentNode.add(nextNode);
          currentNode = nextNode;
          break;
        }

        /* Escape Sequences */
        case '\\': {
          const captureLength = Graph.ESCAPE_LENGTH[regex.source[i + 1]];
          if (captureLength) {
            const sequence = regex.source.substring(i, i + captureLength + 1);
            currentNode = currentNode.spawn(new ClassToken(sequence));
            i += captureLength;
          } else {
            currentNode = currentNode.spawn(new CharacterToken(regex.source[i + 1]));
            i += 1;
          }
          break;
        }

        /* Delimeters */
        // Start and end delimeters are implicitly represented as nodes without
        // parents or children (respectively).
        case '$': case '^': break;

        /* Text */
        default:
          currentNode = currentNode.spawn(new CharacterToken(regex.source[i]));
      }
    }
  }

  /**
   * Find the paths that the given input leads to.
   * @param {String} input - A set of characters to run through the graph.
   * @returns {Path[]} - A set of paths through the graph.
   */
  find(input) {
    const findPaths = (paths, character) => flatten(paths.map(path => path.find(character)));
    const initialPaths = [new Path(this.rootNode, '', 0)];
    return input.split('').reduce(findPaths, initialPaths);
  }
}

// The number of characters that should get consumed by each escape sequence.
Graph.ESCAPE_LENGTH = {
  c: 2,
  x: 3,
  u: 5,
  d: 1,
  D: 1,
  w: 1,
  W: 1,
  s: 1,
  S: 1,
  t: 1,
  r: 1,
  n: 1,
  v: 1,
  f: 1,
  0: 1,
  b: 1,
  B: 1,
};

/**
 * A convenience wrapper around the graph class.
 */
class Mask {
  /**
   * Build a graph from a regular expression.
   * @param {String|RegExp} mask - The regular expression to use.
   */
  constructor(mask) {
    this.regex = maskToRegex(mask);
    this.graph = new Graph(this.regex);
  }

  /**
   * Determine if the input matches the mask completely.
   * @param {String} input - The text to match.
   * @returns {Boolean} - True if the input matches the mask completely.
   */
  validate(input) {
    return this.regex.test(input);
  }

  /**
   * Modify the input to satisfy the mask.
   * @param {String} input - The text to mask.
   * @returns {String} - The masked text.
   */
  filter(input) {
    const paths = this.graph.find(input);
    const bestPath = max(paths, Path.compare);
    return bestPath.value;
  }
}

var index = { Mask };

module.exports = index;
