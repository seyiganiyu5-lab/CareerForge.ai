import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';
import type { CoverLetterTemplateProps } from './professional';

// ─── Modern Template ──────────────────────────────────────────

export default function Modern({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;
  const accent = customization.accentColor;

  const baseSize = 11 * fs;
  const smallSize = 10 * fs;
  const nameSize = 20 * fs;
  const paraSpacing = 10 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  return (
    <div style={{ fontFamily: font, fontSize: `${baseSize}px`, lineHeight: lh, color: '#1a1a1a' }}>
      {/* Accent Header Bar */}
      <div style={{
        backgroundColor: accent,
        padding: `${24 * fs}px ${m}px ${20 * fs}px ${m}px`,
        color: '#ffffff',
      }}>
        {data.fullName && (
          <div style={{ fontSize: `${nameSize}px`, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {data.fullName}
          </div>
        )}
        <div style={{ fontSize: `${smallSize}px`, opacity: 0.85, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[data.email, data.phone, data.address].filter(Boolean).map((item, i, arr) => (
            <span key={i}>
              {item}{i < arr.length - 1 && <span style={{ margin: '0 4px', opacity: 0.5 }}>·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Letter Body */}
      <div style={{ padding: `${m}px` }}>
        {/* Recipient + Date row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            {data.hiringManager && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{data.hiringManager}</div>}
            {data.companyName && <div style={{ fontSize: `${smallSize}px`, color: '#555' }}>{data.companyName}</div>}
            {data.companyAddress && <div style={{ fontSize: `${smallSize}px`, color: '#555', whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}
          </div>
          {dateStr && <div style={{ fontSize: `${smallSize}px`, color: '#888', whiteSpace: 'nowrap' }}>{dateStr}</div>}
        </div>

        {/* Divider */}
        <div style={{ height: '2px', backgroundColor: accent, opacity: 0.2, marginBottom: '20px' }} />

        {/* Salutation */}
        {data.salutation && (
          <div style={{ marginBottom: `${paraSpacing}px`, fontWeight: 500 }}>{data.salutation}</div>
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
          <div style={{ marginBottom: '28px' }}>{data.closing}</div>
        )}

        {/* Sign Off */}
        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: `1px solid ${accent}22` }}>
          {data.signOff && <div style={{ marginBottom: '40px' }}>{data.signOff}</div>}
          {data.fullName && <div style={{ fontWeight: 700, color: accent, fontSize: `${baseSize}px` }}>{data.fullName}</div>}
        </div>
      </div>
    </div>
  );
}
