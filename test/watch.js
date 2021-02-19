import test from 'ava';
import browserEnv from 'browser-env';
import { Mask } from '../src/index';

browserEnv(['window']);

test('watch an input', t => {
  const mask = new Mask(/static string/);
  const input = window.document.createElement('input');
  mask.watch(input);

  input.value = 'staticstring';
  const event = new window.Event('input', {bubbles: true});
  input.dispatchEvent(event);

  t.is(input.value, 'static string');
});
