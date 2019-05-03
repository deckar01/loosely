import Graph from './graph';
import Path from './path';
import { maskToRegex, max } from './utils';

/**
 * A convenience wrapper around the graph class.
 */
export default class Mask {
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

  /**
   * Monitor changes to the element value and apply the mask.
   * @param {Element} element - The element to monitor.
   */
  watch(element) {
    document.addEventListener('input', () => {
      element.value = this.filter(element.value);
    });
  }

  /**
   * Generate text that satisfies the mask.
   * @returns {String} - The text.
   */
  sample() {
    const path = this.graph.sample();
    return path.value;
  }
}
