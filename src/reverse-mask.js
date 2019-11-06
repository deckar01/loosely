import Mask from './mask';
import { reverse } from './utils';

/**
 * A mask that filters from right to left.
 */
export default class ReverseMask extends Mask {
  /**
   * Build a graph from a regular expression.
   * @param {String|RegExp} mask - The regular expression to use.
   */
  constructor(mask) {
    super(mask);
    this.graph.reverse();
  }

  /**
   * Modify the input to satisfy the mask.
   * @param {String} input - The text to mask.
   * @returns {String} - The masked text.
   */
  filter(input) {
    return reverse(super.filter(reverse(input)));
  }

  /**
   * Generate text that satisfies the mask.
   * @returns {String} - The text.
   */
  sample() {
    return reverse(super.sample());
  }
}
