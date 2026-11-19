// Kiem phan tu dien gioi/trinh tu danh sach cu trong index.html: chay `node --test` o thu muc du an
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const code = html.slice(html.indexOf('//#td-start'), html.indexOf('//#td-end'));
assert.ok(code.length > 20, 'khong thay khoi //#td-start ... //#td-end');
const norm = s => s.normalize('NFC').toLowerCase().trim();
const deacc = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
const { remember, fillKnown, mergeKnown } = new Function('norm', 'deacc', code + 'return {remember,fillKnown,mergeKnown};')(norm, deacc);

test('mergeKnown: danh sach goc lam nen; may da sua (co gioi) thi thang; muc thieu gioi khong de len goc', () => {
  const goc = { 'kha': { name: 'Kha', g: 'M', lv: 'A' }, 'hiền': { name: 'Hiền', g: 'F', lv: 'B' } };
  const may = { 'kha': { name: 'Kha', g: '', lv: 'C' }, 'hiền': { name: 'Hiền', g: 'F', lv: 'A' }, 'mới': { name: 'Mới', g: '', lv: 'C' } };
  const m = mergeKnown(goc, may);
  assert.deepEqual(m['kha'], { name: 'Kha', g: 'M', lv: 'A' });
  assert.deepEqual(m['hiền'], { name: 'Hiền', g: 'F', lv: 'A' });
  assert.deepEqual(m['mới'], { name: 'Mới', g: '', lv: 'C' });
});

test('remember: nho gioi + trinh, bo qua nguoi chua co gi', () => {
  const k = {};
  remember(k, { name: 'Toại', g: 'M', lv: 'B' });
  remember(k, { name: 'Lan', g: '', lv: '' });
  assert.deepEqual(k['toại'], { name: 'Toại', g: 'M', lv: 'B' });
  assert.equal(k['lan'], undefined);
});

test('remember: thieu 1 truong thi giu gia tri cu', () => {
  const k = { 'hiền': { name: 'Hiền', g: 'F', lv: 'C' } };
  remember(k, { name: 'Hiền', g: '', lv: 'B' });
  assert.deepEqual(k['hiền'], { name: 'Hiền', g: 'F', lv: 'B' });
});

test('fillKnown: dien cho ten trong, khop khong dau (lay ten da luu), giu gia tri da ghi', () => {
  const k = { 'toại': { name: 'Toại', g: 'M', lv: 'B' }, 'hiền': { name: 'Hiền', g: 'F', lv: 'C' } };
  const out = fillKnown([{ name: 'Toai', g: '', lv: '' }, { name: 'Hiền', g: '', lv: 'A' }, { name: 'Mới', g: '', lv: '' }], k);
  assert.deepEqual(out[0], { name: 'Toại', g: 'M', lv: 'B', auto: true });
  assert.deepEqual(out[1], { name: 'Hiền', g: 'F', lv: 'A', auto: true });
  assert.deepEqual(out[2], { name: 'Mới', g: '', lv: '' });
});
