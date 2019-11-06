import test from 'ava';
import { Mask, ReverseMask } from '../src/index';

test('sample a static string', t => {
  const mask = new Mask(/static string/);
  t.is(mask.sample(), 'static string');
});

test('sampling any character', t => {
  const mask = new Mask(/./);
  t.is(mask.sample().length, 1);
});

test('sampling a static group', t => {
  const mask = new Mask(/(a group)/);
  t.is(mask.sample(), 'a group');
});

test('reverse sample a static string', t => {
  const mask = new ReverseMask(/static string/);
  t.is(mask.sample(), 'static string');
});
