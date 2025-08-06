export function checkHeading(text) {
  return /^[A-Z][a-z\s]+:/.test(text); // e.g., "Overview:", "Key Concepts:"
}

export function replaceHeadingStarts(text) {
  return text.replace(/^([A-Z][a-z\s]+:)/, '🔹 $1');
}
