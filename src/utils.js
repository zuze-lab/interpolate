export const interpolate = (template, val, options) => {
  let fullReplacement;
  const match = options.match || MATCHER_REGEX;
  const matched = template.match(match);

  // template doesn't contain any interpolation points
  if (!matched) return template;

  // if the template is equal to a single interpolation point - e.g. '{full.name}'
  // then set a flag to return the full entity retrieved from the getter (full entity could be an array, object, or something else)
  const replaceFull = matched.length === 1 && matched[0] === template;

  // interpolation function
  const replaced = template.replace(match, (_, t) => {
    const replaceWith = getter(t, val);

    if (!replaceFull) return replaceWith || '';

    // flag is set so we don't care about replacements being
    // applied to the template - we only need the first replacement
    fullReplacement = replaceWith;
    return '';
  });

  return replaceFull ? fullReplacement : replaced;
};

export const unmatch = (template, val, options) => {
  const match = options.match || MATCHER_REGEX;
  const groups = [];
  // convert a template to a regexp such that
  // {year}-{month}-{day} becomes (.*)-(.*)-(.*)
  const regexp = new RegExp(
    template.replace(match, (_, m) => {
      // while we're at it, put the name of what is being interpolated - e.g. year in {year} or month in {month}
      // in the array "groups"
      return groups.push(m), `(.*)`;
    })
  );

  // if the value we're unmatching is NOT a string
  // e.g.
  // template: '{first.first}'
  // value: ['tom','dick','harry']
  if (typeof val !== 'string') {
    // then there SHOULD only be ONE matching group - e.g. '{first.first}' - if not, user error
    if (groups.length > 1)
      throw new Error(
        `Cannot unterpolate a string template against a non-string value`
      );
    const o = {};
    return (o[groups[0]] = val), o;
  }

  const matches = val.match(regexp);

  // for each interpolation parameter return the corresponding match
  // tried to do this with named capture groups, but characters are restrictive
  // which is why we just use the groups array
  return groups.reduce(
    (acc, k, idx) => ((acc[k] = matches ? matches[idx + 1] : undefined), acc),
    {}
  );
};

export const unflatten = obj =>
  Object.entries(obj).reduce((acc, p) => setter(p[0], acc, p[1]), {});

export const clone = obj => (Array.isArray(obj) ? [...obj] : { ...obj });

// custom getter/setter based on property-expr, but create the path if it doesn't exist
export const setter = (path, obj, val, { immutable = false } = {}) => {
  const _clone = w => (immutable ? clone(w) : w);
  const start = _clone(obj);

  return normalizePath(path).reduce((data, part, idx, arr) => {
    const nextData = !data[part]
      ? (data[part] = (arr[idx + 1] || '').match(DIGIT_REGEX) ? [] : {})
      : data[part];

    return idx === arr.length - 1
      ? ((data[part] = val), start)
      : (data[part] = _clone(nextData));
  }, start);
};

export const getter = (path, obj, def) => {
  const next = normalizePath(path).reduce(
    (acc, part) => (!acc ? acc : acc[part]),
    obj
  );
  return next === undefined ? def : next;
};

// inline parts from property-expr
const normalizePath = path =>
  split(path).map(part => part.replace(CLEAN_QUOTES_REGEX, '$2'));

const split = path => path.match(SPLIT_REGEX);

const MATCHER_REGEX = /\{(.+?)\}/g;
const SPLIT_REGEX = /[^.^\]^[]+|(?=\[\]|\.\.)/g;
const DIGIT_REGEX = /^\d+$/;
const CLEAN_QUOTES_REGEX = /^\s*(['"]?)(.*?)(\1)\s*$/;
