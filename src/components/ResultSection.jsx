import { useState } from 'react';

function ResultSection({ resultData, productImages }) {
  const [copied, setCopied] = useState({});

  const handleCopy = async (text, index, type) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [`${type}-${index}`]: true });
      setTimeout(() => {
        setCopied({ ...copied, [`${type}-${index}`]: false });
      }, 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  if (!resultData || !resultData.sections || resultData.sections.length === 0) {
    return null;
  }

  if (!productImages || productImages.length === 0) {
    return null;
  }

  return (
    <section className="result-section">
      <div className="result-header">
        <h2>생성된 상세페이지</h2>
      </div>
      
      <div className="result-content">
        {resultData.sections.map((section, index) => {
          const image = productImages[index];
          if (!image) return null;

          return (
            <div key={index} className="result-section-item">
              <div className="section-image-container">
                <img src={image.preview} alt={`섹션 ${index + 1}`} className="section-image" />
                {section.headline && (
                  <div className="section-headline-overlay">
                    <h3 className="section-headline">{section.headline}</h3>
                  </div>
                )}
              </div>
              
              {section.body && (
                <div className="section-body-container">
                  <div className="section-body-content">
                    <p className="section-body">{section.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(section.body, index, 'body')}
                    className="copy-btn-small"
                  >
                    {copied[`body-${index}`] ? '✓ 복사됨' : '본문 복사'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ResultSection;
