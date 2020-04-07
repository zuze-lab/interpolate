import { unmatch, unflatten, arrayMapper } from './utils';

// parent value -> child object
const unto = (template, val, options = {}, unflat = true) => {
  const ret = val => (val && unflat ? unflatten(val) : val);

  if (typeof template === 'function')
    return ret(template(val, Object.assign({}, options, { how: 'to' })));

  if (typeof template === 'string') return ret(unmatch(template, val, options));

  if (Array.isArray(template))
    return ret(
      template.reduce(
        (acc, t, idx) =>
          Object.assign(
            acc,
            unto(
              t,
              // use the mapper option to dynamically uninterpolate the array
              arrayMapper(val, options.mapper, idx, t),
              options,
              false
            )
          ),
        {}
      )
    );

  return ret(
    Object.entries(template).reduce(
      (acc, entry) =>
        Object.assign(
          acc,
          unto(
            entry[1],
            val ? val[entry[0]] : undefined,
            Object.assign({}, options, {
              mapper: (options.mapper || {})[entry[0]],
            }),
            false
          )
        ),
      {}
    )
  );
};

export default unto;
