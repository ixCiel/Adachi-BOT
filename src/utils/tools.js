import lodash from "lodash";
import fnv from "fnv-plus";
import levenshtein from "fastest-levenshtein";

const similarityMaxValue = 0.5;

function randomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

// return [match, new, origin]
function getWordByRegex(text, regstr) {
  let r = regstr;
  let w;

  if ("string" === typeof r) {
    r = new RegExp(r, "i");
  }

  if (r instanceof RegExp && (w = r.exec(text))) {
    return [w[0], text.replace(r, "").trim(), text];
  }

  return [undefined, undefined, text];
}

function filterWordsByRegex(text, ...rest) {
  for (const r of rest) {
    const unmatch = getWordByRegex(text, r)[1];

    if ("string" === typeof unmatch) {
      text = unmatch;
    }
  }

  return text;
}

// 英文数字空格分割，中文按字分割
function segment(text) {
  const regex = /\b(\w|\d)+?\b/g;
  return lodash.concat([], text.match(regex), [...(text.replace(regex, "").replace(/\s/g, "") || [])]);
}

function simhash(text) {
  const seg = segment(text);
  const km = new Map();
  const hm = new Map();
  let result = "";

  seg.map((k) => km.set(k, km.has(k) ? km.get(k) + 1 : 1));
  km.forEach((v, k) => {
    const hash64 = fnv.hash(k, 64);
    const h = parseInt("0x" + hash64.hex())
      .toString(2)
      .padStart(64, "0");

    for (let i = 0; i < h.length; i++) {
      const v1 = parseInt(h[i]);
      const v2 = v * (v1 > 0 ? 1 : -1);
      hm.set(i, hm.has(i) ? hm.get(i) + v2 : v2);
    }
  });

  for (let i = 0; i < 64; i++) {
    hm.set(i, hm.get(i) > 0 ? 1 : 0);
    result = result + hm.get(i);
  }

  return result;
}

function hamming(h1, h2) {
  let d = 0;

  for (let i = 0; i < Math.min(h1.length, h2.length); i++) {
    if (h1[i] !== h2[i]) {
      d++;
    }
  }

  return d;
}

function similarity(s1, s2) {
  return "string" === typeof s1 && "string" === typeof s2
    ? levenshtein.distance(s1, s2) / Math.max(s1.length, s2.length)
    : Number.MAX_SAFE_INTEGER;
}

function isPossibleName(name, names) {
  if ("string" === typeof name) {
    const s1 = name;

    for (const s2 of names) {
      if ("string" === typeof s2 && similarity(s1, s2) <= similarityMaxValue) {
        return true;
      }
    }
  }

  return false;
}

function guessPossibleNames(name, names) {
  let words = [];

  if ("string" === typeof name && names.length > 0) {
    let bestMatch = false;
    const sorted = lodash
      .chain(names)
      .reduce((p, v, k) => {
        if (false === bestMatch) {
          const l = name.length / v.length;
          if ((v.startsWith(name) || v.endsWith(name)) && l >= 0.5) {
            if (0 === (p[v] = 1 - l)) {
              bestMatch = true;
            }
          } else {
            const n = similarity(name, v);
            n <= similarityMaxValue && (p[v] = n);
          }
        }
        return p;
      }, {})
      .toPairs()
      .sortBy(1)
      .value();

    if (sorted.length > 0 && 1 === lodash.filter(sorted, (c) => c[1] === sorted[0][1]).length) {
      words = [global.names.allAlias[sorted[0][0]] || sorted[0][0]];
    } else {
      words = lodash
        .chain(sorted)
        .fromPairs()
        .keys()
        .map((c) => global.names.allAlias[c] || c)
        .uniq()
        .value();
    }
  }

  return words;
}

export {
  filterWordsByRegex,
  getRandomInt,
  getWordByRegex,
  guessPossibleNames,
  hamming,
  isPossibleName,
  randomString,
  segment,
  simhash,
  similarity,
  similarityMaxValue,
};
