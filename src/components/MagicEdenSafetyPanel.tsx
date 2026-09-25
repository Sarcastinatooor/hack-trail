"use client"

import { useState } from "react"

interface WalletProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

const OPERATORS = [
  { address: "0x00000000000000adC04C56Bf30aC9d3c0aAF14dC", label: "Seaport 1.5 marketplace operator" },
  { address: "0x0000000000000068F116a894984e2DB1123eB395", label: "Seaport 1.6 marketplace operator" },
]

const IS_APPROVED_FOR_ALL = "0xe985e9c5"
const SET_APPROVAL_FOR_ALL = "0xa22cb465"

function shortAddr(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function padAddress(address: string) {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0")
}

function encodeApprovalCall(owner: string, operator: string) {
  return `${IS_APPROVED_FOR_ALL}${padAddress(owner)}${padAddress(operator)}`
}

function encodeRevokeCall(operator: string) {
  return `${SET_APPROVAL_FOR_ALL}${padAddress(operator)}${"0".repeat(63)}1`.replace(/1$/, "0")
}

interface RiskRow {
  collection: string
  operator: (typeof OPERATORS)[number]
}

export function MagicEdenSafetyPanel() {
  const [address, setAddress] = useState("")
  const [rows, setRows] = useState<RiskRow[]>([])
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const provider = typeof window !== "undefined" ? (window as Window & { ethereum?: WalletProvider }).ethereum : undefined

  async function connectAndScan() {
    if (!provider) {
      setError("No injected EVM wallet found. Install MetaMask or Rabby.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[]
      const account = accounts[0]
      const chainId = await provider.request({ method: "eth_chainId" }) as string
      if (!account) throw new Error("Wallet connection returned no address")
      if (chainId.toLowerCase() !== "0x1") throw new Error("Switch your wallet to Ethereum mainnet to scan and revoke NFT approvals.")

      const res = await fetch(`/api/wallet/${account}/transfers?chain=ethereum&limit=100`, { cache: "no-store" })
      const json = await res.json()
      const collections = [...new Set((json.data ?? []).filter((item: { contract_address?: string; token_id?: string }) => item.contract_address && item.token_id).map((item: { contract_address: string }) => item.contract_address.toLowerCase()))] as string[]
      const findings: RiskRow[] = []

      for (const collection of collections.slice(0, 40)) {
        for (const operator of OPERATORS) {
          const result = await provider.request({
            method: "eth_call",
            params: [{ to: collection, data: encodeApprovalCall(account, operator.address) }, "latest"],
          }) as string
          if (result.endsWith("1")) findings.push({ collection, operator })
        }
      }

      setAddress(account)
      setRows(findings)
      setMessage(findings.length ? "Active marketplace approvals found. Review each revoke transaction in your wallet." : "No active Seaport approvals found on the NFT contracts seen in this wallet.")
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Approval scan failed")
    } finally {
      setLoading(false)
    }
  }

  async function revoke(row: RiskRow) {
    if (!provider || !address) return
    const key = `${row.collection}:${row.operator.address}`
    setRevoking(key)
    setError("")
    setMessage("Review the revoke transaction in your wallet. It will set this NFT operator approval to false.")
    try {
      await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to: row.collection, data: encodeRevokeCall(row.operator.address) }],
      })
      setRows((current) => current.filter((item) => `${item.collection}:${item.operator.address}` !== key))
      setMessage("Revocation submitted. Rescan after confirmation to verify the approval is gone.")
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Revocation was rejected")
    } finally {
      setRevoking("")
    }
  }

  return (
    <div className="neon-card-static border border-[#00d4ff]/15 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mono text-[10px] uppercase tracking-wider text-[#00d4ff]">Wallet safety action</div>
          <h3 className="mt-1 text-sm font-semibold text-white">Scan and revoke NFT marketplace permissions</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">Read-only scan first. HackTrail checks NFT contracts seen in your wallet against shared Seaport marketplace operators. It never asks for a seed phrase.</p>
        </div>
        <div className="mono text-[9px] uppercase text-neutral-600">Ethereum only</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button onClick={connectAndScan} disabled={loading} className="rounded-lg border border-[#00d4ff]/25 bg-[#00d4ff]/10 px-4 py-2.5 mono text-xs text-[#00d4ff] hover:bg-[#00d4ff]/15 disabled:opacity-50">{loading ? "Scanning approvals…" : address ? `Rescan ${shortAddr(address)}` : "Connect wallet and scan"}</button>
        {address && <span className="self-center mono text-[10px] text-neutral-600">Connected for this session only</span>}
      </div>
      {message && <div className="rounded border border-[#00d4ff]/15 bg-[#00d4ff]/5 p-3 text-xs text-neutral-400">{message}</div>}
      {error && <div className="rounded border border-[#ff2255]/20 bg-[#ff2255]/5 p-3 text-xs text-[#ff6688]">{error}</div>}
      {rows.length > 0 && <div className="space-y-2"><div className="mono text-[10px] uppercase tracking-wider text-[#f59e0b]">Active approvals</div>{rows.map((row) => { const key = `${row.collection}:${row.operator.address}`; return <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-[#f59e0b]/15 bg-[#f59e0b]/5 p-3"><div><div className="text-xs text-white">{row.operator.label}</div><div className="mono mt-1 text-[10px] text-neutral-500">NFT contract {shortAddr(row.collection)}</div></div><button onClick={() => revoke(row)} disabled={revoking === key} className="rounded border border-[#ff2255]/25 bg-[#ff2255]/10 px-3 py-2 mono text-[10px] text-[#ff6688] hover:bg-[#ff2255]/15 disabled:opacity-50">{revoking === key ? "Waiting for wallet…" : "Revoke approval"}</button></div> })}</div>}
      <div className="mono text-[9px] leading-relaxed text-neutral-700">Revoking is an on-chain transaction and may require gas. Disconnecting a wallet does not revoke approvals. Magic Eden attribution remains preliminary; these operators are shared marketplace infrastructure.</div>
    </div>
  )
}
