// @ts-nocheck
"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Sparkles, Star, Check, Plus, X, Settings,
  Inbox, ChevronDown, ChevronRight, User, RefreshCw,
  Lightbulb, ClipboardPaste, ZoomIn, Copy, Trash2, RotateCcw
} from "lucide-react"

// ── palette ──────────────────────────────────────────────
const C = {
  bg: "#F0EDE8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F5F1",
  border: "#E2DDD7",
  borderStrong: "#C8C2BA",
  text: "#1C1917",
  textSub: "#78716C",
  textMuted: "#A8A29E",
  accent: "#4A6FA5",
  accentLight: "#EBF0F8",
  success: "#3D8C6E",
  successLight: "#E8F5EF",
  purple: "#7C5FA5",
  purpleLight: "#F0EBFA",
  orange: "#B45309",
  orangeLight: "#FEF3C7",
}

const DEFAULT_DATA = {
  強ワード: [],
  問いの型: ["とは何か", "がある人とない人の違い"],
  "コンプレックスとステータス": [],
  場面: [],
  投稿スタイル: ["物語", "体験談", "失敗談", "ビフォーアフター", "図解", "ステップ解説", "よくある誤解", "持論", "逆説", "あるある", "本音トーク", "比較", "ランキング"],
  属性: ["30代", "40代", "会社員", "フリーランス", "副業中", "転職活動中", "婚活中", "子育て中", "管理職", "新卒・若手"],
}

const CAT_COLORS = {
  強ワード: C.accent,
  問いの型: C.success,
  "コンプレックスとステータス": C.purple,
  場面: C.orange,
  投稿スタイル: "#B07040",
  属性: "#2A7A7A",
}

// ── API helpers ───────────────────────────────────────────
async function apiPost(path, body) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  return res.json()
}
async function apiPut(path, body) {
  const res = await fetch(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  return res.json()
}
async function apiDelete(path) {
  await fetch(path, { method: "DELETE" })
}

// ── small components ──────────────────────────────────────
function Tag({ label, active, onClick, onRemove }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button onClick={onClick} style={{
        padding: "4px 10px", borderRadius: 20,
        border: `1.5px solid ${active ? C.accent : C.border}`,
        background: active ? C.accentLight : C.surface,
        color: active ? C.accent : C.textSub,
        fontSize: 12, fontWeight: active ? 600 : 400,
        cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
      }}>{label}</button>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove() }} style={{
          position: "absolute", top: -4, right: -4, width: 13, height: 13,
          borderRadius: "50%", background: C.borderStrong, border: "none",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}><X size={7} /></button>
      )}
    </div>
  )
}

function Folder({ title, items, selected, onToggle, onAdd, onRemove, editMode }) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState("")
  const activeCount = items.filter(i => selected.includes(i)).length

  function handleAdd() {
    if (input.trim()) { onAdd(input.trim()); setInput("") }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); handleAdd() }
    if (e.key === "Escape") { setAdding(false); setInput("") }
  }

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 6 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", padding: "8px 12px", background: C.surfaceAlt,
        border: "none", display: "flex", alignItems: "center", gap: 6,
        cursor: "pointer", textAlign: "left",
      }}>
        {open ? <ChevronDown size={13} color={C.textSub} /> : <ChevronRight size={13} color={C.textSub} />}
        <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[title] || C.textSub, flex: 1, letterSpacing: "0.04em" }}>{title}</span>
        {activeCount > 0 && (
          <span style={{ background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>
            {activeCount}
          </span>
        )}
        {editMode && (
          <span onClick={e => { e.stopPropagation(); setAdding(v => !v); setInput("") }} style={{ color: C.accent, marginLeft: 4 }}>
            <Plus size={13} />
          </span>
        )}
      </button>
      {open && (
        <div style={{ padding: "10px 12px", background: C.surface }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {items.map(item => (
              <Tag key={item} label={item} active={selected.includes(item)}
                onClick={() => onToggle(item)}
                onRemove={editMode ? () => onRemove(item) : null} />
            ))}
            {items.length === 0 && <span style={{ fontSize: 11, color: C.textMuted }}>ワードを追加してください</span>}
          </div>
          {adding && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input autoFocus value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="追加（Enterで連続追加、Escで終了）" style={{
                    flex: 1, padding: "4px 8px", border: `1px solid ${C.borderStrong}`,
                    borderRadius: 6, fontSize: 12, outline: "none", background: C.surface,
                  }} />
                <button onClick={handleAdd} style={{
                  padding: "4px 10px", background: C.accent, color: "#fff",
                  border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                }}>追加</button>
                <button onClick={() => { setAdding(false); setInput("") }} style={{
                  padding: "4px 8px", background: "none", color: C.textMuted,
                  border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer",
                }}>完了</button>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textMuted }}>Enterで連続追加・Escまたは「完了」で閉じる</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AccountSwitcher({ accounts, activeId, onSwitch, onAdd }) {
  const [open, setOpen] = useState(false)
  const active = accounts.find(a => a.id === activeId)
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, cursor: "pointer", width: "100%", textAlign: "left",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%", background: active?.color || C.accent,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><User size={12} color="#fff" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{active?.name || "アカウントを選択"}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{active?.platform || ""}</div>
        </div>
        <ChevronDown size={14} color={C.textSub} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          zIndex: 50, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}>
          {accounts.map(acc => (
            <button key={acc.id} onClick={() => { onSwitch(acc.id); setOpen(false) }} style={{
              width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 8,
              background: acc.id === activeId ? C.accentLight : "transparent",
              border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: acc.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={10} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{acc.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{acc.platform}</div>
              </div>
            </button>
          ))}
          <button onClick={() => { onAdd(); setOpen(false) }} style={{
            width: "100%", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer", color: C.accent, fontSize: 12, fontWeight: 600,
          }}><Plus size={13} /> アカウントを追加</button>
        </div>
      )}
    </div>
  )
}

function AddAccountModal({ onClose, onSave }) {
  const [name, setName] = useState("")
  const [platform, setPlatform] = useState("")
  const colors = ["#4A6FA5", "#E07C54", "#3D8C6E", "#7C5FA5", "#B45309"]
  const [color, setColor] = useState(colors[0])
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: C.surface, borderRadius: 12, padding: 24, width: 320, border: `1px solid ${C.border}` }}>
        <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.text }}>アカウントを追加</p>
        {[["名前", name, setName, "例：シアニン"], ["媒体", platform, setPlatform, "例：note / X"]].map(([label, val, setter, ph]) => (
          <div key={label}>
            <label style={{ fontSize: 12, color: C.textSub, display: "block", marginBottom: 4 }}>{label}</label>
            <input value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={{
              width: "100%", padding: "7px 10px", borderRadius: 6,
              border: `1px solid ${C.borderStrong}`, fontSize: 13,
              marginBottom: 12, boxSizing: "border-box", outline: "none",
            }} />
          </div>
        ))}
        <label style={{ fontSize: 12, color: C.textSub, display: "block", marginBottom: 6 }}>カラー</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {colors.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 24, height: 24, borderRadius: "50%", background: c,
              border: color === c ? `3px solid ${C.text}` : "3px solid transparent",
              cursor: "pointer", padding: 0,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "8px 0", border: `1px solid ${C.border}`, borderRadius: 8, background: "none", cursor: "pointer", fontSize: 13, color: C.textSub }}>キャンセル</button>
          <button
            onClick={() => name.trim() && onSave({ name: name.trim(), platform: platform || "未設定", color, data: DEFAULT_DATA })}
            disabled={!name.trim()} style={{
              flex: 1, padding: "8px 0", border: "none", borderRadius: 8,
              background: name.trim() ? C.accent : C.border,
              color: name.trim() ? "#fff" : C.textMuted,
              cursor: name.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700,
            }}>追加</button>
        </div>
      </div>
    </div>
  )
}

function DrillDownPanel({ idea, onClose, onToggleFav, onToggleUsed }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("angles")
  const [copied, setCopied] = useState(false)
  const [extraInstruction, setExtraInstruction] = useState("")

  const MODES = [
    { id: "angles", label: "切り口を展開", desc: "角度違いのタイトルを8本" },
    { id: "outline", label: "構成案を作る", desc: "見出し構成・章立てを提案" },
    { id: "hooks", label: "冒頭フックを作る", desc: "書き出し3パターン" },
  ]

  async function run() {
    setLoading(true); setResult(null)
    const extraPart = extraInstruction.trim() ? `\n追加指示: ${extraInstruction.trim()}` : ""
    const prompts = {
      angles: `以下のコンテンツタイトルを起点に、角度を変えた派生タイトルを8本生成してください。\nタイトル:「${idea.title}」\n条件: 同じテーマを別の切り口・問いの型で。タイトルのみ、番号なし、改行区切り。${extraPart}`,
      outline: `以下のコンテンツタイトルの記事・投稿構成案を作ってください。\nタイトル:「${idea.title}」\n出力: H2見出し4〜6個、各見出しに1行ポイントを添えてシンプルに。${extraPart}`,
      hooks: `以下のタイトルに合う冒頭文を3パターン。\nタイトル:「${idea.title}」\n条件: 各50〜80文字、問いかけ型・共感型・衝撃型で。番号付き。${extraPart}`,
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompts[mode] }] }),
      })
      const json = await res.json()
      setResult(json.content?.[0]?.text || "")
    } catch (e) {}
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", zIndex: 80 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, height: "100vh", background: C.surface,
        borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub, display: "flex" }}><X size={16} /></button>
          <ZoomIn size={14} color={C.accent} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>深掘り</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[
              { icon: <Star size={13} fill={idea.fav ? C.accent : "none"} />, active: idea.fav, color: C.accent, fn: () => onToggleFav(idea.id) },
              { icon: <Check size={13} />, active: idea.used, color: C.success, fn: () => onToggleUsed(idea.id) },
            ].map((btn, i) => (
              <button key={i} onClick={btn.fn} style={{
                width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${btn.active ? btn.color : C.border}`,
                background: btn.active ? (btn.color === C.accent ? C.accentLight : C.successLight) : C.surfaceAlt,
                color: btn.active ? btn.color : C.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>{btn.icon}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.65 }}>{idea.title}</p>
          {idea.category && <span style={{ fontSize: 11, color: C.textMuted, marginTop: 3, display: "block" }}>{idea.category}</span>}
        </div>

        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.textSub, fontWeight: 700 }}>深掘りの種類</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding: "8px 12px", borderRadius: 8, textAlign: "left",
                border: `1.5px solid ${mode === m.id ? C.accent : C.border}`,
                background: mode === m.id ? C.accentLight : C.surface,
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: mode === m.id ? 700 : 500, color: mode === m.id ? C.accent : C.text }}>{m.label}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{m.desc}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>追加条件（任意）</label>
            <textarea value={extraInstruction} onChange={e => setExtraInstruction(e.target.value)}
              placeholder="例：この構成をベースに、体験談スタイルで、初心者向けに..." rows={2}
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 9px",
                fontSize: 12, lineHeight: 1.6, border: `1px solid ${C.borderStrong}`,
                borderRadius: 7, resize: "none", outline: "none",
                fontFamily: "'Noto Sans JP', sans-serif", color: C.text, background: C.surfaceAlt,
              }} />
          </div>
          <button onClick={run} disabled={loading} style={{
            width: "100%", padding: "9px 0", marginTop: 12,
            background: loading ? C.border : C.accent, color: loading ? C.textMuted : "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Sparkles size={14} strokeWidth={1.5} />
            {loading ? "生成中..." : "実行"}
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 18px" }}>
          {!result && !loading && (
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.7 }}>
              深掘りの種類を選んで「実行」してください
            </p>
          )}
          {loading && <p style={{ fontSize: 13, color: C.textMuted }}>生成中...</p>}
          {result && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>結果</span>
                <button onClick={copy} style={{
                  padding: "3px 8px", border: `1px solid ${C.border}`, borderRadius: 5,
                  background: copied ? C.successLight : C.surfaceAlt,
                  color: copied ? C.success : C.textSub, fontSize: 11,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Copy size={11} /> {copied ? "コピー済み" : "コピー"}
                </button>
              </div>
              <div style={{
                background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "12px 14px", fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap",
              }}>{result}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PasteImportModal({ onClose, onImport }) {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState({})

  async function analyze() {
    if (!text.trim()) return
    setLoading(true); setResult(null); setConfirmed({})
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `以下のテキストに含まれるキーワードや表現を、コンテンツネタ生成に使うカテゴリに分類してください。

テキスト:
${text}

カテゴリ:
- 強ワード（名詞・概念・テーマ）
- 問いの型（問いのパターン）
- コンプレックスとステータス（読者の悩みや欲求）
- 場面（文脈・シチュエーション）

以下のJSON形式のみ出力（説明なし・コードブロックなし）:
{"強ワード":[],"問いの型":[],"コンプレックスとステータス":[],"場面":[]}`
          }],
        }),
      })
      const json = await res.json()
      const raw = json.content?.[0]?.text || "{}"
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
      setResult(parsed)
      const init = {}
      Object.entries(parsed).forEach(([cat, items]) => {
        items.forEach((_, i) => { init[`${cat}_${i}`] = true })
      })
      setConfirmed(init)
    } catch (e) {}
    setLoading(false)
  }

  const totalSelected = result
    ? Object.entries(result).reduce((sum, [cat, items]) => sum + items.filter((_, i) => confirmed[`${cat}_${i}`]).length, 0)
    : 0

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{
        background: C.surface, borderRadius: 12, padding: 24, width: 520,
        maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ClipboardPaste size={15} color={C.purple} strokeWidth={1.5} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>テキストから取り込む</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub }}><X size={16} /></button>
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="ここにテキストを貼り付けてください。ドキュメント、箇条書き、メモなど何でもOK。AIが自動でカテゴリに分類します。"
          style={{
            width: "100%", height: 130, padding: "10px 12px",
            border: `1px solid ${C.borderStrong}`, borderRadius: 8,
            fontSize: 13, lineHeight: 1.6, resize: "none",
            fontFamily: "'Noto Sans JP', sans-serif", outline: "none",
            boxSizing: "border-box", color: C.text, background: C.surfaceAlt,
          }} />
        <button onClick={analyze} disabled={!text.trim() || loading} style={{
          padding: "9px 0", marginTop: 10,
          background: text.trim() && !loading ? C.purple : C.border,
          color: text.trim() && !loading ? "#fff" : C.textMuted,
          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: text.trim() && !loading ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Sparkles size={14} strokeWidth={1.5} />
          {loading ? "分類中..." : "AIで分類する"}
        </button>

        {result && (
          <div style={{ flex: 1, overflow: "auto", marginTop: 16 }}>
            <p style={{ fontSize: 12, color: C.textSub, margin: "0 0 10px" }}>取り込むキーワードを選んでください（チェックを外すと除外）</p>
            {Object.entries(result).map(([cat, items]) => items.length > 0 && (
              <div key={cat} style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: CAT_COLORS[cat] || C.textSub, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>{cat}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {items.map((item, i) => {
                    const key = `${cat}_${i}`
                    const on = confirmed[key]
                    return (
                      <button key={i} onClick={() => setConfirmed(prev => ({ ...prev, [key]: !prev[key] }))} style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: on ? 600 : 400,
                        border: `1.5px solid ${on ? CAT_COLORS[cat] : C.border}`,
                        background: on ? `${CAT_COLORS[cat]}18` : C.surfaceAlt,
                        color: on ? CAT_COLORS[cat] : C.textMuted,
                        cursor: "pointer", transition: "all 0.12s",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {on && <Check size={10} />}{item}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <button onClick={onClose} style={{ padding: "8px 0", flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, background: "none", cursor: "pointer", fontSize: 13, color: C.textSub }}>キャンセル</button>
            <button onClick={() => {
              const toImport = {}
              Object.entries(result).forEach(([cat, items]) => {
                toImport[cat] = items.filter((_, i) => confirmed[`${cat}_${i}`])
              })
              onImport(toImport)
              onClose()
            }} style={{
              padding: "8px 0", flex: 2, border: "none", borderRadius: 8,
              background: C.accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
            }}>{totalSelected}件を追加する</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AdjacentWord({ word, onAdd }) {
  const [added, setAdded] = useState(false)
  return (
    <button onClick={() => { onAdd(); setAdded(true) }}
      disabled={added} style={{
        padding: "3px 9px", borderRadius: 20, fontSize: 11,
        border: `1.5px solid ${added ? C.success : C.purple}`,
        background: added ? C.successLight : C.purpleLight,
        color: added ? C.success : C.purple,
        cursor: added ? "default" : "pointer",
        display: "flex", alignItems: "center", gap: 3, transition: "all 0.12s",
      }}>
      {added ? <Check size={9} /> : <Plus size={9} />}{word}
    </button>
  )
}

function TrashBox({ trash, onRestore, onClear }) {
  const allItems = Object.entries(trash).flatMap(([cat, items]) => items.map(item => ({ cat, item })))
  if (allItems.length === 0) return null
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
      <div style={{
        padding: "8px 12px", background: C.surfaceAlt,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Trash2 size={12} color={C.textMuted} strokeWidth={1.5} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>ゴミ箱</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>({allItems.length})</span>
        </div>
        <button onClick={onClear} style={{
          fontSize: 11, color: C.textMuted, background: "none",
          border: "none", cursor: "pointer", padding: "2px 4px",
        }}>全削除</button>
      </div>
      <div style={{ padding: "10px 12px", background: C.surface }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {allItems.map(({ cat, item }) => (
            <div key={`${cat}_${item}`} style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "3px 8px 3px 10px", borderRadius: 20,
              border: `1.5px solid ${C.border}`,
              background: C.surfaceAlt, fontSize: 12, color: C.textMuted,
            }}>
              <span>{item}</span>
              <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 2 }}>({cat})</span>
              <button onClick={() => onRestore(cat, item)} title="復元" style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.success, padding: "0 0 0 3px", display: "flex", alignItems: "center",
              }}><RotateCcw size={10} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IdeaCard({ idea, onToggleFav, onToggleUsed, onDrillDown, onDelete }) {
  return (
    <div style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      borderRight: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      borderLeft: `3px solid ${idea.fav ? C.accent : C.border}`,
      borderRadius: 10, padding: "11px 14px",
      display: "flex", alignItems: "flex-start", gap: 12,
      opacity: idea.used ? 0.5 : 1, transition: "all 0.15s",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.65 }}>{idea.title}</p>
        {idea.category && <span style={{ fontSize: 11, color: C.textMuted, marginTop: 3, display: "block" }}>{idea.category}</span>}
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0, marginTop: 1 }}>
        <button onClick={() => onDrillDown(idea)} title="深掘り" style={{
          width: 27, height: 27, borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.surfaceAlt, color: C.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><ZoomIn size={13} strokeWidth={1.5} /></button>
        {[
          { icon: <Star size={13} fill={idea.fav ? C.accent : "none"} />, active: idea.fav, color: C.accent, fn: () => onToggleFav(idea.id) },
          { icon: <Check size={13} />, active: idea.used, color: C.success, fn: () => onToggleUsed(idea.id) },
        ].map((btn, i) => (
          <button key={i} onClick={btn.fn} style={{
            width: 27, height: 27, borderRadius: 6,
            border: `1px solid ${btn.active ? btn.color : C.border}`,
            background: btn.active ? (btn.color === C.accent ? C.accentLight : C.successLight) : C.surfaceAlt,
            color: btn.active ? btn.color : C.textMuted,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>{btn.icon}</button>
        ))}
        <button onClick={() => onDelete(idea.id)} title="削除" style={{
          width: 27, height: 27, borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.surfaceAlt, color: C.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><Trash2 size={13} strokeWidth={1.5} /></button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function NetaGen({ initialAccounts, initialIdeas }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [activeAccountId, setActiveAccountId] = useState(initialAccounts[0]?.id || null)
  const [ideas, setIdeas] = useState(initialIdeas)
  const [selected, setSelected] = useState({ 強ワード: [], 問いの型: [], "コンプレックスとステータス": [], 場面: [], 投稿スタイル: [], 属性: [] })
  const [trash, setTrash] = useState({ 強ワード: [], 問いの型: [], "コンプレックスとステータス": [], 場面: [], 投稿スタイル: [], 属性: [] })
  const [extraCondition, setExtraCondition] = useState("")
  const [loading, setLoading] = useState(false)
  const [adjacent, setAdjacent] = useState([])
  const [loadingAdjacent, setLoadingAdjacent] = useState(false)
  const [tab, setTab] = useState("generate")
  const [editMode, setEditMode] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showPasteImport, setShowPasteImport] = useState(false)
  const [drillTarget, setDrillTarget] = useState(null)

  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const data = activeAccount?.data || DEFAULT_DATA
  const accountIdeas = ideas.filter(i => i.account_id === activeAccountId)
  const favIdeas = accountIdeas.filter(i => i.fav)
  const usedIdeas = accountIdeas.filter(i => i.used)
  const hasSelection = Object.values(selected).flat().length > 0

  function toggleSelect(cat, item) {
    setSelected(prev => {
      const list = prev[cat] || []
      return { ...prev, [cat]: list.includes(item) ? list.filter(x => x !== item) : [...list, item] }
    })
  }

  // Update account data (words) — optimistic + API
  async function updateAccountData(newData) {
    const updated = accounts.map(a => a.id === activeAccountId ? { ...a, data: newData } : a)
    setAccounts(updated)
    await apiPut(`/api/accounts/${activeAccountId}`, { ...activeAccount, data: newData })
  }

  function addItem(cat, item) {
    const current = data[cat] || []
    if (current.includes(item)) return
    const newData = { ...data, [cat]: [...current, item] }
    updateAccountData(newData)
  }

  function removeItem(cat, item) {
    const newData = { ...data, [cat]: (data[cat] || []).filter(x => x !== item) }
    updateAccountData(newData)
    setSelected(prev => ({ ...prev, [cat]: (prev[cat] || []).filter(x => x !== item) }))
    setTrash(prev => ({ ...prev, [cat]: [...(prev[cat] || []), item] }))
  }

  function restoreItem(cat, item) {
    const current = data[cat] || []
    if (!current.includes(item)) {
      const newData = { ...data, [cat]: [...current, item] }
      updateAccountData(newData)
    }
    setTrash(prev => ({ ...prev, [cat]: (prev[cat] || []).filter(x => x !== item) }))
  }

  function clearTrash() {
    setTrash({ 強ワード: [], 問いの型: [], "コンプレックスとステータス": [], 場面: [], 投稿スタイル: [], 属性: [] })
  }

  async function addAccount(info) {
    const created = await apiPost("/api/accounts", info)
    if (created.id) {
      setAccounts(prev => [...prev, created])
      setActiveAccountId(created.id)
      setSelected({ 強ワード: [], 問いの型: [], "コンプレックスとステータス": [], 場面: [], 投稿スタイル: [], 属性: [] })
    }
    setShowAddAccount(false)
  }

  function switchAccount(id) {
    setActiveAccountId(id)
    setSelected({ 強ワード: [], 問いの型: [], "コンプレックスとステータス": [], 場面: [], 投稿スタイル: [], 属性: [] })
    setAdjacent([])
  }

  function handlePasteImport(categorized) {
    const newData = { ...data }
    Object.entries(categorized).forEach(([cat, items]) => {
      const existing = newData[cat] || []
      newData[cat] = [...existing, ...items.filter(i => !existing.includes(i))]
    })
    updateAccountData(newData)
  }

  // Generate ideas — optimistic add, then save each to DB
  const generate = useCallback(async () => {
    if (!hasSelection || !activeAccountId) return
    setLoading(true)
    try {
      const selEntries = Object.entries(selected).filter(([, v]) => v.length > 0)
      const extraPart = extraCondition.trim() ? `\n追加条件:\n${extraCondition.trim()}` : ""
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `あなたはコンテンツネタを提案するAIです。以下の要素を組み合わせて、noteやX（Twitter）で使えるコンテンツタイトル候補を10本生成してください。

選択された要素:
${selEntries.map(([k, v]) => `・${k}: ${v.join("、")}`).join("\n")}${extraPart}

基本条件: 知性・仕事術・人間関係がテーマ。コンプレックスとステータスの両方に訴えるタイトル。タイトルのみ、番号なし、説明なし、日本語のみ。

10本を改行区切りで出力してください。`
          }],
        }),
      })
      const json = await res.json()
      const text = json.content?.[0]?.text || ""
      const titles = text.split("\n").map(t => t.trim()).filter(t => t.length > 5).slice(0, 10)
      const category = selEntries.map(([k, v]) => `${v.join("・")}`).join(" × ")

      // optimistic
      const tempIdeas = titles.map((title, i) => ({
        id: `temp_${Date.now()}_${i}`, account_id: activeAccountId, title, category, fav: false, used: false,
      }))
      setIdeas(prev => [...tempIdeas, ...prev])

      // persist each to DB (fire and forget)
      titles.forEach(async (title) => {
        const saved = await apiPost("/api/ideas", { account_id: activeAccountId, title, category })
        if (saved.id) {
          setIdeas(prev => {
            const idx = prev.findIndex(i => i.account_id === activeAccountId && i.title === title && i.id.startsWith("temp_"))
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = saved
            return next
          })
        }
      })
    } catch (e) {}
    setLoading(false)
  }, [selected, extraCondition, activeAccountId])

  const generateAdjacent = useCallback(async () => {
    if (!hasSelection) return
    setLoadingAdjacent(true); setAdjacent([])
    try {
      const allSelected = Object.values(selected).flat()
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `以下のキーワードと隣接・関連する新しいキーワードを15個提案してください。
現在のキーワード: ${allSelected.join("、")}
条件: 知性・仕事術・人間関係・自己成長に関連、現在と違う切り口、1〜8文字、番号なし・説明なし・1行1ワード
15個を改行区切りで出力してください。`
          }],
        }),
      })
      const json = await res.json()
      const text = json.content?.[0]?.text || ""
      setAdjacent(text.split("\n").map(t => t.trim()).filter(t => t.length > 0 && t.length <= 15).slice(0, 15))
    } catch (e) {}
    setLoadingAdjacent(false)
  }, [selected])

  function toggleFav(id) {
    const idea = ideas.find(i => i.id === id)
    if (!idea) return
    const newFav = !idea.fav
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, fav: newFav } : i))
    if (drillTarget?.id === id) setDrillTarget(prev => ({ ...prev, fav: newFav }))
    if (!id.startsWith("temp_")) apiPut(`/api/ideas/${id}`, { fav: newFav, used: idea.used })
  }

  function toggleUsed(id) {
    const idea = ideas.find(i => i.id === id)
    if (!idea) return
    const newUsed = !idea.used
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, used: newUsed } : i))
    if (drillTarget?.id === id) setDrillTarget(prev => ({ ...prev, used: newUsed }))
    if (!id.startsWith("temp_")) apiPut(`/api/ideas/${id}`, { fav: idea.fav, used: newUsed })
  }

  function deleteIdea(id) {
    setIdeas(prev => prev.filter(i => i.id !== id))
    if (drillTarget?.id === id) setDrillTarget(null)
    if (!id.startsWith("temp_")) apiDelete(`/api/ideas/${id}`)
  }

  const displayList = tab === "generate" ? accountIdeas : tab === "fav" ? favIdeas : usedIdeas

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.text }}>ネタ増殖装置</span>
          <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 10 }}>Content Idea Generator</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowPasteImport(true)} style={{
            background: C.purpleLight, border: `1px solid ${C.purple}`,
            borderRadius: 6, padding: "6px 12px", cursor: "pointer",
            color: C.purple, fontSize: 13,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <ClipboardPaste size={14} strokeWidth={1.5} />
            テキストから取り込む
          </button>
          <button onClick={() => setEditMode(v => !v)} style={{
            background: editMode ? C.accentLight : "none",
            border: `1px solid ${editMode ? C.accent : C.border}`,
            borderRadius: 6, padding: "6px 12px", cursor: "pointer",
            color: editMode ? C.accent : C.textSub, fontSize: 13,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Settings size={14} strokeWidth={1.5} />
            {editMode ? "編集中" : "ワード編集"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "18px 16px", display: "flex", gap: 16 }}>
        {/* left */}
        <div style={{ width: 255, flexShrink: 0 }}>
          <div style={{ marginBottom: 10 }}>
            <AccountSwitcher accounts={accounts} activeId={activeAccountId} onSwitch={switchAccount} onAdd={() => setShowAddAccount(true)} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: C.text }}>要素を選択</p>
            {Object.entries(data).map(([cat, items]) => (
              <Folder key={cat} title={cat} items={items || []}
                selected={selected[cat] || []}
                onToggle={item => toggleSelect(cat, item)}
                onAdd={item => addItem(cat, item)}
                onRemove={item => removeItem(cat, item)}
                editMode={editMode} />
            ))}

            <TrashBox trash={trash} onRestore={restoreItem} onClear={clearTrash} />

            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>追加条件（任意）</label>
              <textarea value={extraCondition} onChange={e => setExtraCondition(e.target.value)}
                placeholder="例：短めに、初心者向けに、挑発的なトーンで..." rows={3}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "7px 9px",
                  fontSize: 12, lineHeight: 1.6, border: `1px solid ${C.borderStrong}`,
                  borderRadius: 7, resize: "none", outline: "none",
                  fontFamily: "'Noto Sans JP', sans-serif", color: C.text, background: C.surfaceAlt,
                }} />
            </div>

            <button onClick={generate} disabled={!hasSelection || loading || !activeAccountId} style={{
              width: "100%", padding: "10px 0", marginTop: 8,
              background: hasSelection && !loading ? C.accent : C.border,
              color: hasSelection && !loading ? "#fff" : C.textMuted,
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: hasSelection && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "all 0.15s",
            }}>
              <Sparkles size={14} strokeWidth={1.5} />
              {loading ? "生成中..." : "ネタを生成"}
            </button>
          </div>

          {/* adjacent */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Lightbulb size={13} color={C.purple} strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>隣接キーワード</span>
              </div>
              <button onClick={generateAdjacent} disabled={!hasSelection || loadingAdjacent} style={{
                padding: "3px 9px", border: `1px solid ${C.purple}`,
                borderRadius: 5, background: C.purpleLight, color: C.purple,
                fontSize: 11, fontWeight: 600, cursor: hasSelection ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 3, opacity: hasSelection ? 1 : 0.5,
              }}>
                <RefreshCw size={10} />
                {loadingAdjacent ? "探索中..." : "探索"}
              </button>
            </div>
            {adjacent.length === 0 && !loadingAdjacent
              ? <p style={{ fontSize: 11, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>要素を選んで「探索」すると新キーワード候補が見つかります</p>
              : loadingAdjacent
                ? <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>探索中...</p>
                : (
                  <>
                    <p style={{ fontSize: 10, color: C.textMuted, margin: "0 0 7px" }}>＋で強ワードに追加</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {adjacent.map(word => (
                        <AdjacentWord key={word} word={word} onAdd={() => addItem("強ワード", word)} />
                      ))}
                    </div>
                  </>
                )
            }
          </div>
        </div>

        {/* right */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", gap: 3, marginBottom: 12,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3,
          }}>
            {[
              { id: "generate", label: "生成結果", icon: <Sparkles size={12} strokeWidth={1.5} /> },
              { id: "fav", label: `お気に入り (${favIdeas.length})`, icon: <Star size={12} strokeWidth={1.5} /> },
              { id: "used", label: `使用済み (${usedIdeas.length})`, icon: <Check size={12} strokeWidth={1.5} /> },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "7px 0", border: "none", borderRadius: 6,
                background: tab === t.id ? C.accentLight : "transparent",
                color: tab === t.id ? C.accent : C.textSub,
                fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                transition: "all 0.15s",
              }}>{t.icon}{t.label}</button>
            ))}
          </div>

          {displayList.length === 0 ? (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
              <Inbox size={28} strokeWidth={1} color={C.textMuted} style={{ marginBottom: 10 }} />
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                {tab === "generate" ? "要素を選んでネタを生成してください"
                  : tab === "fav" ? "★ でお気に入りに追加できます"
                  : "✓ で使用済みにマークできます"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {displayList.map(idea => (
                <IdeaCard key={idea.id} idea={idea}
                  onToggleFav={toggleFav} onToggleUsed={toggleUsed}
                  onDrillDown={setDrillTarget} onDelete={deleteIdea} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drillTarget && <DrillDownPanel idea={drillTarget} onClose={() => setDrillTarget(null)} onToggleFav={toggleFav} onToggleUsed={toggleUsed} />}
      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} onSave={addAccount} />}
      {showPasteImport && <PasteImportModal onClose={() => setShowPasteImport(false)} onImport={handlePasteImport} />}
    </div>
  )
}
