import { interpolate } from './utils';

//  child object -> parent value
const unfrom = (template, val, options = {}) => {
  if (typeof template === 'function')
    return template(val, Object.assign({ how: 'from' }, options));

  if (typeof template === 'string') return interpolate(template, val, options);

  if (Array.isArray(template))
    return template.map(t => unfrom(t, val, options));

  return Object.entries(template).reduce(
    (acc, entry) => ((acc[entry[0]] = unfrom(entry[1], val, options)), acc),
    {}
  );
};

export default unfrom;
