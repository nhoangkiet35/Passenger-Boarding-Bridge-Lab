import assert from 'node:assert/strict';
import vm from 'node:vm';
import { installAdminMotion } from '../server/admin-motion.mjs';

// Verify loading behavior without navigation or network timing races.
const events = new Map(), windowEvents = new Map(), elements = [];
function element() {
 const attributes = new Map(), classes = new Set();
 return {
  setAttribute: (key, value) => attributes.set(key, value),
  getAttribute: key => attributes.get(key) ?? null,
  removeAttribute: key => attributes.delete(key),
  classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
  remove() { elements.splice(elements.indexOf(this), 1); },
 };
}
const document = {
 querySelector: () => null, querySelectorAll: () => [],
 createElement: element, body: { append: item => elements.push(item) },
 addEventListener: (name, handler) => events.set(name, handler),
};
vm.runInNewContext(`(${installAdminMotion.toString()})();`, {
 document, URL, MutationObserver: class { observe() {} },
 window: {
  matchMedia: () => ({ matches: true, addEventListener() {} }),
  location: { href: 'https://pbb.test/admin', pathname: '/admin', search: '', origin: 'https://pbb.test' },
  setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame() {},
  addEventListener: (name, handler) => windowEvents.set(name, handler),
 },
});
const click = href => events.get('click')({ button: 0, target: { closest: () => ({ href, target: '', hasAttribute: () => false, ...element() }) } });
click('https://pbb.test/admin#section');assert.equal(elements.length, 0);
click('https://other.test/');assert.equal(elements.length, 0);
click('https://pbb.test/admin/employees?download=xlsx');assert.equal(elements.length, 0);
click('https://pbb.test/admin/explore');assert.equal(elements.length, 1);
windowEvents.get('pageshow')();assert.equal(elements.length, 0);
const form = { method: 'post', ...element() }, button = element();
events.get('submit')({ defaultPrevented: true, target: form });assert.equal(elements.length, 0, 'Client-only quiz submissions must not start route loading');
events.get('submit')({ target: form, submitter: button });assert.equal(elements.length, 1);assert.equal(form.getAttribute('aria-busy'), 'true');
let blocked = false;
events.get('submit')({ target: form, preventDefault() { blocked = true; } });assert(blocked, 'Block duplicate submissions while request is pending');
windowEvents.get('pageshow')();assert.equal(form.getAttribute('aria-busy'), null);assert.equal(button.getAttribute('aria-busy'), null);assert.equal(elements.length, 0);
console.log('PASS: real navigation/form loading, quiz/hash/external/download exclusions, duplicate submissions and back-navigation reset.');
