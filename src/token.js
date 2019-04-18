import { sample } from './utils';

/**
 * An abstract class for matching characters.
 */
class Token {
  /**
   * Set the value of the token.
   * @param {Any} value - The value of the token.
   */
  constructor(value, choices) {
    this.id = value;
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

   /**
    * Selects a random character that matches the token.
    * @name sample
    * @method
    * @returns {String} - A character.
    */
}

/**
 * A token for matching a character to a character.
 */
export class CharacterToken extends Token {
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

  /**
   * Selects a random character that matches the token.
   * @returns {String} - A character.
   */
  sample() { return this.value; }
}

/**
 * A token for matching a character to a single character regular expression.
 */
export class ClassToken extends Token {
  /**
   * Set the value of the token to a regular expression.
   * @param {String} value - The source of the regular expression.
   */
  constructor(value, charset) {
    const pattern = new RegExp(value);
    const values = charset.filter(c => pattern.test(c));
    super(values, values.length);
    this.id = `/${value}/`;
  }

  /**
   * Compare a value to the token's character value.
   * @param {String} value - A character.
   */
  match(value) { return this.value.includes(value); }

  /**
   * Selects a random character that matches the token.
   * @returns {String} - A character.
   */
  sample() {
    return sample(this.value);
  }
}
