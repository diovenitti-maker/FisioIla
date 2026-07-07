import { useState, useEffect } from 'react'
import {
  getPatientsFS, addPatientFS, updatePatientFS, deletePatientFS,
  getExercisesFS, addExerciseFS, updateExerciseFS, deleteExerciseFS,
  getTheoryFS, addTheoryFS, updateTheoryFS, deleteTheoryFS,
  getAllDiaryFS, deleteDiaryFS,
  getAppointmentsFS, addAppointmentFS, deleteAppointmentFS,
} from '../firebase'

const C = {
  bg: '#080814', s1: '#10101f', s2: '#181830', s3: '#202040', s4: '#2a2a55',
  accent: '#00d4aa', accent2: '#a855f7', accent3: '#f59e0b',
  text: '#e2e8f0', muted: '#7a8a9a', border: '#252550',
  err: '#ef4444', ok: '#22c55e',
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const getYoutubeId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: C.s1, borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.s1 }}>
          <h3 style={{ color: C.text, margin: 0, fontSize: '17px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
    </div>
  )
}

const inp = { width: '100%', padding: '11px 14px', background: C.s2, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }
const ta  = { ...inp, minHeight: '90px', resize: 'vertical', lineHeight: '1.5' }
const sel = { ...inp, cursor: 'pointer' }

function Btn({ children, onClick, color = C.accent, textColor = '#000', style = {} }) {
  return (
    <button onClick={onClick}
      style={{ padding: '10px 18px', background: color, border: 'none', borderRadius: '8px', color: textColor, fontWeight: '600', fontSize: '14px', cursor: 'pointer', ...style }}>
      {children}
    </button>
  )
}

function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', border: `1px solid ${C.err}`, borderRadius: '10px', marginTop: '8px' }}>
      <p style={{ color: C.text, marginBottom: '12px', fontSize: '14px' }}>⚠️ Sei sicura di voler eliminare questo elemento?</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Btn onClick={onConfirm} color={C.err} textColor="#fff">Elimina</Btn>
        <Btn onClick={onCancel} color={C.s3} textColor={C.text}>Annulla</Btn>
      </div>
    </div>
  )
}

function Badge({ children, color = C.accent }) {
  return (
    <span style={{ padding: '3px 10px', background: color + '22', border: `1px solid ${color}44`, borderRadius: '20px', color, fontSize: '12px', fontWeight: '600' }}>
      {children}
    </span>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: C.muted }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <p>{text}</p>
    </div>
  )
}

// ── PATIENTS SECTION ──────────────────────────────────────────────────────────

function PatientsSection() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [form, setForm] = useState({ name: '', surname: '', code: '', email: '', condition: '', notes: '' })

  const load = async () => {
    setLoading(true)
    const snap = await getPatientsFS()
    setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.name?.localeCompare(b.name)))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', surname: '', code: generateCode(), email: '', condition: '', notes: '' })
    setModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name || '', surname: p.surname || '', code: p.code || '', email: p.email || '', condition: p.condition || '', notes: p.notes || '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.name || !form.code) return alert('Nome e codice sono obbligatori')
    const data = { ...form, code: form.code.toUpperCase().trim() }
    if (editing) {
      await updatePatientFS(editing.id, data)
    } else {
      await addPatientFS(data)
    }
    setModal(false)
    load()
  }

  const remove = async (id) => {
    await deletePatientFS(id)
    setDeleteId(null)
    load()
  }

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>👥 Pazienti</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{patients.length} pazienti registrati</p>
        </div>
        <Btn onClick={openAdd}>+ Aggiungi Paziente</Btn>
      </div>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        patients.length === 0 ? <EmptyState icon="👤" text="Nessun paziente. Aggiungine uno per iniziare!" /> :
        <div style={{ display: 'grid', gap: '12px' }}>
          {patients.map(p => (
            <div key={p.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ color: C.text, fontWeight: '600', fontSize: '16px' }}>{p.name} {p.surname}</span>
                    {p.condition && <Badge color={C.accent3}>{p.condition}</Badge>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: C.muted, fontSize: '13px' }}>Codice accesso:</span>
                    <code style={{ background: C.s3, color: C.accent, padding: '3px 10px', borderRadius: '6px', fontSize: '15px', fontWeight: '700', letterSpacing: '2px' }}>{p.code}</code>
                    <button onClick={() => copyCode(p.code, p.id)}
                      style={{ background: copiedId === p.id ? C.ok + '22' : C.s3, border: 'none', color: copiedId === p.id ? C.ok : C.muted, padding: '3px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      {copiedId === p.id ? '✓ Copiato!' : '📋 Copia'}
                    </button>
                  </div>
                  {p.email && <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>✉️ {p.email}</p>}
                  {p.notes && <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0', fontStyle: 'italic' }}>📝 {p.notes}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn onClick={() => openEdit(p)} color={C.s3} textColor={C.text} style={{ padding: '8px 14px' }}>✏️</Btn>
                  <Btn onClick={() => setDeleteId(p.id)} color="rgba(239,68,68,0.15)" textColor={C.err} style={{ padding: '8px 14px' }}>🗑️</Btn>
                </div>
              </div>
              {deleteId === p.id && <ConfirmDelete onConfirm={() => remove(p.id)} onCancel={() => setDeleteId(null)} />}
            </div>
          ))}
        </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifica Paziente' : 'Nuovo Paziente'}>
        <Field label="Nome *">
          <input style={inp} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Mario" />
        </Field>
        <Field label="Cognome">
          <input style={inp} value={form.surname} onChange={e => setForm(f => ({...f, surname: e.target.value}))} placeholder="Rossi" />
        </Field>
        <Field label="Codice Accesso *">
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...inp, fontFamily: 'monospace', letterSpacing: '3px', fontWeight: '700', color: C.accent }} value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} maxLength={10} />
            <Btn onClick={() => setForm(f => ({...f, code: generateCode()}))} color={C.s3} textColor={C.muted} style={{ whiteSpace: 'nowrap', padding: '10px 14px', fontSize: '12px' }}>🔄 Genera</Btn>
          </div>
          <p style={{ color: C.muted, fontSize: '12px', marginTop: '6px' }}>Questo codice lo dai al paziente per accedere all'app</p>
        </Field>
        <Field label="Email (opzionale)">
          <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="mario@email.it" />
        </Field>
        <Field label="Patologia / Problema">
          <input style={inp} value={form.condition} onChange={e => setForm(f => ({...f, condition: e.target.value}))} placeholder="Es: Dolore spalla, Lombosciatalgia..." />
        </Field>
        <Field label="Note private (solo per te)">
          <textarea style={ta} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Note riservate sul paziente..." />
        </Field>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn onClick={() => setModal(false)} color={C.s3} textColor={C.muted}>Annulla</Btn>
          <Btn onClick={save} color={C.accent} textColor="#000">💾 Salva Paziente</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── EXERCISES SECTION ─────────────────────────────────────────────────────────

function ExercisesSection() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expandId, setExpandId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', category: '', sets: '', reps: '', duration: '', difficulty: 'Medio' })

  const load = async () => {
    setLoading(true)
    const snap = await getExercisesFS()
    setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.category || '').localeCompare(b.category || '')))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', description: '', videoUrl: '', category: '', sets: '', reps: '', duration: '', difficulty: 'Medio' })
    setModal(true)
  }

  const openEdit = (ex) => {
    setEditing(ex)
    setForm({ title: ex.title || '', description: ex.description || '', videoUrl: ex.videoUrl || '', category: ex.category || '', sets: ex.sets || '', reps: ex.reps || '', duration: ex.duration || '', difficulty: ex.difficulty || 'Medio' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title) return alert('Il titolo è obbligatorio')
    if (editing) await updateExerciseFS(editing.id, form)
    else await addExerciseFS(form)
    setModal(false)
    load()
  }

  const remove = async (id) => {
    await deleteExerciseFS(id)
    setDeleteId(null)
    load()
  }

  const diffColor = { 'Facile': C.ok, 'Medio': C.accent3, 'Difficile': C.err }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>🏃 Esercizi</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{exercises.length} esercizi nella libreria</p>
        </div>
        <Btn onClick={openAdd}>+ Aggiungi Esercizio</Btn>
      </div>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        exercises.length === 0 ? <EmptyState icon="🏃" text="Nessun esercizio. Aggiungine uno per iniziare!" /> :
        <div style={{ display: 'grid', gap: '12px' }}>
          {exercises.map(ex => {
            const ytId = getYoutubeId(ex.videoUrl)
            const expanded = expandId === ex.id
            return (
              <div key={ex.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{ color: C.text, fontWeight: '600', fontSize: '16px' }}>{ex.title}</span>
                        {ex.category && <Badge color={C.accent}>{ex.category}</Badge>}
                        {ex.difficulty && <Badge color={diffColor[ex.difficulty] || C.muted}>{ex.difficulty}</Badge>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        {ex.sets && <span style={{ color: C.muted, fontSize: '13px' }}>🔁 {ex.sets} serie</span>}
                        {ex.reps && <span style={{ color: C.muted, fontSize: '13px' }}>✖ {ex.reps} rip.</span>}
                        {ex.duration && <span style={{ color: C.muted, fontSize: '13px' }}>⏱ {ex.duration}</span>}
                        {ytId && <span style={{ color: C.accent2, fontSize: '13px' }}>▶️ Video</span>}
                      </div>
                      {ex.description && !expanded && (
                        <p style={{ color: C.muted, fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{ex.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Btn onClick={() => setExpandId(expanded ? null : ex.id)} color={C.s3} textColor={C.muted} style={{ padding: '8px 12px', fontSize: '13px' }}>{expanded ? '▲' : '▼'}</Btn>
                      <Btn onClick={() => openEdit(ex)} color={C.s3} textColor={C.text} style={{ padding: '8px 12px' }}>✏️</Btn>
                      <Btn onClick={() => setDeleteId(ex.id)} color="rgba(239,68,68,0.1)" textColor={C.err} style={{ padding: '8px 12px' }}>🗑️</Btn>
                    </div>
                  </div>
                  {deleteId === ex.id && <ConfirmDelete onConfirm={() => remove(ex.id)} onCancel={() => setDeleteId(null)} />}
                </div>
                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    {ex.description && <p style={{ color: C.text, fontSize: '14px', lineHeight: '1.6', marginTop: '16px' }}>{ex.description}</p>}
                    {ytId && (
                      <div style={{ marginTop: '16px', borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/9' }}>
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen style={{ display: 'block' }} />
                      </div>
                    )}
                    {ex.videoUrl && !ytId && (
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: '14px', display: 'block', marginTop: '12px' }}>▶️ Apri video esterno</a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifica Esercizio' : 'Nuovo Esercizio'}>
        <Field label="Titolo *">
          <input style={inp} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Es: Mobilizzazione spalla" />
        </Field>
        <Field label="Categoria">
          <input style={inp} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="Es: Spalla, Schiena, Ginocchio..." />
        </Field>
        <Field label="Difficoltà">
          <select style={sel} value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}>
            {['Facile','Medio','Difficile'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <Field label="Serie"><input style={inp} value={form.sets} onChange={e => setForm(f => ({...f, sets: e.target.value}))} placeholder="3" /></Field>
          <Field label="Ripetizioni"><input style={inp} value={form.reps} onChange={e => setForm(f => ({...f, reps: e.target.value}))} placeholder="15" /></Field>
          <Field label="Durata"><input style={inp} value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} placeholder="30 sec" /></Field>
        </div>
        <Field label="URL Video YouTube (opzionale)">
          <input style={inp} value={form.videoUrl} onChange={e => setForm(f => ({...f, videoUrl: e.target.value}))} placeholder="https://youtube.com/watch?v=..." />
          {getYoutubeId(form.videoUrl) && <p style={{ color: C.ok, fontSize: '12px', marginTop: '6px' }}>✓ URL YouTube valido rilevato</p>}
        </Field>
        <Field label="Descrizione / Istruzioni">
          <textarea style={ta} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Descrivi come eseguire l'esercizio, posizione di partenza, respirazione, errori da evitare..." />
        </Field>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Btn onClick={() => setModal(false)} color={C.s3} textColor={C.muted}>Annulla</Btn>
          <Btn onClick={save} color={C.accent} textColor="#000">💾 Salva</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── THEORY SECTION ────────────────────────────────────────────────────────────

function TheorySection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expandId, setExpandId] = useState(null)
  const [form, setForm] = useState({ title: '', category: '', content: '' })

  const load = async () => {
    setLoading(true)
    const snap = await getTheoryFS()
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.category || '').localeCompare(b.category || '')))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', category: '', content: '' })
    setModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ title: item.title || '', category: item.category || '', content: item.content || '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title) return alert('Il titolo è obbligatorio')
    if (editing) await updateTheoryFS(editing.id, form)
    else await addTheoryFS(form)
    setModal(false)
    load()
  }

  const remove = async (id) => {
    await deleteTheoryFS(id)
    setDeleteId(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>📚 Contenuti Teorici</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{items.length} sezioni informative</p>
        </div>
        <Btn onClick={openAdd}>+ Aggiungi Contenuto</Btn>
      </div>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        items.length === 0 ? <EmptyState icon="📚" text="Nessun contenuto teorico. Aggiungi informazioni per i tuoi pazienti!" /> :
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map(item => {
            const expanded = expandId === item.id
            return (
              <div key={item.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ color: C.text, fontWeight: '600', fontSize: '16px' }}>{item.title}</span>
                      {item.category && <Badge color={C.accent2}>{item.category}</Badge>}
                    </div>
                    {!expanded && item.content && (
                      <p style={{ color: C.muted, fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.content}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Btn onClick={() => setExpandId(expanded ? null : item.id)} color={C.s3} textColor={C.muted} style={{ padding: '8px 12px' }}>{expanded ? '▲' : '▼'}</Btn>
                    <Btn onClick={() => openEdit(item)} color={C.s3} textColor={C.text} style={{ padding: '8px 12px' }}>✏️</Btn>
                    <Btn onClick={() => setDeleteId(item.id)} color="rgba(239,68,68,0.1)" textColor={C.err} style={{ padding: '8px 12px' }}>🗑️</Btn>
                  </div>
                </div>
                {deleteId === item.id && (
                  <div style={{ padding: '0 20px 16px' }}>
                    <ConfirmDelete onConfirm={() => remove(item.id)} onCancel={() => setDeleteId(null)} />
                  </div>
                )}
                {expanded && item.content && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ color: C.text, fontSize: '14px', lineHeight: '1.7', marginTop: '16px', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifica Contenuto' : 'Nuovo Contenuto Teorico'}>
        <Field label="Titolo *">
          <input style={inp} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Es: Anatomia della spalla" />
        </Field>
        <Field label="Categoria">
          <input style={inp} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="Es: Anatomia, Consigli, Post-operatorio..." />
        </Field>
        <Field label="Contenuto *">
          <textarea style={{ ...ta, minHeight: '200px' }} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} placeholder="Scrivi qui il testo informativo per i pazienti. Puoi includere consigli, spiegazioni anatomiche, indicazioni su cosa fare e non fare..." />
        </Field>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Btn onClick={() => setModal(false)} color={C.s3} textColor={C.muted}>Annulla</Btn>
          <Btn onClick={save} color={C.accent2} textColor="#fff">💾 Salva</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── DIARY VIEWER SECTION ──────────────────────────────────────────────────────

function DiarySection() {
  const [patients, setPatients] = useState([])
  const [allEntries, setAllEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCode, setSelectedCode] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [pSnap, dSnap] = await Promise.all([getPatientsFS(), getAllDiaryFS()])
    setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setAllEntries(dSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    await deleteDiaryFS(id)
    setDeleteId(null)
    load()
  }

  const entries = selectedCode === 'all' ? allEntries : allEntries.filter(e => e.patientCode === selectedCode)

  const painColor = (v) => {
    if (v <= 3) return C.ok
    if (v <= 6) return C.accent3
    return C.err
  }

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>📔 Diari Pazienti</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{entries.length} entrate trovate</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <select style={{ ...sel, maxWidth: '320px' }} value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>
          <option value="all">📋 Tutti i pazienti</option>
          {patients.map(p => <option key={p.id} value={p.code}>{p.name} {p.surname} ({p.code})</option>)}
        </select>
      </div>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        entries.length === 0 ? <EmptyState icon="📔" text="Nessuna voce di diario trovata." /> :
        <div style={{ display: 'grid', gap: '12px' }}>
          {entries.map(entry => (
            <div key={entry.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ color: C.text, fontWeight: '600', fontSize: '15px' }}>
                      {entry.patientName || entry.patientCode}
                    </span>
                    <Badge color={C.accent}>{entry.patientCode}</Badge>
                    <span style={{ color: C.muted, fontSize: '13px' }}>📅 {entry.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {entry.painLevel !== undefined && (
                      <div style={{ background: C.s2, borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: C.muted, fontSize: '12px' }}>DOLORE</span>
                        <span style={{ color: painColor(entry.painLevel), fontWeight: '700', fontSize: '18px' }}>{entry.painLevel}/10</span>
                      </div>
                    )}
                    {entry.mood !== undefined && (
                      <div style={{ background: C.s2, borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: C.muted, fontSize: '12px' }}>UMORE</span>
                        <span style={{ fontSize: '20px' }}>{moodEmojis[entry.mood - 1] || '😐'}</span>
                      </div>
                    )}
                  </div>

                  {entry.exercisesDone?.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>ESERCIZI ESEGUITI:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {entry.exercisesDone.map((ex, i) => (
                          <span key={i} style={{ background: ex.completed ? C.ok + '22' : C.s3, border: `1px solid ${ex.completed ? C.ok + '44' : C.border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: ex.completed ? C.ok : C.muted }}>
                            {ex.completed ? '✓' : '○'} {ex.exerciseName}
                            {ex.sets && ex.reps ? ` (${ex.sets}x${ex.reps})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.notes && (
                    <p style={{ color: C.text, fontSize: '14px', background: C.s2, padding: '10px 14px', borderRadius: '8px', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                      💬 "{entry.notes}"
                    </p>
                  )}
                </div>
                <Btn onClick={() => setDeleteId(entry.id)} color="rgba(239,68,68,0.1)" textColor={C.err} style={{ padding: '8px 12px', flexShrink: 0 }}>🗑️</Btn>
              </div>
              {deleteId === entry.id && <ConfirmDelete onConfirm={() => remove(entry.id)} onCancel={() => setDeleteId(null)} />}
            </div>
          ))}
        </div>
      }
    </div>
  )
}

// ── APPOINTMENTS SECTION ──────────────────────────────────────────────────────

function AppointmentsSection() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ patientId: '', patientName: '', date: '', time: '', notes: '' })

  const load = async () => {
    setLoading(true)
    const [aSnap, pSnap] = await Promise.all([getAppointmentsFS(), getPatientsFS()])
    setAppointments(aSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.date || !form.patientId) return alert('Seleziona un paziente e una data')
    const patient = patients.find(p => p.id === form.patientId)
    await addAppointmentFS({ ...form, patientName: patient ? `${patient.name} ${patient.surname}` : '' })
    setModal(false)
    load()
  }

  const remove = async (id) => {
    await deleteAppointmentFS(id)
    setDeleteId(null)
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter(a => a.date >= today)
  const past = appointments.filter(a => a.date < today)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>📅 Appuntamenti</h2>
          <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{upcoming.length} prossimi</p>
        </div>
        <Btn onClick={() => { setForm({ patientId: '', patientName: '', date: today, time: '', notes: '' }); setModal(true) }}>+ Aggiungi</Btn>
      </div>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> : (
        <>
          {upcoming.length > 0 && (
            <div>
              <p style={{ color: C.accent, fontSize: '13px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Prossimi</p>
              <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
                {upcoming.map(a => (
                  <div key={a.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: C.accent + '22', borderRadius: '8px', padding: '8px 14px', textAlign: 'center', minWidth: '70px' }}>
                      <p style={{ color: C.accent, fontWeight: '700', fontSize: '16px', margin: 0 }}>{a.date?.slice(8)}/{a.date?.slice(5,7)}</p>
                      {a.time && <p style={{ color: C.accent, fontSize: '12px', margin: 0 }}>{a.time}</p>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: C.text, fontWeight: '600', margin: 0 }}>{a.patientName}</p>
                      {a.notes && <p style={{ color: C.muted, fontSize: '13px', margin: '2px 0 0' }}>{a.notes}</p>}
                    </div>
                    <Btn onClick={() => setDeleteId(a.id)} color="rgba(239,68,68,0.1)" textColor={C.err} style={{ padding: '6px 10px' }}>🗑️</Btn>
                    {deleteId === a.id && <ConfirmDelete onConfirm={() => remove(a.id)} onCancel={() => setDeleteId(null)} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p style={{ color: C.muted, fontSize: '13px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📁 Passati</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {past.slice(0, 5).map(a => (
                  <div key={a.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6, flexWrap: 'wrap' }}>
                    <span style={{ color: C.muted, fontSize: '14px' }}>📅 {a.date} {a.time || ''}</span>
                    <span style={{ color: C.text, fontWeight: '600', flex: 1 }}>{a.patientName}</span>
                    <Btn onClick={() => setDeleteId(a.id)} color="rgba(239,68,68,0.1)" textColor={C.err} style={{ padding: '6px 10px' }}>🗑️</Btn>
                    {deleteId === a.id && <ConfirmDelete onConfirm={() => remove(a.id)} onCancel={() => setDeleteId(null)} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {upcoming.length === 0 && past.length === 0 && <EmptyState icon="📅" text="Nessun appuntamento. Aggiungine uno!" />}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nuovo Appuntamento">
        <Field label="Paziente *">
          <select style={sel} value={form.patientId} onChange={e => setForm(f => ({...f, patientId: e.target.value}))}>
            <option value="">-- Seleziona paziente --</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Data *"><input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></Field>
          <Field label="Orario"><input type="time" style={inp} value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} /></Field>
        </div>
        <Field label="Note">
          <textarea style={ta} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Obiettivi sessione, cosa portare..." />
        </Field>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Btn onClick={() => setModal(false)} color={C.s3} textColor={C.muted}>Annulla</Btn>
          <Btn onClick={save} color={C.accent} textColor="#000">💾 Salva</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── MAIN ADMIN PANEL ──────────────────────────────────────────────────────────

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState('patients')
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { id: 'patients', label: 'Pazienti', icon: '👥' },
    { id: 'exercises', label: 'Esercizi', icon: '🏃' },
    { id: 'theory', label: 'Teoria', icon: '📚' },
    { id: 'diary', label: 'Diari', icon: '📔' },
    { id: 'appointments', label: 'Appuntamenti', icon: '📅' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: C.s1, borderBottom: `1px solid ${C.border}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '36px', filter: 'brightness(0) invert(1) opacity(0.85)' }} />
            <p style={{ color: C.accent, fontSize: '11px', margin: 0, fontWeight: '700', letterSpacing: '1px' }}>PANNELLO ADMIN</p>
          </div>
          <button onClick={onLogout}
            style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${C.err}44`, color: C.err, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            ↩ Esci
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', flex: 1, padding: '0 16px', gap: '24px' }}>

        {/* Sidebar nav (desktop) */}
        <aside style={{ width: '180px', flexShrink: 0, paddingTop: '24px', display: 'none' }} className="sidebar">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: tab === t.id ? C.accent + '22' : 'transparent', color: tab === t.id ? C.accent : C.muted, fontWeight: tab === t.id ? '600' : '400', fontSize: '14px', transition: 'all 0.2s' }}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '24px 0 100px' }}>
          {tab === 'patients'     && <PatientsSection />}
          {tab === 'exercises'    && <ExercisesSection />}
          {tab === 'theory'       && <TheorySection />}
          {tab === 'diary'        && <DiarySection />}
          {tab === 'appointments' && <AppointmentsSection />}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.s1, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, padding: '0 4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '10px 4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: tab === t.id ? C.accent : C.muted, borderTop: `2px solid ${tab === t.id ? C.accent : 'transparent'}` }}>
            <span style={{ fontSize: '18px' }}>{t.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: tab === t.id ? '600' : '400' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
