import test from 'ava';
import browserEnv from 'browser-env';
import { Mask } from '../src/index';

browserEnv(['document', 'Event']);

test('watch an input', t => {
  const mask = new Mask(/static string/);
  const input = document.createElement('input');
  mask.watch(input);

  input.value = 'staticstring';
  const event = new Event('input', {bubbles: true});
  input.dispatchEvent(event);

  t.is(input.value, 'static string');
});
