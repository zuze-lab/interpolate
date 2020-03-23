# interpolate

[![npm version](https://img.shields.io/npm/v/@zuze/interpolate.svg)](https://npmjs.org/package/@zuze/interpolate)
[![Coverage Status](https://coveralls.io/repos/github/zuze-lab/interpolate/badge.svg)](https://coveralls.io/github/zuze-lab/interpolate)
[![Build Status](https://travis-ci.org/zuze-lab/interpolate.svg)](https://travis-ci.org/zuze-lab/interpolate)
[![Bundle Phobia](https://badgen.net/bundlephobia/minzip/@zuze/interpolate)](https://bundlephobia.com/result?p=@zuze/interpolate)

Interpolate is used to map a template (`string`, `array`, `object`) and value to an object representation **and back again**.

```js
import { interpolate, unterpolate } from '@zuze/interpolate';

const template = '{year}-{month}-{day}';
const interpolated = '2019-10-01';

unterpolate(template,interpolated) 
/*
{
    year:'2019',
    month:'10',
    day:'01'
}
*/

interpolate(template,{
    year:'2019',
    month:'10',
    day:'01'
});

// '2019-10-01'
```

## Installation

Same as usual, npm:
```
npm install @zuze/interpolate
```

or yarn:
```
yarn add @zuze/interpolate
```

## Usage

Interpolations are ubiquitous, from the first templating engines, to internationalization, etc.

Interpolations don't have to just work for creating strings, however. With the right tools, it can be used to create more complex data transformations, which is the purpose of `interpolate`.

### Aliases

- **`to === unterpolate`** - map a template and an interpolated value to an object
- **`from === interpolate`** - map an object using a template to an interpolated value

### simple string mapping

In addition to simple string mapping (see the first `to`/`from` example) `interpolate` supports nested transformations care.

```js
import { to, from } from '@zuze/interpolate';


const template = '{first.second}-{first.third}-something-{first.fifth[0]}';
const interpolated = '2019-10-something-01';

to(template,interpolated) 

/*
{
    first: {
        second:'2019',
        third:'10',
        fifth:['01']
    }
}
*/

from(template,{
    first: {
        second:'2019',
        third:'10',
        fifth:['01','02','03','04'] // extraneous values will be ignored
    }
});

// '2019-10-something-01'


```

### complex object/array mapping

We don't only `interpolate` an object's values to a string, we can interpolate them into a complex structure:

#### interpolated value is an array

```js
const template = ['{first}','{second.first}','{third}-something'];
const interpolated = [['an','array'],20,'somestring-something'];

to(template,interpolated);
/*
{
    first: ['an','array'],
    second: {
        first:20
    },
    third: 'somestring'
}
*/

// and magically...

from(template,{
    first:{
        first:'a',
        second:'b',
    },
    second: {
        first:['an','array']
    },
    third:'must be a string'
});

/*
[
    {
        first:'a',
        second:'b'
    },
    ['an','array'],
    'must be a string-something'
]
*/

```

#### interpolated value is an object

```js
const template = {
    first:'{someKey}',
    second: {
        third: '{first.first.0}'
    },
    fourth:[
        'key1', // no { }
        '{key1}',
        '{first.second}'
    ]
}

const interpolated = {
    first:'something',
    second: {
        third: ['joe']
    },
    fourth: [
        'key1',
        'tom',
        'bill'
    ]
}

to(template,interpolated);
/*
{
    someKey:'something',
    first: {
        first:['joe'],
        second:'bill'
    },
    key1:'tom',
}
*/


```

### in/unterpolating using a function

Truth be told, `unterpolate` was created to be able to do transformations through configuration which, under the circumstances in which it was developed,  generally meant "through strings".

For full flexibility, `interpolate` does support using a function to perform `interpolations` and their reverse operations.

The function receives the the `value` being in/unterpolated and the options given to the `to/from` function with a key of `how` whose value is either `to` or `from`.

Note: If `to` the return value from the function **must be false-y or an object** - anything else will throw an error.

```js
import { to, from } from '@zuze/interpolate';

const template = {
    first: (val, opts) => opts.how === 'to' ? { prop: val / 2 } : val['prop'] * 2
};

const value = {
    first: 20,
};

const expected = {
    prop: 10,
};

to(template,value); // { prop: 10 }
from(template,expected); // { first: 20 }
```

### `match` regexp

The default `RegExp` that determines what is an interpolation is `/\{(.+?)\}/g` - or **anything enclosed in curly braces** - i.e. `{first}`.

An object is created out of the matched strings which is then [unflattened](https://www.npmjs.com/package/flat#unflattenoriginal-options) to create non-trivial structures.

You can pass a different `match` regexp, if it suits your purposes, to `to` and `from` like so:

```js

const template = '$year$-$month$-$day$'
to(template,'2019-10-01',{match:/\$(.+?)\$/g})

/*
{
    year:'2019',
    month:'10',
    day:'01'
}
*/

```

## API

### `to(template: string | function | object | array, value: any, options: {match: RegExp}): Uninterpolated Object`

The `to` method is what creates the uninterpolated object from the template and value.

### `from(template: string | function | object | array, value: object, options: {match: RegExp}): Interpolated Value`

The `from` method is what creates the interpolated value from the object

##

[npm-image]: http://img.shields.io/npm/v/frisbee.svg?style=flat

[npm-url]: https://npmjs.org/package/@zuze/interpolate