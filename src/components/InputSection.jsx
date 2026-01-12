import { useState } from 'react';
import { generateProductDetail } from '../utils/api';

function InputSection({ onGenerate }) {
  const [images, setImages] = useState([]);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }

    // 이미지 파일 검증
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError('이미지는 JPG, PNG, WebP 형식만 지원됩니다.');
        return false;
      }
      
      if (file.size > maxSize) {
        setError('이미지 크기는 10MB 이하여야 합니다.');
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
    setError(null);
    e.target.value = '';
  };

  const handleImageRemove = (id) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages(images.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    setError(null);
    
    // 상품 설명 검증
    const description = productDescription.trim();
    const minLength = 10;
    const maxLength = 5000;
    
    if (!description) {
      setError('판매할 상품 설명을 입력해주세요.');
      return;
    }
    
    if (description.length < minLength) {
      setError(`상품 설명은 최소 ${minLength}자 이상 입력해주세요.`);
      return;
    }
    
    if (description.length > maxLength) {
      setError(`상품 설명은 ${maxLength}자 이하여야 합니다.`);
      return;
    }

    // 이미지 검증 (필수)
    if (images.length === 0) {
      setError('상품 이미지를 최소 1장 이상 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const productData = {
        productDescription: description,
        referenceUrl: referenceUrl.trim() || null,
      };

      const result = await generateProductDetail(productData, images);
      
      if (!result || !result.sections || result.sections.length === 0) {
        throw new Error('생성된 콘텐츠가 없습니다. 다시 시도해주세요.');
      }
      
      onGenerate(result, images);
    } catch (err) {
      console.error('생성 오류:', err);
      setError(err.message || '상세페이지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="input-section">
      <div className="form-area">
        <h2>상품 정보 입력</h2>
        
        <div className="form-group">
          <label>참고 상품 URL (선택)</label>
          <input
            type="url"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://www.coupang.com/... 또는 https://www.kurly.com/..."
          />
          <p className="field-description">
            잘 팔리는 상품 페이지의 구성과 흐름을 참고하기 위한 URL입니다.
          </p>
        </div>

        <div className="form-group">
          <label>판매할 상품 설명</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="상품의 용도, 특징, 타겟, 사용 맥락을 자유롭게 입력하세요 (최소 10자, 최대 5000자)"
            rows="8"
            maxLength={5000}
          />
          <p className="char-count">
            {productDescription.length} / 5000자
          </p>
        </div>

        <div className="form-group">
          <label>판매할 상품 이미지 (필수)</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="file-input"
          />
          <div className="image-preview-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-preview-item">
                <div className="image-order">{(index + 1)}</div>
                <img src={image.preview} alt={`미리보기 ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => handleImageRemove(image.id)}
                  className="remove-image-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="field-description">
            상품 이미지를 업로드하세요. 순서대로 섹션이 생성됩니다. (JPG, PNG, WebP, 최대 10MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="generate-btn"
      >
        {isLoading ? '생성 중...' : '상세페이지 생성하기'}
      </button>
    </section>
  );
}

export default InputSection;
