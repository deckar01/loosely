/**
 * Find the maximum value in the set using the given comparison criteria.
 * @param {Any[]} set - The set to search.
 * @param {Function} compare - The comparison criteria.
 * @returns {Any} - The maximum item in the set.
 */
export function max(set, compare) {
  return set.reduce((best, item) => (compare(item, best) > 0 ? item : best), set[0]);
}

/**
 * Flattens a set of sets into a set.
 * @param {Any[][]} sets - A set of sets.
 * @returns {Any[]} - A flattened set.
 */
export function flatten(sets) { return [].concat(...sets); }

/**
 * Builds a regular expression that enforces full text matching.
 * @param {String|RegExp} mask - The regular expression source.
 * @returns {RegExp} - The full text regular expression.
 */
export function maskToRegex(mask) {
  let source = mask.source || mask;
  if (source[0] !== '^') source = `^${source}`;
  if (source[source.length - 1] !== '$') source = `${source}$`;
  return new RegExp(source);
}

export function sample(set) {
  const index = Math.floor(Math.random() * Math.floor(set.length));
  return set[index];
}

export const ASCII = ['\t', '\n'];
for (let i = 32; i < 127; i += 1) {
  ASCII.push(String.fromCharCode(i));
}

export function reverse(string) {
  return string.split('').reverse().join('');
}
