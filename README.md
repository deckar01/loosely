# Loosely

Text loosely based on input

---

## Install

```sh
npm install --save loosely
```

## Use

```js
import Loosely from 'loosely';

const input = '1-800-555-1234';
const mask = Loosely.Mask(/\d \(\d{3}\) \d{3}-\d{4}/);
const output = mask.filter(input);
// 1 (800) 555-1234
mask.validate(output);
// true
```
