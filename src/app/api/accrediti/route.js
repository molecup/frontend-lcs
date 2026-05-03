import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  getOrCreateCurrentWeekend,
  getWeekendWindow,
  isRegistrationOpen
} from '@/lib/accrediti/weekend';
import { hitRateLimit } from '@/lib/accrediti/rateLimit';
import {
  buildQrPayload,
  createToken,
  generateQrDataUrl,
  hashToken
} from '@/lib/accrediti/qr';
import { buildTicketPdf } from '@/lib/accrediti/pdf';

const formSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  school: z.string().max(120).optional().or(z.literal('')),
  privacyConsent: z.boolean().refine((val) => val === true),
  marketingOptIn: z.boolean().optional()
});

const getClientIp = (request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
};

const formatWeekendLabel = (startDate) => {
  const formatter = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const saturday = formatter.format(startDate);
  const sunday = formatter.format(new Date(startDate.getTime() + 86400000));
  return `${saturday} - ${sunday}`;
};

export async function GET() {
  const supabase = getSupabaseAdmin();
  const weekend = await getOrCreateCurrentWeekend(supabase);
  const { count, error: countError } = await supabase
    .from('accreditations')
    .select('id', { count: 'exact', head: true })
    .eq('weekend_id', weekend.id);

  if (countError) {
    return NextResponse.json({ message: 'Errore lettura accrediti.' }, { status: 500 });
  }

  const total = count ?? 0;
  const remaining = null;
  const { opensAt, closesAt, weekendKey } = getWeekendWindow();

  return NextResponse.json({
    weekendKey,
    isOpen: isRegistrationOpen(),
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
    maxCapacity: null,
    remaining
  });
}

export async function POST(request) {
  const rateKey = `accrediti:${getClientIp(request)}`;
  const limit = hitRateLimit({ key: rateKey, limit: 6, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'Troppe richieste, riprova tra poco.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dati non validi.' }, { status: 400 });
  }

  if (!isRegistrationOpen()) {
    return NextResponse.json(
      { message: 'Gli accrediti sono chiusi.' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();
  const weekend = await getOrCreateCurrentWeekend(supabase);
  const { count: totalCount, error: totalError } = await supabase
    .from('accreditations')
    .select('id', { count: 'exact', head: true })
    .eq('weekend_id', weekend.id);

  if (totalError) {
    return NextResponse.json({ message: 'Errore lettura accrediti.' }, { status: 500 });
  }

  const total = totalCount ?? 0;

  const { fullName, phone, email, school, marketingOptIn, privacyConsent } = parsed.data;

  const { data: duplicate, error: duplicateError } = await supabase
    .from('accreditations')
    .select('id')
    .eq('weekend_id', weekend.id)
    .or(`email.eq.${email},phone.eq.${phone}`)
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return NextResponse.json({ message: 'Errore verifica duplicati.' }, { status: 500 });
  }

  if (duplicate?.id) {
    return NextResponse.json(
      { message: 'Hai già un accredito per questo weekend.' },
      { status: 409 }
    );
  }

  const token = createToken();
  const tokenHash = hashToken(token);
  const qrPayload = buildQrPayload({ token });
  const qrDataUrl = await generateQrDataUrl(qrPayload);

  const { error: insertError } = await supabase
    .from('accreditations')
    .insert({
      weekend_id: weekend.id,
      full_name: fullName,
      phone,
      email,
      school: school || null,
      qr_token_hash: tokenHash,
      marketing_opt_in: Boolean(marketingOptIn),
      privacy_consent: Boolean(privacyConsent)
    });

  if (insertError) {
    return NextResponse.json({ message: 'Errore salvataggio accredito.' }, { status: 500 });
  }

  const weekendLabel = formatWeekendLabel(new Date(weekend.start_date));
  const pdfBytes = await buildTicketPdf({
    fullName,
    weekendLabel,
    qrDataUrl,
    ticketCode: token
  });
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  const remaining = null;

  return NextResponse.json({
    message: 'Accredito confermato! Scarica subito il ticket PDF.',
    qrDataUrl,
    pdfBase64,
    pdfFileName: `accredito-${token}.pdf`,
    weekendLabel,
    remaining,
    maxCapacity: null
  });
}
