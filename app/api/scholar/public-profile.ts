export function publicScholarId(privateId: string) {
  const fnv32 = (input: string, seed: number) => {
    let value = seed >>> 0;
    for (const character of input) {
      value ^= character.codePointAt(0) ?? 0;
      value = Math.imul(value, 16777619) >>> 0;
    }
    return value.toString(36).padStart(7, "0");
  };
  const forward = fnv32(privateId, 2166136261);
  const reverse = fnv32([...privateId].reverse().join(""), 2246822507);
  return `scholar-${forward}${reverse}`;
}
