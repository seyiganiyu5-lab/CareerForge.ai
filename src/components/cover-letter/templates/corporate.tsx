import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';
import type { CoverLetterTemplateProps } from './professional';

// ─── Corporate Template ───────────────────────────────────────

export default function Corporate({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;
  const accent = customization.accentColor;

  const baseSize = 11 * fs;
  const smallSize = 10 * fs;
  const nameSize = 17 * fs;
  const paraSpacing = 10 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  return (
    <div style={{ fontFamily: font, fontSize: `${baseSize}px`, lineHeight: lh, color: '#222' }}>
      {/* Corporate Letterhead */}
      <div style={{
        padding: `20px ${m}px 16px ${m}px`,
        borderBottom: `2px solid ${accent}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          {data.fullName && (
            <div style={{ fontSize: `${nameSize}px`, fontWeight: 700, color: accent, marginBottom: '4px' }}>
              {data.fullName}
            </div>
          )}
          <div style={{ fontSize: `${smallSize}px`, color: '#666' }}>
            {[data.email, data.phone].filter(Boolean).join('  ·  ')}
          </div>
          {data.address && (
            <div style={{ fontSize: `${smallSize}px`, color: '#666' }}>{data.address}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: `${smallSize}px`, color: '#888' }}>
          {dateStr}
        </div>
      </div>

      {/* Letter Content */}
      <div style={{ padding: `${m}px` }}>
        {/* Recipient */}
        {(data.hiringManager || data.companyName) && (
          <div style={{ marginBottom: '20px' }}>
            {data.hiringManager && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{data.hiringManager}</div>}
            {data.companyName && <div style={{ fontSize: `${smallSize}px`, color: '#555' }}>{data.companyName}</div>}
            {data.companyAddress && <div style={{ fontSize: `${smallSize}px`, color: '#555', whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}
          </div>
        )}

        {/* Subject line */}
        {(data.jobTitle || data.companyName) && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontWeight: 700 }}>Re: </span>
            <span>{data.jobTitle}{data.companyName ? ` at ${data.companyName}` : ''}</span>
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
          <div style={{ marginBottom: '28px', textAlign: 'justify' }}>{data.closing}</div>
        )}

        {/* Sign Off */}
        <div style={{ marginTop: '28px', borderTop: `1px solid ${accent}33`, paddingTop: '16px' }}>
          {data.signOff && <div style={{ marginBottom: '40px' }}>{data.signOff}</div>}
          {data.fullName && <div style={{ fontWeight: 700 }}>{data.fullName}</div>}
        </div>
      </div>
    </div>
  );
}
