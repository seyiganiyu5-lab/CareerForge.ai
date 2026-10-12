import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';
import { formatDate } from '@/lib/cover-letter/template-registry';
import type { CoverLetterTemplateProps } from './professional';

// ─── ATS Friendly Template ────────────────────────────────────
// Maximum ATS compatibility: plain text style, no fancy formatting,
// no color, simple layout that parsing systems can easily read.

export default function AtsFriendly({ data, customization }: CoverLetterTemplateProps) {
  const m = customization.pageMargins;
  const fs = customization.fontSize;
  const lh = customization.lineSpacing;
  const font = customization.primaryFont;

  const baseSize = 11 * fs;
  const paraSpacing = 8 * lh;

  const dateStr = formatDate(data.date, customization.dateFormat);

  return (
    <div style={{
      padding: `${m}px`,
      fontFamily: font,
      fontSize: `${baseSize}px`,
      lineHeight: lh,
      color: '#000000',
    }}>
      {/* Sender — plain block */}
      {data.fullName && <div style={{ marginBottom: '2px' }}>{data.fullName}</div>}
      {data.address && <div style={{ marginBottom: '2px' }}>{data.address}</div>}
      {data.email && <div style={{ marginBottom: '2px' }}>{data.email}</div>}
      {data.phone && <div style={{ marginBottom: '2px' }}>{data.phone}</div>}
      {(data.linkedIn || data.website) && (
        <div style={{ marginBottom: '12px' }}>
          {[data.linkedIn, data.website].filter(Boolean).join(' | ')}
        </div>
      )}

      {/* Date */}
      {dateStr && <div style={{ marginBottom: '12px' }}>{dateStr}</div>}

      {/* Recipient */}
      {data.hiringManager && <div style={{ marginBottom: '2px' }}>{data.hiringManager}</div>}
      {data.companyName && <div style={{ marginBottom: '2px' }}>{data.companyName}</div>}
      {data.companyAddress && <div style={{ marginBottom: '2px', whiteSpace: 'pre-wrap' }}>{data.companyAddress}</div>}

      <div style={{ height: '12px' }} />

      {/* Salutation */}
      {data.salutation && (
        <div style={{ marginBottom: `${paraSpacing}px` }}>{data.salutation}</div>
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
        <div style={{ marginBottom: '20px' }}>{data.closing}</div>
      )}

      {/* Sign Off */}
      <div style={{ marginTop: '20px' }}>
        {data.signOff && <div style={{ marginBottom: '40px' }}>{data.signOff}</div>}
        {data.fullName && <div style={{ fontWeight: 700 }}>{data.fullName}</div>}
      </div>
    </div>
  );
}
