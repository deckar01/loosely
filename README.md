# Loosely🌱

Text loosely based on input

![loosely-watch](https://user-images.githubusercontent.com/3108007/57148023-66439700-6d8e-11e9-964c-0862a8a0ad2a.gif)

## Install

```sh
npm install --save loosely
```

## Use

```js
const { Mask } = require('loosely');

const mask = new Mask(/\d \(\d{3}\) \d{3}-\d{4}/);

const input = document.querySelector('#phone');

mask.watch(input);
// Filters the input value after every input event.

const text = mask.filter('1-800-555-1234');
// 1 (800) 555-1234

mask.validate(text);
// true

mask.sample()
// 8 (693) 906-1454
```

## Limitations

### Greed

The non-greedy operators are currently ignored. `filter` is non-greedy by
default. An important behavior of `filter` is that it inserts static parts of
the pattern automatically. Since static expressions can be repeated infinitely,
it is not possible to be greedy without encountering infinite loops or enforcing
artificial recursion limits. Choosing a path through the pattern with the
smallest number of additions leads to an intuitive experience when filtering
live input.

### Assertions (TODO)

Assertions are currently treated as normal groups. Any overlapping expressions
before a look-behind or after a look-ahead will produce invalid results.
Negative assertions are also treated as normal groups without negation, so they
will always produce invalid results. Please consider contributing any ideas or
code you have for this feature.
