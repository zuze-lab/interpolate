import { replace } from './utils';

//  child object -> parent value
const interpolate = (template, val, options = {}) => {
  if (typeof template === 'function')
    return template(val, Object.assign({ how: 'interpolate' }, options));

  if (typeof template === 'string') return replace(template, val, options);

  if (Array.isArray(template))
    return template.map(t => interpolate(t, val, options));

  return Object.entries(template).reduce(
    (acc, entry) => (
      (acc[entry[0]] = interpolate(entry[1], val, options)), acc
    ),
    {}
  );
};

export default interpolate;
