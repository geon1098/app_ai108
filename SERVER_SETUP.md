# 서버 설정 가이드

## 서버 구조

프론트엔드에서 OpenAI API Key를 노출하지 않도록 서버를 통해 API를 호출합니다.

## 설치 및 실행

### 1. 서버 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

`server/.env` 파일을 생성하고 API 키를 설정합니다:

```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

또는 `server/.env.example` 파일을 복사하여 사용:

```bash
cp server/.env.example server/.env
# server/.env 파일을 열어 API 키 입력
```

### 3. 서버 실행

```bash
cd server
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### POST /api/generate-detail

상세페이지 생성을 요청합니다.

**요청 Body:**
```json
{
  "productData": {
    "productName": "상품명",
    "productDescription": "상품 설명",
    "priceRange": "가격대",
    "platform": "쿠팡",
    "brandTone": "감성"
  },
  "images": ["data:image/jpeg;base64,..."] // base64 이미지 배열 (선택사항)
}
```

**응답:**
```json
{
  "imageUrl": "data:image/jpeg;base64,..." | null,
  "imageSummary": "이미지 요약 문장",
  "content": "상세페이지 본문 텍스트",
  "imageCaption": "이미지용 문구"
}
```

## 개발 워크플로우

1. **서버 실행** (터미널 1):
   ```bash
   cd server
   npm run dev
   ```

2. **프론트엔드 실행** (터미널 2):
   ```bash
   npm run dev
   ```

3. 브라우저에서 `http://localhost:5173` 접속

## 보안

- ✅ API Key는 서버 `.env` 파일에만 존재
- ✅ 프론트엔드에는 API Key가 노출되지 않음
- ✅ CORS는 개발 환경(localhost:5173)만 허용
- ✅ 향후 인증(JWT), rate limit 등을 미들웨어로 추가 가능한 구조
