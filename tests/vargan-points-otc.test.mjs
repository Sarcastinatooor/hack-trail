import assert from 'node:assert/strict'
import test from 'node:test'
import { VARGAN_BRIDGES, VARGAN_OUTFLOWS, VARGAN_POINTS_OTC_DATA } from '../src/data/vargan-points-otc.ts'

const microUsdc = (transfers) => transfers.reduce((sum, transfer) => sum + BigInt(Math.round(transfer.amount * 1e6)), 0n)

test('public escrow and onward routes reconcile without counting proceeds as new losses', () => {
  assert.equal(VARGAN_OUTFLOWS.length, 5)
  assert.equal(VARGAN_BRIDGES.length, 8)
  assert.equal(microUsdc(VARGAN_OUTFLOWS), 511118320019n)
  assert.equal(microUsdc(VARGAN_BRIDGES), microUsdc(VARGAN_OUTFLOWS))
  for (const recipient of new Set(VARGAN_OUTFLOWS.map(t => t.to))) {
    assert.equal(microUsdc(VARGAN_OUTFLOWS.filter(t => t.to === recipient)), microUsdc(VARGAN_BRIDGES.filter(t => t.from === recipient)))
  }
  assert.equal(VARGAN_POINTS_OTC_DATA.incident.loss_usd, 0)
  assert.equal(VARGAN_POINTS_OTC_DATA.incident.observed_outflow_usd, 511118.320019)
  assert.equal(VARGAN_POINTS_OTC_DATA.incident.assessment, 'suspected')
})

test('all 13 stages have unique source transactions, evidence and chronological step numbers', () => {
  const hops = VARGAN_POINTS_OTC_DATA.hops
  assert.equal(hops.length, 13)
  assert.equal(new Set(hops.map(h => h.evidence.transaction)).size, 13)
  for (const [index, hop] of hops.entries()) {
    assert.equal(hop.step, index + 1)
    assert(index === 0 || hop.ts >= hops[index - 1].ts)
    assert.match(hop.evidence.transaction, /^0x[0-9a-f]{64}$/)
    assert.equal(hop.evidence.url, `https://arbiscan.io/tx/${hop.evidence.transaction}`)
  }
})

test('tracked addresses are contextual recipients, not unproven attacker labels or bridge infrastructure', () => {
  const wallets = VARGAN_POINTS_OTC_DATA.tracked_wallets
  assert.equal(wallets.length, 10)
  assert.equal(wallets.filter(w => w.role === 'victim').length, 1)
  assert(wallets.every(w => w.role !== 'attacker'))
  assert(wallets.every(w => /^0x[0-9a-f]{40}$/i.test(w.address)))
  assert(!wallets.some(w => w.address.toLowerCase() === '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae'))
  assert(VARGAN_POINTS_OTC_DATA.limitations.some(note => note.includes('not confirmed net customer loss')))
})
