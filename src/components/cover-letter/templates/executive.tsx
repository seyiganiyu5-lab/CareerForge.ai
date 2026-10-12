import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';
import type { CoverLetterTemplateProps } from './professional';

// ─── Executive Template ───────────────────────────────────────

export default function Executive({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;
  const accent = customization.accentColor;

  const baseSize = 11.5 * fs;
  const smallSize = 10 * fs;
  const nameSize = 18 * fs;
  const paraSpacing = 10 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  return (
    <div style={{ padding: `${m}px`, fontFamily: font, fontSize: `${baseSize}px`, lineHeight: lh, color: '#1a1a2e' }}>
      {/* Executive Header */}
      <div style={{
        borderBottom: `3px solid ${accent}`,
        paddingBottom: '16px',
        marginBottom: '20px',
      }}>
        {data.fullName && (
          <div style={{
            fontSize: `${nameSize}px`,
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.02em',
            textTransform: 'uppercase' as const,
            marginBottom: '8px',
          }}>
            {data.fullName}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: `${smallSize}px`, color: '#555' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.address && <span>{data.address}</span>}
        </div>
      </div>

      {/* Date */}
      {dateStr && (
        <div style={{ marginBottom: '20px', fontSize: `${smallSize}px`, color: '#666' }}>{dateStr}</div>
      )}

      {/* Recipient */}
      {(data.hiringManager || data.companyName) && (
        <div style={{ marginBottom: '20px' }}>
          {data.hiringManager && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{data.hiringManager}</div>}
          {data.companyName && <div style={{ fontSize: `${smallSize}px`, color: '#555' }}>{data.companyName}</div>}
          {data.companyAddress && <div style={{ fontSize: `${smallSize}px`, color: '#555', whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}
        </div>
      )}

      {/* Salutation */}
      {data.salutation && (
        <div style={{ marginBottom: `${paraSpacing}px` }}>{data.salutation}</div>
      )}

      {/* Opening */}
      {data.opening && (
        <div style={{ marginBottom: `${paraSpacing}px`, textAlign: 'justify' }}>{data.opening}</div>
      )}

      {/* Body */}
      {data.body && (
        <div style={{ marginBottom: `${paraSpacing}px`, textAlign: 'justify' }}>
          {data.body.split('\n').map((para, i) => (
            <div key={i} style={{ marginBottom: i < data.body.split('\n').length - 1 ? `${paraSpacing}px` : 0 }}>
              {para.trim()}
            </div>
          ))}
        </div>
      )}

      {/* Closing */}
      {data.closing && (
        <div style={{ marginBottom: '32px', textAlign: 'justify' }}>{data.closing}</div>
      )}

      {/* Sign Off */}
      <div style={{ marginTop: '32px' }}>
        {data.signOff && <div style={{ marginBottom: '48px' }}>{data.signOff}</div>}
        {data.fullName && (
          <div style={{ fontSize: `${baseSize}px`, fontWeight: 700, color: accent }}>{data.fullName}</div>
        )}
      </div>
    </div>
  );
}
