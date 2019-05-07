# Loosely🌱

Text loosely based on input

![loosely-watch](https://user-images.githubusercontent.com/3108007/57148023-66439700-6d8e-11e9-964c-0862a8a0ad2a.gif)

## Why?

You are probably already using regular expressions to validate user input.
Leverage those existing patterns to help users format their input instead of
showing them error messages.

## How?

Loosely parses the regex into a graph. Each node in the graph has a set of
characters that it accepts. Each time the user types a character, the graph is
searched to see if the text represents a path through the graph. If a node only
accepts one character, the search is allowed to insert that character into the
path. The result is that required parts of the mask are automatically inserted,
and alternate variations are silently coaxed into the desired format while the
user is typing.

## Install

```sh
npm install --save loosely
```

## Use

Construct a `Mask` instance from a regular expression.

```js
const { Mask } = require('loosely');

const mask = new Mask(/\d \(\d{3}\) \d{3}-\d{4}/);
```

### DOM Watcher

Filter input as the user is typing into a DOM input.

```js
const input = document.querySelector('#phone');

mask.watch(input);
```

### Low Level API

`filter(text)` returns a string that at least partially matches the mask.

`validate(text)` determines if the text completely matches the mask.

`sample()` returns a random string that matches the mask.

```js
const text = mask.filter('1-800-555-1234');
// 1 (800) 555-1234

mask.validate(text);
// true

mask.sample()
// 8 (693) 906-1454
```

## TODO

### Assertions

Assertions are currently treated as normal groups. Any overlapping expressions
before a look-behind or after a look-ahead will produce invalid results.
Negative assertions are also treated as normal groups without negation, so they
will always produce invalid results. Please consider contributing any ideas or
code you have for this feature.
