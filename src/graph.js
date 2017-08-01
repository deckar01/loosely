import Node from './node';
import Path from './path';
import { CharacterToken, ClassToken } from './token';
import { flatten } from './utils';

/**
 * A graph provides access to the branching structure of a regular expression.
 * The nodes of the graph are tokens that either contain a single character or
 * a regular expression that only matches a single character.
 */
export default class Graph {
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
          const max = range.length < 2 ? min : (range[1] || Infinity);
          for (let n = 1; n < min; n += 1) currentNode = currentNode.spawn(currentNode.token);
          if (max === Infinity) currentNode.add(currentNode);
          else {
            const minNode = currentNode;
            for (let n = min; n < max; n += 1) {
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
