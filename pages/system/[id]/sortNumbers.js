// This function should sort an array of numbers in ascending order.
// But it does in descending order instead.
// User shall repair the code to sort in ascending order.

export function sortNumbers(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  return arr.slice().sort((a, b) => b - a);
}
