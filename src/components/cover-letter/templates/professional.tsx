import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';

export interface CoverLetterTemplateProps {
  data: CoverLetterData;
  customization: CoverLetterCustomization;
}

// ─── Professional Template ────────────────────────────────────

export default function Professional({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;
  const accent = customization.accentColor;

  const baseSize = 11 * fs;
  const smallSize = 10 * fs;
  const headingSize = 16 * fs;
  const paraSpacing = 8 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  const hasSenderInfo = data.fullName || data.email || data.phone;
  const hasRecipientInfo = data.hiringManager || data.companyName || data.companyAddress;

  return (
    <div style={{ padding: `${m}px`, fontFamily: font, fontSize: `${baseSize}px`, lineHeight: lh, color: '#1a1a1a' }}>
      {/* Sender Block */}
      {hasSenderInfo && (
        <div style={{ marginBottom: '4px' }}>
          {data.fullName && (
            <div style={{ fontSize: `${headingSize}px`, fontWeight: 700, color: accent, marginBottom: '2px' }}>
              {data.fullName}
            </div>
          )}
          {data.address && <div style={{ fontSize: `${smallSize}px`, color: '#555', marginBottom: '1px' }}>{data.address}</div>}
          {data.email && <div style={{ fontSize: `${smallSize}px`, color: '#555', marginBottom: '1px' }}>{data.email}</div>}
          {data.phone && <div style={{ fontSize: `${smallSize}px`, color: '#555', marginBottom: '1px' }}>{data.phone}</div>}
          {(data.linkedIn || data.website) && (
            <div style={{ fontSize: `${smallSize}px`, color: '#555' }}>
              {[data.linkedIn, data.website].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}

      <div style={{ height: '16px' }} />

      {/* Date */}
      {dateStr && <div style={{ marginBottom: '16px', fontSize: `${baseSize}px` }}>{dateStr}</div>}

      {/* Recipient Block */}
      {hasRecipientInfo && (
        <div style={{ marginBottom: '16px' }}>
          {data.hiringManager && <div style={{ marginBottom: '1px' }}>{data.hiringManager}</div>}
          {data.companyName && <div style={{ marginBottom: '1px' }}>{data.companyName}</div>}
          {data.companyAddress && <div style={{ marginBottom: '1px', whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}
        </div>
      )}

      <div style={{ height: '8px' }} />

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
        <div style={{ marginBottom: '24px', textAlign: 'justify' }}>{data.closing}</div>
      )}

      {/* Sign Off */}
      {data.signOff && (
        <div style={{ marginTop: '24px' }}>
          <div>{data.signOff}</div>
          <div style={{ height: '40px' }} />
          {data.fullName && <div style={{ fontWeight: 600 }}>{data.fullName}</div>}
        </div>
      )}
    </div>
  );
}
