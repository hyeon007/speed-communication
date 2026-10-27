import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractModelNames,
  findCandidates,
  parseFeedEntries,
  readCatalogNames,
} from '../scripts/check-new-devices.mjs';

test('extracts iPhone and Galaxy phone names, ignoring other products', () => {
  assert.deepEqual(extractModelNames('Apple debuts iPhone 18 Pro and iPhone 18 Pro Max'), [
    'iPhone 18 Pro',
    'iPhone 18 Pro Max',
  ]);
  assert.deepEqual(extractModelNames('iPhone Duo arrives at Apple Store locations worldwide'), ['iPhone Duo']);
  assert.deepEqual(
    extractModelNames('A First Look at Galaxy Z Fold8 Ultra, Galaxy Z Fold8 and Galaxy Z Flip8'),
    ['Galaxy Z Fold8 Ultra', 'Galaxy Z Fold8', 'Galaxy Z Flip8'],
  );
  assert.deepEqual(extractModelNames('Galaxy S27+ and Galaxy S27 Ultra'), ['Galaxy S27+', 'Galaxy S27 Ultra']);
  assert.deepEqual(extractModelNames('A Day With Galaxy Buds On'), []);
  assert.deepEqual(extractModelNames('Apple gives iPad mini its biggest update ever'), []);
});

test('understands Korean newsroom titles', () => {
  assert.deepEqual(extractModelNames("[체험기] '갤럭시 Z 폴드8'과 함께한 가을 독서 나들이"), ['Galaxy Z Fold8']);
  assert.deepEqual(extractModelNames('SKT 전용 갤럭시 퀀텀8 출시'), ['Galaxy Quantum8']);
});

test('parses Atom and RSS feeds', () => {
  const atom =
    '<feed><entry><title><![CDATA[iPhone Duo arrives\n]]></title><link href="https://apple.example/duo"/>' +
    '<link href="https://apple.example/img.jpg" rel="enclosure"/></entry></feed>';
  assert.deepEqual(parseFeedEntries(atom), [{ title: 'iPhone Duo arrives', link: 'https://apple.example/duo' }]);

  const rss = '<rss><channel><title>Feed</title><item><title><![CDATA[Galaxy A58]]></title><link>https://s.example/a58</link></item></channel></rss>';
  assert.deepEqual(parseFeedEntries(rss), [{ title: 'Galaxy A58', link: 'https://s.example/a58' }]);
});

test('reports only models missing from the catalog, once each', () => {
  const catalog = readCatalogNames("{ name: 'iPhone 18 Pro', }, { name: 'Galaxy Z Fold8', }");
  const candidates = findCandidates(
    [
      { title: 'Apple debuts iPhone 18 Pro and iPhone Duo', link: 'a' },
      { title: 'Open up to new possibilities with iPhone Duo', link: 'b' },
      { title: '갤럭시 Z 폴드8 체험기', link: 'c' },
    ],
    catalog,
  );
  assert.deepEqual(candidates, [{ name: 'iPhone Duo', title: 'Apple debuts iPhone 18 Pro and iPhone Duo', link: 'a' }]);
});
