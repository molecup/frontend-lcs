'use client';

import { useEffect, useState } from 'react';
import styles from './AccreditiForm.module.css';

export default function AccreditiForm({ initialStatus }) {
  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    email: '',
    school: '',
    privacyConsent: false,
    marketingOptIn: false
  });
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const res = await fetch('/api/accrediti');
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    };

    refresh();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setQrDataUrl(null);

    const res = await fetch('/api/accrediti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState)
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message ?? 'Errore durante la registrazione.');
      return;
    }

    setMessage(data.message);
    setQrDataUrl(data.qrDataUrl);
    setPdfData({ base64: data.pdfBase64, fileName: data.pdfFileName });
    setStatus((prev) => ({
      ...(prev ?? {}),
      remaining: data.remaining,
      maxCapacity: data.maxCapacity
    }));
  };

  const downloadPdf = () => {
    if (!pdfData?.base64) return;
    const byteString = atob(pdfData.base64);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfData.fileName || 'accredito.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Accrediti Leonessa Cup</h1>
        <p>Compila il modulo entro sabato ore 14:00 per ottenere il QR di accesso.</p>
        {status && status.remaining != null && status.maxCapacity != null && (
          <div className={styles.capacity}>
            <span>Posti rimasti</span>
            <strong>{status.remaining} / {status.maxCapacity}</strong>
          </div>
        )}
      </header>

      {!status?.isOpen && (
        <div className={styles.closedNotice}>
          Gli accrediti sono chiusi. Torna lunedi per il prossimo weekend.
        </div>
      )}

      {status?.isOpen && (
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <label>
              Nome e Cognome
              <input name="fullName" value={formState.fullName} onChange={onChange} required />
            </label>
            <label>
              Numero di telefono
              <input name="phone" value={formState.phone} onChange={onChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={formState.email} onChange={onChange} required />
            </label>
            <label>
              Scuola (facoltativo)
              <input name="school" value={formState.school} onChange={onChange} />
            </label>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="privacyConsent"
              checked={formState.privacyConsent}
              onChange={onChange}
              required
            />
            Acconsento al trattamento dei dati per la gestione accrediti. <a href="/privacy">Informativa privacy</a>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="marketingOptIn"
              checked={formState.marketingOptIn}
              onChange={onChange}
            />
            Voglio ricevere comunicazioni marketing (facoltativo)
          </label>

          {message && <p className={styles.message}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Invio in corso...' : 'Richiedi accredito'}
          </button>
        </form>
      )}

      {qrDataUrl && (
        <div className={styles.qrBox}>
          <h2>Accredito confermato</h2>
          <p>Il PDF del ticket è la prova ufficiale di accredito.</p>
          <img src={qrDataUrl} alt="QR accredito" />
          <button type="button" onClick={downloadPdf} className={styles.downloadButton}>
            Scarica ticket PDF
          </button>
        </div>
      )}
    </section>
  );
}
