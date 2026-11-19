// Kiem phan tinh xep hang trong v2/index.html: chay `node --test` o thu muc du an
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../v2/index.html', import.meta.url), 'utf8');
const code = html.slice(html.indexOf('//#xh-start'), html.indexOf('//#xh-end'));
assert.ok(code.length > 20, 'khong thay khoi //#xh-start ... //#xh-end');
const norm = s => s.normalize('NFC').toLowerCase().trim();
const { tally, mergeTally, rankRows } = new Function('norm', code + 'return {tally,mergeTally,rankRows};')(norm);

// tran: ten 4 nguoi (q0+q1 vs q2+q3) + ti so
const M = (a, b, c, d, sc) => ({ names: [a, b, c, d], sc });

test('tally: dem thang thua, diem ghi, diem mat cho tung nguoi', () => {
  const t = tally([M('An', 'Binh', 'Cuc', 'Dung', [21, 15])]);
  assert.deepEqual(t['an'], { name: 'An', n: 1, w: 1, l: 0, pf: 21, pa: 15 });
  assert.deepEqual(t['dung'], { name: 'Dung', n: 1, w: 0, l: 1, pf: 15, pa: 21 });
});

test('tally: tran khong co ti so thi bo qua', () => {
  const t = tally([M('An', 'Binh', 'Cuc', 'Dung')]);
  assert.deepEqual(t, {});
});

test('tally: khop ten khong phan biet hoa thuong, giu ten moi nhat', () => {
  const t = tally([M('an', 'Binh', 'Cuc', 'Dung', [21, 10]), M('An', 'Cuc', 'Binh', 'Dung', [12, 21])]);
  assert.equal(t['an'].n, 2);
  assert.equal(t['an'].name, 'An');
});

test('rankRows: % thang truoc, bang % thi so hieu so', () => {
  const t = tally([
    M('An', 'Binh', 'Cuc', 'Dung', [21, 10]), // An, Binh +11
    M('An', 'Cuc', 'Binh', 'Dung', [21, 19]), // An, Cuc +2
  ]);
  const r = rankRows(t);
  assert.deepEqual(r.map(x => [x.name, x.rank]), [['An', 1], ['Binh', 2], ['Cuc', 3], ['Dung', 4]]);
  assert.equal(r[0].pct, 100);
  assert.equal(r[1].diff, 9); // Binh: +11 roi -2
  assert.equal(r[2].diff, -9); // Cuc: -11 roi +2
  assert.equal(r[3].pct, 0);
});

test('rankRows: bang het chi so thi dong hang, hang sau nhay so', () => {
  const r = rankRows(tally([M('An', 'Binh', 'Cuc', 'Dung', [21, 10])]));
  assert.deepEqual(r.map(x => x.rank), [1, 1, 3, 3]);
});

test('mergeTally: cong don tich luy, khong sua ban goc', () => {
  const a = tally([M('An', 'Binh', 'Cuc', 'Dung', [21, 10])]);
  const b = tally([M('An', 'Cuc', 'Binh', 'Dung', [15, 21])]);
  const keep = JSON.stringify(a);
  const m = mergeTally(a, b);
  assert.deepEqual(m['an'], { name: 'An', n: 2, w: 1, l: 1, pf: 36, pa: 31 });
  assert.equal(JSON.stringify(a), keep);
});
