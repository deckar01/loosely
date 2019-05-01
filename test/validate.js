import test from 'ava';
import { Mask } from '../src/index';

test('validate a static string', t => {
  const mask = new Mask(/static string/);
  t.is(mask.validate('static string'), true);
  t.is(mask.validate('bad value'), false);
});
