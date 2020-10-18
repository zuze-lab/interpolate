import { unterpolate, interpolate, set } from '../src';

describe('unterpolate', () => {
  it('should in/unterpolate using a string', () => {
    const template = '{year}-{month}-{day}';
    const interpolated = '2019-10-01';
    const expected = {
      year: '2019',
      month: '10',
      day: '01',
    };

    expect(unterpolate(template, interpolated)).toMatchObject(expected);
    expect(interpolate(template, expected)).toBe(interpolated);
  });

  it('should allow interpolation using a function', () => {
    const template = '{year}-{month}-{day}';
    const first = {
      year: '2019',
      month: '09',
      day: '01',
    };

    const second = {
      year: '2020',
      month: '10',
      day: '15',
    };

    expect(
      interpolate(template, key => (key === 'year' ? second[key] : first[key]))
    ).toBe('2020-09-01');
  });

  it('should in/unterpolate using an array', () => {
    const template = [
      '{first.second}',
      '{second}',
      'third-{fourth.fifth}',
      '{first.first}',
      'no interpolation',
    ];
    const interpolated = [
      'joe',
      'bill',
      'third-jim',
      ['tom', 'dick', 'harry'],
      'no interpolation',
    ];
    const expected = {
      first: {
        first: ['tom', 'dick', 'harry'],
        second: 'joe',
      },
      fourth: {
        fifth: 'jim',
      },
      second: 'bill',
    };

    expect(unterpolate(template, interpolated)).toMatchObject(expected);
    expect(interpolate(template, expected)).toMatchObject(interpolated);
  });

  it('should in/unterpolate using an array using a mapping function', () => {
    const template = {
      options: [
        { keyToMapBy: 'a', value: '{fieldA}' },
        { keyToMapBy: 'b', value: '{fieldB}' },
        { keyToMapBy: 'c', value: '{fieldC}' },
      ],
    };

    const interpolated = {
      options: [
        { keyToMapBy: 'a', value: 'some val a' },
        { keyToMapBy: 'c', value: 'some val c' },
        { keyToMapBy: 'b', value: 'some val b' },
      ],
    };

    const expected = {
      fieldB: 'some val b',
      fieldC: 'some val c',
      fieldA: 'some val a',
    };

    expect(unterpolate(template, interpolated).fieldB).toBe('some val c'); // no mapping function
    const mapper = { options: 'keyToMapBy' };
    expect(unterpolate(template, interpolated, { mapper })).toStrictEqual(
      expected
    );
  });

  it('should in/unterpolate using a function', () => {
    const template = {
      first: (val, opts) =>
        opts.how === 'unterpolate' ? { prop: val / 2 } : val['prop'] * 2,
    };

    const value = {
      first: 20,
    };

    const expected = {
      prop: 10,
    };

    expect(unterpolate(template, value)).toMatchObject(expected);
    expect(interpolate(template, expected)).toMatchObject(value);
  });

  it('should in/unterpolate using an object', () => {
    const template = {
      first: '{first.second}',
      second: '{second}',
      third: '{first.childA[0]}',
      fourth: ['{a}', 'b', '{c}'],
    };

    const interpolated = {
      first: 'joe',
      second: 'bill',
      third: ['tom', 'dick', 'harry'],
      fourth: ['jim', 'b', 'fred'],
    };

    const expected = {
      a: 'jim',
      c: 'fred',
      first: {
        second: 'joe',
        childA: [['tom', 'dick', 'harry']],
      },
      second: 'bill',
    };

    expect(unterpolate(template, interpolated)).toMatchObject(expected);
    expect(interpolate(template, expected)).toMatchObject(interpolated);
  });

  it('should throw an error if multiple interpolations are at a non-string value path', () => {
    const template = '{joe}-{bill}';
    const interpolated = ['first', 'second'];
    expect(() => unterpolate(template, interpolated)).toThrow();
  });

  it('should not throw an error if undefined', () => {
    expect(() =>
      unterpolate(
        {
          days: '{days}',
          minutes: '{minutes}',
          seconds: '{seconds}',
        },
        undefined
      )
    ).not.toThrow();

    expect(() => unterpolate(['joe', '{bill}'], undefined)).not.toThrow();
    expect(() => unterpolate('{fred}', undefined)).not.toThrow();
  });
});

describe('set', () => {
  it('should mutate', () => {
    const subject = {
      field: {
        first: [
          {
            j: 'fred',
          },
        ],
        second: {
          not: 'mutated',
        },
      },
    };

    const mutated = set(subject, 'field.first.0.j', 'jim');
    expect(mutated).toBe(subject);
    expect(mutated.field.first[0].j).toBe('jim');
  });

  it('should not mutate', () => {
    const subject = {
      field: {
        first: [
          {
            j: 'fred',
          },
        ],
        second: {
          not: 'mutated',
        },
      },
    };

    const immutable = set(subject, 'field.first.0.j', 'jim', true);

    expect(immutable).not.toBe(subject);
    expect(immutable.field.first[0].j).toBe('jim');
    expect(immutable.second).toBe(subject.second);
  });
});
