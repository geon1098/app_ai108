const API_BASE_URL = 'http://localhost:3000';

/**
 * 서버 API를 통해 상세페이지 생성
 * @param {Object} productData - 상품 정보 (productDescription, referenceUrl)
 * @param {Array} images - 이미지 파일 배열
 * @returns {Promise<Object>} 생성된 상세페이지 데이터
 */
export async function generateProductDetail(productData, images = []) {
  try {
    // 이미지들을 base64로 변환
    const imageBase64Array = [];
    for (const image of images) {
      if (image && image.file) {
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('이미지 읽기에 실패했습니다.'));
          reader.readAsDataURL(image.file);
        });
        imageBase64Array.push(base64Image);
      }
    }

    // 서버 API 호출
    const response = await fetch(`${API_BASE_URL}/api/generate-detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceUrl: productData.referenceUrl || null,
        productDescription: productData.productDescription,
        images: imageBase64Array,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `서버 오류가 발생했습니다. (${response.status})`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API 오류:', error);
    // 네트워크 오류인 경우 사용자 친화적 메시지
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}
