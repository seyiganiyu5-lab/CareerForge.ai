import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';
import type { CoverLetterTemplateProps } from './professional';

// ─── Minimal Template ───────────────────────────────────────

export default function Minimal({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;
  const accent = customization.accentColor;

  const baseSize = 11 * fs;
  const smallSize = 10 * fs;
  const nameSize = 22 * fs;
  const paraSpacing = 12 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  return (
    <div style={{ padding: `${m}px`, fontFamily: font, fontSize: `${baseSize}px`, lineHeight: lh, color: '#111' }}>
      {/* Minimal Header */}
      <div style={{ marginBottom: '32px' }}>
        {data.fullName && (
          <div style={{
            fontSize: `${nameSize}px`,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: '#111',
            marginBottom: '8px',
          }}>
            {data.fullName}
          </div>
        )}
        <div style={{ fontSize: `${smallSize}px`, color: '#888', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.address && <span>{data.address}</span>}
        </div>
      </div>

      {/* Thin line */}
      <div style={{ height: '1px', backgroundColor: '#e5e5e5', marginBottom: '32px' }} />

      {/* Date */}
      {dateStr && (
        <div style={{ marginBottom: '28px', fontSize: `${smallSize}px`, color: '#999' }}>{dateStr}</div>
      )}

      {/* Recipient */}
      {(data.hiringManager || data.companyName) && (
        <div style={{ marginBottom: '28px', fontSize: `${smallSize}px`, color: '#666' }}>
          {data.hiringManager && <div style={{ fontWeight: 500, marginBottom: '2px' }}>{data.hiringManager}</div>}
          {data.companyName && <div style={{ marginBottom: '2px' }}>{data.companyName}</div>}
          {data.companyAddress && <div style={{ whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}
        </div>
      )}

      {/* Salutation */}
      {data.salutation && (
        <div style={{ marginBottom: `${paraSpacing}px`, fontWeight: 400 }}>{data.salutation}</div>
      )}

      {/* Opening */}
      {data.opening && (
        <div style={{ marginBottom: `${paraSpacing}px` }}>{data.opening}</div>
      )}

      {/* Body */}
      {data.body && (
        <div style={{ marginBottom: `${paraSpacing}px` }}>
          {data.body.split('\n').map((para, i) => (
            <div key={i} style={{ marginBottom: i < data.body.split('\n').length - 1 ? `${paraSpacing}px` : 0 }}>
              {para.trim()}
            </div>
          ))}
        </div>
      )}

      {/* Closing */}
      {data.closing && (
        <div style={{ marginBottom: '36px' }}>{data.closing}</div>
      )}

      {/* Sign Off */}
      <div style={{ marginTop: '36px' }}>
        {data.signOff && <div style={{ marginBottom: '48px', color: '#666' }}>{data.signOff}</div>}
        {data.fullName && <div style={{ fontWeight: 300, fontSize: `${baseSize}px` }}>{data.fullName}</div>}
      </div>
    </div>
  );
}
