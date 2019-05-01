import test from 'ava';
import { Mask } from '../src/index';

test('sample a static string', t => {
  const mask = new Mask(/static string/);
  t.is(mask.sample(), 'static string');
});

test('filtering any character', t => {
  const mask = new Mask(/./);
  t.is(mask.sample().length, 1);
});

test('filtering a static group', t => {
  const mask = new Mask(/(a group)/);
  t.is(mask.sample(), 'a group');
});
