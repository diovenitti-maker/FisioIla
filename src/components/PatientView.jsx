import { useState, useEffect } from 'react'
import {
  getExercisesFS, getTheoryFS,
  getDiaryByPatientFS, addDiaryFS,
  getAppointmentsFS,
} from '../firebase'

const C = {
  bg: '#080814', s1: '#10101f', s2: '#181830', s3: '#202040', s4: '#2a2a55',
  accent: '#00d4aa', accent2: '#a855f7', accent3: '#f59e0b',
  text: '#e2e8f0', muted: '#7a8a9a', border: '#252550',
  err: '#ef4444', ok: '#22c55e',
}

const getYoutubeId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

function Badge({ children, color = C.accent }) {
  return (
    <span style={{ padding: '3px 10px', background: color + '22', border: `1px solid ${color}44`, borderRadius: '20px', color, fontSize: '11px', fontWeight: '600' }}>
      {children}
    </span>
  )
}

// ── EXERCISES TAB ──────────────────────────────────────────────────────────────

function ExercisesTab() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandId, setExpandId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getExercisesFS().then(snap => {
      setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const categories = ['all', ...new Set(exercises.map(e => e.category).filter(Boolean))]
  const filtered = filter === 'all' ? exercises : exercises.filter(e => e.category === filter)

  const diffColor = { 'Facile': C.ok, 'Medio': C.accent3, 'Difficile': C.err }

  return (
    <div>
      <h2 style={{ color: C.text, fontSize: '20px', margin: '0 0 6px' }}>🏃 I tuoi Esercizi</h2>
      <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 20px' }}>Esegui gli esercizi seguendo le indicazioni del tuo fisioterapista</p>

      {/* Category filter */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${filter === cat ? C.accent : C.border}`,
                background: filter === cat ? C.accent + '22' : 'transparent', color: filter === cat ? C.accent : C.muted,
                cursor: 'pointer', fontSize: '13px', fontWeight: filter === cat ? '600' : '400' }}>
              {cat === 'all' ? '📋 Tutti' : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        exercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏃</div>
            <p>Gli esercizi non sono ancora stati inseriti. Ricontrolla presto!</p>
          </div>
        ) :
        filtered.length === 0 ? <p style={{ color: C.muted }}>Nessun esercizio per questa categoria.</p> :
        <div style={{ display: 'grid', gap: '14px' }}>
          {filtered.map(ex => {
            const ytId = getYoutubeId(ex.videoUrl)
            const expanded = expandId === ex.id
            return (
              <div key={ex.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
                <button onClick={() => setExpandId(expanded ? null : ex.id)}
                  style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ color: C.text, fontWeight: '700', fontSize: '16px' }}>{ex.title}</span>
                      {ex.category && <Badge color={C.accent}>{ex.category}</Badge>}
                      {ex.difficulty && <Badge color={diffColor[ex.difficulty] || C.muted}>{ex.difficulty}</Badge>}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      {ex.sets && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: C.accent, fontSize: '18px', fontWeight: '700' }}>{ex.sets}</span>
                          <span style={{ color: C.muted, fontSize: '12px' }}>serie</span>
                        </div>
                      )}
                      {ex.reps && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: C.accent, fontSize: '18px', fontWeight: '700' }}>{ex.reps}</span>
                          <span style={{ color: C.muted, fontSize: '12px' }}>ripetizioni</span>
                        </div>
                      )}
                      {ex.duration && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: C.accent3, fontSize: '14px', fontWeight: '600' }}>⏱ {ex.duration}</span>
                        </div>
                      )}
                      {ytId && <span style={{ color: C.accent2, fontSize: '13px' }}>▶️ Video disponibile</span>}
                    </div>
                  </div>
                  <span style={{ color: C.muted, fontSize: '20px', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>›</span>
                </button>

                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    {ex.description && (
                      <p style={{ color: C.text, fontSize: '14px', lineHeight: '1.7', marginTop: '16px', whiteSpace: 'pre-wrap' }}>{ex.description}</p>
                    )}
                    {ytId && (
                      <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen style={{ display: 'block' }} />
                      </div>
                    )}
                    {ex.videoUrl && !ytId && (
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: '14px', padding: '10px 18px', background: C.accent2 + '22', border: `1px solid ${C.accent2}44`, borderRadius: '8px', color: C.accent2, textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                        ▶️ Guarda il video
                      </a>
                    )}
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: C.s2, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>💡</span>
                      <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Ricordati di respirare regolarmente durante l'esercizio e di fermarti se senti dolore acuto.</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── THEORY TAB ────────────────────────────────────────────────────────────────

function TheoryTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandId, setExpandId] = useState(null)

  useEffect(() => {
    getTheoryFS().then(snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h2 style={{ color: C.text, fontSize: '20px', margin: '0 0 6px' }}>📚 Informazioni & Consigli</h2>
      <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 20px' }}>Materiale informativo preparato da Ilaria per il tuo percorso</p>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
            <p>I contenuti informativi non sono ancora stati inseriti. Ricontrolla presto!</p>
          </div>
        ) :
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map(item => {
            const expanded = expandId === item.id
            return (
              <div key={item.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <button onClick={() => setExpandId(expanded ? null : item.id)}
                  style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: C.text, fontWeight: '600', fontSize: '16px' }}>{item.title}</span>
                      {item.category && <Badge color={C.accent2}>{item.category}</Badge>}
                    </div>
                    {!expanded && item.content && (
                      <p style={{ color: C.muted, fontSize: '13px', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.content}
                      </p>
                    )}
                  </div>
                  <span style={{ color: C.accent2, fontSize: '24px', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                </button>
                {expanded && item.content && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ color: C.text, fontSize: '15px', lineHeight: '1.75', marginTop: '16px', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── DIARY TAB ─────────────────────────────────────────────────────────────────

function DiaryTab({ user }) {
  const [entries, setEntries] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [expandId, setExpandId] = useState(null)
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today,
    painLevel: 5,
    mood: 3,
    notes: '',
    exercisesDone: [],
  })

  const load = async () => {
    setLoading(true)
    const [dSnap, eSnap] = await Promise.all([getDiaryByPatientFS(user.code), getExercisesFS()])
    setEntries(dSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setExercises(eSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({
      date: today,
      painLevel: 5,
      mood: 3,
      notes: '',
      exercisesDone: exercises.map(ex => ({ exerciseId: ex.id, exerciseName: ex.title, sets: ex.sets || '', reps: ex.reps || '', completed: false })),
    })
    setModal(true)
  }

  const toggleExercise = (idx) => {
    setForm(f => ({
      ...f,
      exercisesDone: f.exercisesDone.map((ex, i) => i === idx ? { ...ex, completed: !ex.completed } : ex),
    }))
  }

  const updateExField = (idx, field, value) => {
    setForm(f => ({
      ...f,
      exercisesDone: f.exercisesDone.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex),
    }))
  }

  const save = async () => {
    setSaving(true)
    await addDiaryFS({
      patientCode: user.code,
      patientName: `${user.name} ${user.surname || ''}`.trim(),
      ...form,
    })
    setModal(false)
    setSaving(false)
    load()
  }

  const painColor = (v) => {
    if (v <= 3) return C.ok
    if (v <= 6) return C.accent3
    return C.err
  }

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']
  const moodLabels = ['Pessimo', 'Non bene', 'Normale', 'Bene', 'Ottimo']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h2 style={{ color: C.text, fontSize: '20px', margin: 0 }}>📔 Il mio Diario</h2>
        <button onClick={openNew}
          style={{ padding: '10px 18px', background: C.accent, border: 'none', borderRadius: '10px', color: '#000', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          + Aggiungi
        </button>
      </div>
      <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 20px' }}>Registra gli esercizi fatti e come ti senti ogni giorno</p>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> :
        entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📔</div>
            <p>Nessuna voce nel diario. Inizia a registrare i tuoi progressi!</p>
          </div>
        ) :
        <div style={{ display: 'grid', gap: '12px' }}>
          {entries.map(entry => {
            const expanded = expandId === entry.id
            return (
              <div key={entry.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <button onClick={() => setExpandId(expanded ? null : entry.id)}
                  style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ color: C.text, fontWeight: '700', fontSize: '15px' }}>📅 {entry.date}</span>
                      {entry.mood !== undefined && <span style={{ fontSize: '20px' }}>{moodEmojis[(entry.mood || 3) - 1]}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      {entry.painLevel !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: C.muted, fontSize: '12px' }}>Dolore:</span>
                          <span style={{ color: painColor(entry.painLevel), fontWeight: '700', fontSize: '16px' }}>{entry.painLevel}/10</span>
                        </div>
                      )}
                      {entry.exercisesDone?.filter(e => e.completed).length > 0 && (
                        <span style={{ color: C.ok, fontSize: '13px' }}>
                          ✓ {entry.exercisesDone.filter(e => e.completed).length} esercizi completati
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: C.muted, fontSize: '22px', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                </button>

                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '14px' }}>
                      {entry.painLevel !== undefined && (
                        <div style={{ background: C.s2, borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
                          <p style={{ color: C.muted, fontSize: '11px', margin: '0 0 4px', fontWeight: '600' }}>LIVELLO DOLORE</p>
                          <p style={{ color: painColor(entry.painLevel), fontSize: '24px', fontWeight: '700', margin: 0 }}>{entry.painLevel}<span style={{ fontSize: '14px', color: C.muted }}>/10</span></p>
                        </div>
                      )}
                      {entry.mood !== undefined && (
                        <div style={{ background: C.s2, borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
                          <p style={{ color: C.muted, fontSize: '11px', margin: '0 0 4px', fontWeight: '600' }}>UMORE</p>
                          <p style={{ fontSize: '24px', margin: '0 0 2px' }}>{moodEmojis[(entry.mood || 3) - 1]}</p>
                          <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{moodLabels[(entry.mood || 3) - 1]}</p>
                        </div>
                      )}
                    </div>

                    {entry.exercisesDone?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>ESERCIZI:</p>
                        <div style={{ display: 'grid', gap: '6px' }}>
                          {entry.exercisesDone.map((ex, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: ex.completed ? C.ok + '11' : C.s2, borderRadius: '8px', border: `1px solid ${ex.completed ? C.ok + '33' : C.border}` }}>
                              <span style={{ fontSize: '16px' }}>{ex.completed ? '✅' : '⬜'}</span>
                              <span style={{ color: ex.completed ? C.text : C.muted, fontSize: '14px', flex: 1 }}>{ex.exerciseName}</span>
                              {ex.sets && ex.reps && <span style={{ color: C.muted, fontSize: '12px' }}>{ex.sets}×{ex.reps}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <div style={{ background: C.s2, borderRadius: '10px', padding: '12px 16px' }}>
                        <p style={{ color: C.muted, fontSize: '12px', fontWeight: '600', margin: '0 0 6px' }}>NOTE:</p>
                        <p style={{ color: C.text, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{entry.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      }

      {/* New Entry Modal */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.s1, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto', border: `1px solid ${C.border}` }}>
            <div style={{ position: 'sticky', top: 0, background: C.s1, padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: C.text, margin: 0 }}>📝 Nuova voce diario</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>DATA</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  style={{ width: '100%', padding: '11px 14px', background: C.s2, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Pain Level */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
                  LIVELLO DI DOLORE — <span style={{ color: painColor(form.painLevel), fontSize: '18px', fontWeight: '700' }}>{form.painLevel}/10</span>
                  <span style={{ color: C.muted, fontWeight: '400', textTransform: 'none', marginLeft: '8px' }}>
                    {form.painLevel <= 2 ? '😊 Nessun dolore' : form.painLevel <= 4 ? '🙂 Lieve' : form.painLevel <= 6 ? '😐 Moderato' : form.painLevel <= 8 ? '😕 Forte' : '😢 Molto forte'}
                  </span>
                </label>
                <input type="range" min="0" max="10" value={form.painLevel} onChange={e => setForm(f => ({...f, painLevel: Number(e.target.value)}))}
                  style={{ width: '100%', accentColor: painColor(form.painLevel) }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: '11px', marginTop: '4px' }}>
                  <span>0 - Nessuno</span><span>5 - Moderato</span><span>10 - Massimo</span>
                </div>
              </div>

              {/* Mood */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>COME TI SENTI?</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  {['😢','😕','😐','🙂','😊'].map((emoji, i) => (
                    <button key={i} onClick={() => setForm(f => ({...f, mood: i + 1}))}
                      style={{ flex: 1, padding: '12px 4px', background: form.mood === i + 1 ? C.accent + '22' : C.s2, border: `2px solid ${form.mood === i + 1 ? C.accent : C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      {emoji}
                      <span style={{ color: form.mood === i + 1 ? C.accent : C.muted, fontSize: '10px' }}>
                        {['Pessimo','Non bene','Normale','Bene','Ottimo'][i]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises done */}
              {form.exercisesDone.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>ESERCIZI ESEGUITI OGGI</label>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {form.exercisesDone.map((ex, i) => (
                      <div key={i} style={{ background: ex.completed ? C.ok + '11' : C.s2, border: `1px solid ${ex.completed ? C.ok + '44' : C.border}`, borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: ex.completed ? '10px' : 0 }}>
                          <button onClick={() => toggleExercise(i)}
                            style={{ fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                            {ex.completed ? '✅' : '⬜'}
                          </button>
                          <span style={{ color: C.text, fontSize: '14px', fontWeight: '500', flex: 1 }}>{ex.exerciseName}</span>
                        </div>
                        {ex.completed && (
                          <div style={{ display: 'flex', gap: '10px', paddingLeft: '32px' }}>
                            <div>
                              <label style={{ color: C.muted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Serie</label>
                              <input value={ex.sets} onChange={e => updateExField(i, 'sets', e.target.value)}
                                style={{ width: '60px', padding: '6px 8px', background: C.s3, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text, fontSize: '14px', outline: 'none', textAlign: 'center' }} />
                            </div>
                            <div>
                              <label style={{ color: C.muted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Ripetizioni</label>
                              <input value={ex.reps} onChange={e => updateExField(i, 'reps', e.target.value)}
                                style={{ width: '80px', padding: '6px 8px', background: C.s3, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text, fontSize: '14px', outline: 'none', textAlign: 'center' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>NOTE DEL GIORNO</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Come è andata? Hai notato miglioramenti? Hai avuto difficoltà con qualche esercizio?"
                  style={{ width: '100%', padding: '12px 14px', background: C.s2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical', lineHeight: '1.5' }} />
              </div>

              <button onClick={save} disabled={saving}
                style={{ width: '100%', padding: '15px', background: saving ? '#333' : C.accent, border: 'none', borderRadius: '12px', color: '#000', fontWeight: '700', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Salvataggio...' : '💾 Salva nel diario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── APPOINTMENTS TAB ──────────────────────────────────────────────────────────

function AppointmentsTab({ user }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    getAppointmentsFS().then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAppointments(all.filter(a => a.patientCode === user.code || a.patientName?.includes(user.name)))
      setLoading(false)
    })
  }, [])

  const upcoming = appointments.filter(a => a.date >= today)
  const past = appointments.filter(a => a.date < today)

  return (
    <div>
      <h2 style={{ color: C.text, fontSize: '20px', margin: '0 0 6px' }}>📅 I miei Appuntamenti</h2>
      <p style={{ color: C.muted, fontSize: '14px', margin: '0 0 20px' }}>I prossimi appuntamenti con Ilaria</p>

      {loading ? <p style={{ color: C.muted }}>Caricamento...</p> : (
        <>
          {upcoming.length === 0 && past.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
              <p>Nessun appuntamento trovato.</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: C.accent, fontSize: '13px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>📅 Prossimi</p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {upcoming.map(a => (
                      <div key={a.id} style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ background: C.accent + '22', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '64px' }}>
                          <p style={{ color: C.accent, fontWeight: '700', fontSize: '18px', margin: 0 }}>{a.date?.slice(8)}</p>
                          <p style={{ color: C.accent, fontSize: '13px', margin: 0 }}>{['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'][Number(a.date?.slice(5,7)) - 1]}</p>
                        </div>
                        <div>
                          {a.time && <p style={{ color: C.accent, fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>🕐 {a.time}</p>}
                          {a.notes && <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>{a.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <p style={{ color: C.muted, fontSize: '13px', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>📁 Passati</p>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {past.slice(0, 3).map(a => (
                      <div key={a.id} style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px', opacity: 0.6, display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: C.muted, fontSize: '14px' }}>📅 {a.date}</span>
                        {a.time && <span style={{ color: C.muted, fontSize: '14px' }}>{a.time}</span>}
                        {a.notes && <span style={{ color: C.muted, fontSize: '14px', flex: 1 }}>{a.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── MAIN PATIENT VIEW ─────────────────────────────────────────────────────────

export default function PatientView({ user, onLogout }) {
  const [tab, setTab] = useState('exercises')

  const tabs = [
    { id: 'exercises', label: 'Esercizi', icon: '🏃' },
    { id: 'theory', label: 'Consigli', icon: '📚' },
    { id: 'diary', label: 'Diario', icon: '📔' },
    { id: 'appointments', label: 'Appuntamenti', icon: '📅' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* Header */}
      <header style={{ background: C.s1, borderBottom: `1px solid ${C.border}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '32px', filter: 'brightness(0) invert(1) opacity(0.85)' }} />
            <div>
              <p style={{ color: C.text, fontWeight: '700', fontSize: '15px', margin: 0 }}>{user.name} {user.surname || ''}</p>
              <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>Codice: <span style={{ color: C.accent, fontFamily: 'monospace', fontWeight: '700' }}>{user.code}</span></p>
            </div>
          </div>
          <button onClick={onLogout}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Esci
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px 100px' }}>
        {tab === 'exercises'    && <ExercisesTab />}
        {tab === 'theory'       && <TheoryTab />}
        {tab === 'diary'        && <DiaryTab user={user} />}
        {tab === 'appointments' && <AppointmentsTab user={user} />}
      </div>

      {/* Bottom nav */}
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
