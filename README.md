# Loosely

Text loosely based on input

---

## Install

```sh
npm install --save loosely
```

## Use

```js
import { Mask } from 'loosely';

const mask = new Mask(/\d \(\d{3}\) \d{3}-\d{4}/);

const text = mask.filter('1-800-555-1234');
// 1 (800) 555-1234

mask.validate(text);
// true
```
