import test from 'ava';
import { Mask, ReverseMask } from '../src/index';

test('filtering a static string', t => {
  const mask = new Mask(/static string/);
  t.is(mask.filter('a different string.'), 'static string');
  t.is(mask.filter('a '), 'static ');
  t.is(mask.filter('a di'), 'static stri');
  t.is(mask.filter('xyz'), '');
});

test('filtering any character', t => {
  const mask = new Mask('^.$');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('b'), 'b');
  t.is(mask.filter('abc'), 'a');
  t.is(mask.filter(' 123'), ' ');
});

test('filtering a set of characters', t => {
  const mask = new Mask(/[a-c]/);
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('b'), 'b');
  t.is(mask.filter('c'), 'c');
  t.is(mask.filter('xyz'), '');
  t.is(mask.filter('ya'), 'a');
});

test('filtering an inverted set of characters', t => {
  const mask = new Mask(/[^a-c]/);
  t.is(mask.filter('x'), 'x');
  t.is(mask.filter('abc'), '');
  t.is(mask.filter('ay'), 'y');
});

test('filtering eacape codes', t => {
  const mask = new Mask(/\(\)\[\]\{\}\*\+\?\w\s\S/);
  t.is(mask.filter('()[]{}*+?f x'), '()[]{}*+?f x');
});

test('filtering zero or more matches', t => {
  const mask = new Mask(/a*/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('aa'), 'aa');
  t.is(mask.filter('ababa'), 'aaa');
  t.is(mask.filter('bb'), '');
});

test('filtering a static group', t => {
  const mask = new Mask(/(a group)/);
  t.is(mask.filter('some input'), 'a group');
});

test('filtering an exact number of matches', t => {
  const mask = new Mask(/a{3}/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('aa'), 'aa');
  t.is(mask.filter('ababa'), 'aaa');
  t.is(mask.filter('ababaaa'), 'aaa');
  t.is(mask.filter('bb'), '');
});

test('filtering a minimum number of matches', t => {
  const mask = new Mask(/a{3,}/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('aa'), 'aa');
  t.is(mask.filter('ababa'), 'aaa');
  t.is(mask.filter('ababaaa'), 'aaaaa');
  t.is(mask.filter('bb'), '');
});

test('filtering a range of matches', t => {
  const mask = new Mask(/a{3,5}/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('aa'), 'aa');
  t.is(mask.filter('ababa'), 'aaa');
  t.is(mask.filter('ababaaa'), 'aaaaa');
  t.is(mask.filter('ababaaaaaa'), 'aaaaa');
  t.is(mask.filter('bb'), '');
});

test('filtering optional matches', t => {
  const mask = new Mask(/ab?c/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('ab'), 'ab');
  t.is(mask.filter('abc'), 'abc');
  t.is(mask.filter('abcd'), 'abc');
  t.is(mask.filter('adc'), 'ac');
  t.is(mask.filter('bc'), 'abc');
  t.is(mask.filter('c'), 'ac');
  t.is(mask.filter('d'), '');
});

test('filtering one or more matches', t => {
  const mask = new Mask(/a+/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('aa'), 'aa');
  t.is(mask.filter('ababa'), 'aaa');
  t.is(mask.filter('bb'), '');
});

test('filtering a static choice', t => {
  const mask = new Mask(/carrots|onions/);
  t.is(mask.filter('carrots'), 'carrots');
  t.is(mask.filter('onions'), 'onions');
  t.is(mask.filter('b'), '');
  t.is(mask.filter('be'), '');
  t.is(mask.filter('bee'), '');
  t.is(mask.filter('beet'), 'carrot');
  t.is(mask.filter('beets'), 'carrots');
});

test('filtering a phone number', t => {
  const mask = new Mask(/\(\d{3}\) \d{3}-\d{4} (x\d+)?/);
  t.is(mask.filter('4'), '(4');
  t.is(mask.filter('41'), '(41');
  t.is(mask.filter('410'), '(410');
  t.is(mask.filter('4105'), '(410) 5');
  t.is(mask.filter('41055'), '(410) 55');
  t.is(mask.filter('410555'), '(410) 555');
  t.is(mask.filter('4105559'), '(410) 555-9');
  t.is(mask.filter('41055598'), '(410) 555-98');
  t.is(mask.filter('410555987'), '(410) 555-987');
  t.is(mask.filter('4105559876'), '(410) 555-9876');
  t.is(mask.filter('4105559876 x'), '(410) 555-9876 x');
  t.is(mask.filter('4105559876 x1'), '(410) 555-9876 x1');
  t.is(mask.filter('4105559876 x12'), '(410) 555-9876 x12');
  t.is(mask.filter('4105559876 x123'), '(410) 555-9876 x123');
  t.is(mask.filter('4105559876 x1234'), '(410) 555-9876 x1234');
  t.is(mask.filter('4'), '(4');
  t.is(mask.filter('41'), '(41');
  t.is(mask.filter('410'), '(410');
  t.is(mask.filter('410-'), '(410');
  t.is(mask.filter('410-5'), '(410) 5');
  t.is(mask.filter('410-55'), '(410) 55');
  t.is(mask.filter('410-555'), '(410) 555');
  t.is(mask.filter('410-555-'), '(410) 555-');
  t.is(mask.filter('410-555-9'), '(410) 555-9');
  t.is(mask.filter('410-555-98'), '(410) 555-98');
  t.is(mask.filter('410-555-987'), '(410) 555-987');
  t.is(mask.filter('410-555-9876'), '(410) 555-9876');
});

test('filtering an empty recursive group', t => {
  const mask = new Mask(/()*/);
  t.is(mask.filter('abc'), '');
});

test('filtering a recursive group', t => {
  const mask = new Mask(/(ab)*/);
  t.is(mask.filter('abcdacdb'), 'abab');
});

test('filtering a recursive group with branches', t => {
  const mask = new Mask(/(a?bc)*/);
  t.is(mask.filter('abcdcdb'), 'abcbcb');
});

test('filtering a repeated group', t => {
  const mask = new Mask(/(ab){2}/);
  t.is(mask.filter('abcdcdb'), 'abab');
});

test('selecting the longest path', t => {
  const mask = new Mask(/a|ab|abc/);
  t.is(mask.filter('abc'), 'abc');
});

test('filtering non-matching groups', t => {
  const mask = new Mask(/(?:abc)/);
  t.is(mask.filter('abc'), 'abc');
});

test('capturing lookahead assertions', t => {
  const mask = new Mask(/ab(?=c)/);
  t.is(mask.filter('abc'), 'abc');
});

test('capturing lookbehind asserions', t => {
  const mask = new Mask(/(?<=a)bc/);
  t.is(mask.filter('abc'), 'abc');
});

test('ignoring negative lookahead asserions', t => {
  // TODO: Don't match the "c".
  const mask = new Mask(/ab(?!c)/);
  t.is(mask.filter('abc'), 'abc');
});

test('ignoring non-greedy repeats', t => {
  const mask = new Mask(/a+?bc/);
  t.is(mask.filter('bc'), 'abc');
  t.is(mask.filter('abc'), 'abc');
  t.is(mask.filter('aabc'), 'aabc');
  t.is(mask.filter('abababc'), 'abc');
  t.is(mask.filter('bbc'), 'abc');
});

test('ignoring non-greedy optional repeats', t => {
  const mask = new Mask(/a*?bc/);
  t.is(mask.filter('bc'), 'bc');
  t.is(mask.filter('abc'), 'abc');
  t.is(mask.filter('aabc'), 'aabc');
  t.is(mask.filter('abababc'), 'abc');
  t.is(mask.filter('bbc'), 'bc');
});

test('ignoring non-greedy optionals', t => {
  const mask = new Mask(/ab??c/);
  t.is(mask.filter(''), '');
  t.is(mask.filter('a'), 'a');
  t.is(mask.filter('ab'), 'ab');
  t.is(mask.filter('abc'), 'abc');
  t.is(mask.filter('abcd'), 'abc');
  t.is(mask.filter('adc'), 'ac');
  t.is(mask.filter('bc'), 'abc');
  t.is(mask.filter('c'), 'ac');
  t.is(mask.filter('d'), '');
});

test('ignoring non-greedy fixed repeats', t => {
  const mask = new Mask(/a{2}?bc/);
  t.is(mask.filter('bc'), 'aabc');
  t.is(mask.filter('abc'), 'aabc');
  t.is(mask.filter('aabc'), 'aabc');
  t.is(mask.filter('abababc'), 'aabc');
  t.is(mask.filter('bbc'), 'aabc');
});

test('selecting the shortest path', t => {
  const mask = new Mask(/ab(ggg|gg|g)c/);
  t.is(mask.filter('abc'), 'abgc');
});

test('filtering in reverse', t => {
  const mask = new ReverseMask(/(\d{1,3},)*\d{3}|\d{1,3}/);
  t.is(mask.filter('1'), '1');
  t.is(mask.filter('12'), '12');
  t.is(mask.filter('123'), '123');
  t.is(mask.filter('1234'), '1,234');
  t.is(mask.filter('12345'), '12,345');
});
