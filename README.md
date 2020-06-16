# interpolate

[![npm version](https://img.shields.io/npm/v/@zuze/interpolate.svg)](https://npmjs.org/package/@zuze/interpolate)
[![Coverage Status](https://coveralls.io/repos/github/zuze-lab/interpolate/badge.svg)](https://coveralls.io/github/zuze-lab/interpolate)
[![Build Status](https://travis-ci.org/zuze-lab/interpolate.svg)](https://travis-ci.org/zuze-lab/interpolate)
[![Bundle Phobia](https://badgen.net/bundlephobia/minzip/@zuze/interpolate)](https://bundlephobia.com/result?p=@zuze/interpolate)
[![install size](https://packagephobia.now.sh/badge?p=@zuze/interpolate)](https://packagephobia.now.sh/result?p=@zuze/interpolate)

Interpolate is used to perform simple interpolations and (as best possible) their reverse operations.

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

You can also use it directly in the browser by doing:

```html
<script src="https://unpkg.com/@zuze/interpolate"></script>
<script>
 // creates a global variable ZInterpolate
 const { to, from, get, set, parts } = ZInterpolate;
</script>
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

## Dynamic Array Mapping

A difficult problem is dynamically uninterpolating complex arrays to the appropriate object structure.

```js
const template = {
    options: [
        { keyToMapBy: 'a', value: '{fieldA}' },
        { keyToMapBy: 'b', value: '{fieldB}' },
        { keyToMapBy: 'c', value: '{fieldC}' },
    ],
}

const interpolated = {
    options: [
        { keyToMapBy: 'a', value: 'some val a' },
        { keyToMapBy: 'c', value: 'some val c' },
        { keyToMapBy: 'b', value: 'some val b' },
    ],  
}


to(template,interpolated);

/*
by default this would happen:
{
    fieldA: 'some val a',
    fieldB: 'some val c', 
    fieldC: 'some val b'    
}
*/
```

This can be solved by supplying the `mapper` option to `to`:

```js
const template = {
    options: [
        { keyToMapBy: 'a', value: '{fieldA}' },
        { keyToMapBy: 'b', value: '{fieldB}' },
        { keyToMapBy: 'c', value: '{fieldC}' },
    ],
}

const interpolated = {
    options: [
        { keyToMapBy: 'a', value: 'some val a' },
        { keyToMapBy: 'c', value: 'some val c' },
        { keyToMapBy: 'b', value: 'some val b' },
    ],  
}


to(template,interpolated, { 
    mapper: { 
        // [`key of field that we are mapping`]: 'keyToBeCompared'
        options: 'keyToMapBy' 
    }
});

/*
destructured correctly:
{
    fieldA: 'some val a',
    fieldB: 'some val b', 
    fieldC: 'some val c'    
}
*/
```

You can also pass a plain function that accepts the array item in the template, the array of the value and the index:

```js
const template = {
    options: [
        { keyToMapBy: 'a', value: '{fieldA}' },
        { keyToMapBy: 'b', value: '{fieldB}' },
        { keyToMapBy: 'c', value: '{fieldC}' },
    ],
}

const interpolated = {
    options: [
        { keyToMapBy: 'a', value: 'some val a' },
        { keyToMapBy: 'c', value: 'some val c' },
        { keyToMapBy: 'b', value: 'some val b' },
    ],  
}


to(template,interpolated, { 
    mapper: { 
        // the default array uninterpolater looks exactly like this:
        options: (template,arr = [],idx) => arr[idx]
    }
});
```


## API

### `to(template: string | function | object | array, value: any, options: {match: RegExp, mapper: Mapper}): Uninterpolated Object`

The `to` method is what creates the uninterpolated object from the template and value.

The `mapper` option is used to dynamically uninterpolate arrays:
```js
type MappingFunction = (template: any, arr: T[], idx: number) => T | undefined;
type Mapper = { [key: string]: string | MappingFunction } | MappingFunction;
```

### `from(template: string | function | object | array, value: object, options: {match: RegExp}): Interpolated Value`

The `from` method is what creates the interpolated value from the object

## Additional Methods

This package exposes some additional methods that are useful:

### `keyMapper(key: string, comparator?: (a,b) => a === b)`

When a `string` is given as a [mapper](#dynamic-array-mapping), a `keyMapper` is used to compare array items. A custom comparator option can be given to it as an argument.

Comparing array items at object keys is highly useful, but ff this won't suffice for your needs, you'll probably want to just define your own `MappingFunction`.

### `get(object: object, path: string, default?: any): any`

Equivalent to [lodash get](https://lodash.com/docs/4.17.15#get).

### `set(object: object, path: string, value: any, immutable?: boolean = false): any`

Equivalent to [lodash set](https://lodash.com/docs/4.17.15#set) with optional parameter to immutably set the property.

### `parts(path: string): string[]`

Parses a path like first[1].second.third.9 into parts: `['first', '1', 'second', 'third', '9']`.

### `unflatten(object: object): object`

Like `unflatten` method in [flat](https://www.npmjs.com/package/flat).