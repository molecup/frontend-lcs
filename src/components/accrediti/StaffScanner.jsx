'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import styles from './StaffScanner.module.css';

export default function StaffScanner() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let active = true;

    codeReader.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
      if (!active) return;
      if (result) {
        const payload = result.getText();
        await verifyPayload(payload);
      }
    });

    return () => {
      active = false;
      if (typeof codeReader.dispose === 'function') {
        codeReader.dispose();
        return;
      }
      if (typeof codeReader.stop === 'function') {
        codeReader.stop();
        return;
      }
      if (typeof codeReader.reset === 'function') {
        codeReader.reset();
      }
    };
  }, []);

  const verifyPayload = async (qrPayload) => {
    if (!qrPayload) return;
    const res = await fetch('/api/accrediti/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrPayload })
    });

    const data = await res.json().catch(() => ({}));
    setStatus({
      ok: res.ok,
      ...data
    });
  };

  const onManualSubmit = async (event) => {
    event.preventDefault();
    await verifyPayload(manualValue.trim());
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cameraBox}>
        <video ref={videoRef} className={styles.video} />
      </div>

      <form onSubmit={onManualSubmit} className={styles.manualForm}>
        <input
          value={manualValue}
          onChange={(event) => setManualValue(event.target.value)}
          placeholder="Incolla il codice QR"
        />
        <button type="submit">Verifica</button>
      </form>

      {status && (
        <div className={`${styles.result} ${status.valid ? styles.valid : styles.invalid}`}>
          <strong>{status.valid ? 'Valido' : 'Non valido'}</strong>
          <span>{status.message}</span>
          {status.fullName && <span>Utente: {status.fullName}</span>}
          {status.status && <span>Stato: {status.status}</span>}
        </div>
      )}
    </div>
  );
}
