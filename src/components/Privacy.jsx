const C = {
  bg: '#080814', s1: '#10101f', s2: '#181830',
  accent: '#00d4aa', accent2: '#a855f7',
  text: '#e2e8f0', muted: '#7a8a9a', border: '#252550',
}

export default function Privacy({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: '15px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Torna al login
        </button>

        <div style={{ background: C.s1, borderRadius: '16px', padding: '32px', border: `1px solid ${C.border}` }}>

          <h1 style={{ color: C.text, fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>
            🔒 Informativa sulla Privacy
          </h1>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '32px' }}>
            Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003
          </p>

          {[
            {
              title: '1. Titolare del trattamento',
              content: `Ilaria Melaranci — Fisioterapista\nI dati raccolti tramite questa applicazione sono trattati sotto la sua esclusiva responsabilità professionale.`
            },
            {
              title: '2. Dati raccolti',
              content: `L'applicazione raccoglie e tratta i seguenti dati personali:\n• Nome e cognome del paziente\n• Codice di accesso personale\n• Diari riabilitativi (esercizi svolti, livello di dolore, note personali)\n• Eventuali informazioni sulla patologia trattata\n\nNon vengono raccolti dati sensibili di natura diagnostica approfondita, né dati finanziari o documenti di identità.`
            },
            {
              title: '3. Finalità del trattamento',
              content: `I dati sono trattati esclusivamente per:\n• Supportare il percorso riabilitativo del paziente\n• Consentire la comunicazione degli esercizi e dei contenuti terapeutici\n• Permettere al paziente di tenere un diario dei progressi\n\nI dati NON vengono ceduti a terzi né utilizzati per scopi commerciali.`
            },
            {
              title: '4. Base giuridica',
              content: `Il trattamento si basa sul consenso esplicito del paziente (Art. 6 e Art. 9 GDPR) fornito al momento della presa in carico professionale e confermato dall'utilizzo dell'applicazione tramite il codice personale assegnato.`
            },
            {
              title: '5. Sicurezza dei dati',
              content: `I dati sono archiviati su Firebase (Google Cloud), piattaforma certificata e sicura. L'accesso è protetto da un codice personale univoco assegnato dal professionista. Nessun dato è visibile senza autenticazione.`
            },
            {
              title: '6. Conservazione',
              content: `I dati vengono conservati per la durata del percorso riabilitativo e per il tempo necessario agli obblighi di legge previsti per la documentazione sanitaria (10 anni). Al termine, il paziente può richiedere la cancellazione.`
            },
            {
              title: '7. Diritti dell\'interessato',
              content: `Ai sensi degli artt. 15-22 GDPR, ogni paziente ha il diritto di:\n• Accedere ai propri dati\n• Richiederne la rettifica o cancellazione\n• Opporsi al trattamento\n• Richiedere la portabilità dei dati\n\nPer esercitare questi diritti contattare direttamente il professionista.`
            },
            {
              title: '8. Contatti',
              content: `Per qualsiasi richiesta relativa alla privacy o ai propri dati, contattare direttamente Ilaria Melaranci durante le sedute di fisioterapia o tramite i recapiti forniti al momento della presa in carico.`
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: i < 7 ? `1px solid ${C.border}` : 'none' }}>
              <h2 style={{ color: C.accent, fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>{section.title}</h2>
              <p style={{ color: C.text, fontSize: '14px', lineHeight: '1.75', margin: 0, whiteSpace: 'pre-line' }}>{section.content}</p>
            </div>
          ))}

          <div style={{ background: C.s2, borderRadius: '10px', padding: '16px', marginTop: '8px', border: `1px solid ${C.accent}33` }}>
            <p style={{ color: C.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
              📅 <strong style={{ color: C.text }}>Ultimo aggiornamento:</strong> Luglio 2026<br/>
              Utilizzando questa applicazione con il codice personale assegnato, il paziente conferma di aver letto e compreso la presente informativa.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
