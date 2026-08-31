// =====================================================================
// Minimal, dependency-free QR Code generator (byte mode, ECC level M).
// Trimmed TypeScript port of Nayuki's public-domain QR Code generator.
// Produces a boolean matrix; render it as SVG. Good enough for URLs.
// =====================================================================

type Bit = boolean;

const ECC_M_CODEWORDS: number[] = [
  // number of ECC codewords per block, index = version (1..40); M level
  0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
  26, 26, 26, 28, 28, 28, 28, 28, 34, 30, 30, 30, 30, 30, 34, 34, 30, 30, 30,
  34, 30, 30,
];
const ECC_M_BLOCKS: number[] = [
  0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17,
  18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];

// Number of DATA codewords, ECC level M (ISO/IEC 18004 table). We cap at
// version 6 — no version-info modules to handle — which comfortably fits any
// booking URL. Index = version.
const DATA_CODEWORDS_M: number[] = [0, 16, 28, 44, 64, 86, 108];
const MAX_VERSION = 6;

function numDataCodewords(version: number): number {
  return DATA_CODEWORDS_M[version];
}

// Reed–Solomon over GF(256) — exact port of Nayuki's reference routines.
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
// Returns the divisor coefficients of the degree-`degree` generator polynomial,
// stored WITHOUT the implicit leading 1 (length = degree).
function rsGeneratePolynomial(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}
function rsComputeRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    for (let i = 0; i < result.length; i++) {
      result[i] ^= gfMul(divisor[i], factor);
    }
  }
  return result;
}

function chooseVersion(dataLen: number): number {
  for (let v = 1; v <= MAX_VERSION; v++) {
    const cap = numDataCodewords(v);
    const needed = Math.ceil((4 + 8 + dataLen * 8) / 8); // byte-mode len is 8 bits for v<10
    if (needed <= cap) return v;
  }
  throw new Error("Data too long for this QR (max version 6)");
}

export interface QRMatrix {
  size: number;
  modules: Bit[][];
}

export function makeQR(text: string): QRMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = chooseVersion(bytes.length);
  const size = version * 4 + 17;
  const eccLen = ECC_M_CODEWORDS[version];
  const numBlocks = ECC_M_BLOCKS[version];
  const dataCapacity = numDataCodewords(version);

  // --- build bit stream ---
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  // terminator + pad
  const capacityBits = dataCapacity * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    dataCodewords.push(byte);
  }
  const padBytes = [0xec, 0x11];
  for (let i = 0; dataCodewords.length < dataCapacity; i++) {
    dataCodewords.push(padBytes[i % 2]);
  }

  // --- split into blocks + ECC ---
  const shortBlockLen = Math.floor(dataCapacity / numBlocks);
  const numLongBlocks = dataCapacity % numBlocks;
  const generator = rsGeneratePolynomial(eccLen);
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let k = 0;
  for (let b = 0; b < numBlocks; b++) {
    const len = shortBlockLen + (b >= numBlocks - numLongBlocks ? 1 : 0);
    const blk = dataCodewords.slice(k, k + len);
    k += len;
    dataBlocks.push(blk);
    eccBlocks.push(rsComputeRemainder(blk, generator));
  }
  // interleave
  const finalCodewords: number[] = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++)
    for (const blk of dataBlocks) if (i < blk.length) finalCodewords.push(blk[i]);
  for (let i = 0; i < eccLen; i++)
    for (const blk of eccBlocks) finalCodewords.push(blk[i]);

  // --- place modules ---
  const modules: (Bit | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null)
  );
  const setFn = (x: number, y: number, v: Bit) => (modules[y][x] = v);

  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -1; dy <= 7; dy++)
      for (let dx = -1; dx <= 7; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const inner = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const ring =
          dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        setFn(x, y, inner ? ring || core : false);
      }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // timing
  for (let i = 8; i < size - 8; i++) {
    if (modules[6][i] === null) setFn(i, 6, i % 2 === 0);
    if (modules[i][6] === null) setFn(6, i, i % 2 === 0);
  }

  // alignment
  const alignPositions = getAlignmentPositions(version);
  for (const ay of alignPositions)
    for (const ax of alignPositions) {
      if (modules[ay][ax] !== null) continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const ring = Math.max(Math.abs(dx), Math.abs(dy));
          setFn(ax + dx, ay + dy, ring !== 1);
        }
    }

  // dark module
  setFn(8, size - 8, true);

  // reserve format areas (marked non-null temporarily false)
  const reserveFormat = () => {
    for (let i = 0; i < 9; i++) {
      if (modules[8][i] === null) setFn(i, 8, false);
      if (modules[i][8] === null) setFn(8, i, false);
    }
    for (let i = 0; i < 8; i++) {
      if (modules[8][size - 1 - i] === null) setFn(size - 1 - i, 8, false);
      if (modules[size - 1 - i][8] === null) setFn(8, size - 1 - i, false);
    }
  };
  const isFunction: boolean[][] = modules.map((row) =>
    row.map((c) => c !== null)
  );
  reserveFormat();
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (modules[y][x] !== null) isFunction[y][x] = true;

  // place data with mask 0 zigzag
  let bitIdx = 0;
  const dataBits: number[] = [];
  for (const cw of finalCodewords)
    for (let i = 7; i >= 0; i--) dataBits.push((cw >>> i) & 1);

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let row = 0; row < size; row++) {
      const y = ((col + 1) & 2) === 0 ? size - 1 - row : row;
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (isFunction[y][x]) continue;
        let bit = bitIdx < dataBits.length ? dataBits[bitIdx] : 0;
        bitIdx++;
        // mask pattern 0: (row+col) % 2 == 0
        if ((x + y) % 2 === 0) bit ^= 1;
        setFn(x, y, bit === 1);
      }
    }
  }

  // format info for ECC M (0b00) + mask 0
  const formatBits = computeFormatBits(0b00, 0);
  const placeFormat = (i: number, bit: Bit) => {
    // around top-left + split
    const positions: [number, number][] = [];
    if (i < 6) positions.push([8, i]);
    else if (i === 6) positions.push([8, 7]);
    else if (i === 7) positions.push([8, 8]);
    else if (i === 8) positions.push([7, 8]);
    else positions.push([14 - i, 8]);
    // mirrored
    if (i < 8) positions.push([size - 1 - i, 8]);
    else positions.push([8, size - 15 + i]);
    for (const [x, y] of positions) setFn(x, y, bit);
  };
  for (let i = 0; i < 15; i++) placeFormat(i, ((formatBits >>> i) & 1) === 1);

  return {
    size,
    modules: modules.map((row) => row.map((c) => c === true)),
  };
}

function getAlignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const size = version * 4 + 17;
  const count = Math.floor(version / 7) + 2;
  const step = Math.ceil((size - 13) / (count - 1) / 2) * 2;
  const positions = [6];
  for (let i = count - 1; i >= 1; i--) positions.push(size - 7 - (count - 1 - i) * step);
  return positions.sort((a, b) => a - b);
}

function computeFormatBits(ecc: number, mask: number): number {
  const data = (ecc << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  // return LSB-first friendly value (15 bits)
  let out = 0;
  for (let i = 0; i < 15; i++) out |= ((bits >>> i) & 1) << i;
  return out;
}
