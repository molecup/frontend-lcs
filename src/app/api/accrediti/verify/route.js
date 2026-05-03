import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { parseQrPayload, hashToken } from '@/lib/accrediti/qr';
import { getOrCreateCurrentWeekend, getWeekendDayLabel, isWithinWeekend } from '@/lib/accrediti/weekend';

export async function POST(request) {
  const body = await request.json();
  const payload = parseQrPayload(body?.qrPayload);

  if (!payload) {
    return NextResponse.json({ valid: false, message: 'QR non valido.' }, { status: 400 });
  }

  if (!isWithinWeekend()) {
    return NextResponse.json({ valid: false, message: 'Accredito fuori weekend.' }, { status: 403 });
  }

  const tokenHash = hashToken(payload.token);
  const supabase = getSupabaseAdmin();
  const { data: accredito, error: accreditoError } = await supabase
    .from('accreditations')
    .select('*')
    .eq('weekend_id', payload.weekendId)
    .eq('qr_token_hash', tokenHash)
    .maybeSingle();

  if (accreditoError) {
    return NextResponse.json({ valid: false, message: 'Errore lettura accredito.' }, { status: 500 });
  }

  if (!accredito) {
    return NextResponse.json({ valid: false, message: 'Accredito non trovato.' }, { status: 404 });
  }

  const day = getWeekendDayLabel();
  if (day === 'other') {
    return NextResponse.json({ valid: false, message: 'Uso consentito solo nel weekend.' }, { status: 403 });
  }

  let nextStatus = accredito.status;
  let valid = false;

  if (day === 'saturday') {
    if (accredito.status === 'unused') {
      valid = true;
      nextStatus = 'used_saturday';
    }
  }

  if (day === 'sunday') {
    if (accredito.status === 'unused' || accredito.status === 'used_saturday') {
      valid = true;
      nextStatus = 'used_sunday';
    }
  }

  if (!valid) {
    return NextResponse.json({
      valid: false,
      message: 'Accredito già usato per oggi.',
      fullName: accredito.fullName,
      status: accredito.status
    }, { status: 409 });
  }

  const { data: updated, error: updateError } = await supabase
    .from('accreditations')
    .update({ status: nextStatus })
    .eq('id', accredito.id)
    .select('*')
    .single();

  if (updateError) {
    return NextResponse.json({ valid: false, message: 'Errore aggiornamento accredito.' }, { status: 500 });
  }

  return NextResponse.json({
    valid: true,
    message: 'Ingresso valido.',
    fullName: updated.full_name,
    status: updated.status
  });
}

