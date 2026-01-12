# 이미지 기반 상세페이지 생성 SaaS

Vite + React 기반 프론트엔드와 Node.js + Express 기반 서버로 구성된 상세페이지 자동 생성 애플리케이션입니다.

## 프로젝트 구조

```
aiApp/
├── server/              # Express 서버 (OpenAI API 프록시)
│   ├── index.js        # 서버 메인 파일
│   ├── package.json    # 서버 의존성
│   └── .env            # 서버 환경 변수 (생성 필요)
├── src/                # React 프론트엔드
│   ├── components/     # React 컴포넌트
│   └── utils/          # 유틸리티 함수
└── package.json        # 프론트엔드 의존성
```

## 시작하기

### 1. 프론트엔드 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 5173)
npm run dev
```

### 2. 서버 설치 및 실행

서버 설정은 `SERVER_SETUP.md`를 참고하세요.

```bash
# 서버 폴더로 이동
cd server

# 서버 의존성 설치
npm install

# 서버 실행 (포트 3000)
npm run dev
```

### 3. 환경 변수 설정

**서버 환경 변수 (`server/.env`):**
```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

⚠️ **중요**: API Key는 서버 `.env` 파일에만 설정합니다. 프론트엔드에는 API Key가 노출되지 않습니다.

## 주요 기능

- 이미지 업로드 (선택사항)
- 상품 정보 입력 (상품명, 설명, 가격대, 플랫폼, 브랜드 톤)
- OpenAI API를 통한 상세페이지 콘텐츠 자동 생성
- 생성된 콘텐츠 복사 기능

## 기술 스택

**프론트엔드:**
- React 19
- Vite
- CSS (넷플릭스 스타일)

**서버:**
- Node.js
- Express
- OpenAI API

## 보안

- ✅ API Key는 서버에만 존재
- ✅ 프론트엔드에는 API Key 노출 없음
- ✅ CORS 설정 (개발 환경: localhost:5173)
- ✅ 향후 인증(JWT), rate limit 등 추가 가능한 구조

## 문서

- `SERVER_SETUP.md` - 서버 설정 및 API 가이드
- `API_SETUP.md` - (구버전, 더 이상 사용하지 않음)
