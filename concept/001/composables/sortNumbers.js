// function to sort array of numbers in ascending order

export function sortNumbers(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  return arr.slice().sort((a, b) => a - b);
}

// Example usage:
// const numbers = [5, 3, 8, 1, 2]; 
// const sortedNumbers = sortNumbers(numbers);
// console.log(sortedNumbers); // Output: [1, 2, 3, 5, 8]