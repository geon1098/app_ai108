# 시스템 아키텍처 다이어그램

## 전체 시스템 아키텍처

```mermaid
flowchart TD
    subgraph "Client Layer"
        User[사용자]
        Browser[웹 브라우저<br/>localhost:5173]
    end

    subgraph "Frontend Layer"
        React[React App<br/>Vite]
        InputSection[InputSection<br/>입력 UI]
        ResultSection[ResultSection<br/>결과 표시]
        APIUtils[API Utils<br/>HTTP Client]
    end

    subgraph "Backend Layer"
        Express[Express Server<br/>localhost:3000]
        APIRoute[/api/generate-detail<br/>POST Endpoint]
        PromptGen[Prompt Generator<br/>프롬프트 생성]
        ResponseParser[Response Parser<br/>JSON 파싱]
    end

    subgraph "External Services"
        OpenAI[OpenAI API<br/>GPT-4o Vision]
    end

    subgraph "Data Flow"
        InputData[입력 데이터<br/>- referenceUrl<br/>- productDescription<br/>- images]
        OutputData[출력 데이터<br/>- sections array<br/>  - headline<br/>  - body]
    end

    %% User interactions
    User -->|입력| InputSection
    ResultSection -->|결과 표시| User

    %% Frontend internal flow
    InputSection -->|상품 정보| APIUtils
    APIUtils -->|HTTP POST<br/>JSON| Express
    Express -->|JSON Response| APIUtils
    APIUtils -->|결과 데이터| ResultSection

    %% Backend processing
    Express -->|요청 처리| APIRoute
    APIRoute -->|검증된 입력| PromptGen
    PromptGen -->|프롬프트 생성| APIRoute
    APIRoute -->|HTTP POST<br/>JSON + Images| OpenAI
    OpenAI -->|JSON Response| APIRoute
    APIRoute -->|원본 응답| ResponseParser
    ResponseParser -->|파싱된 섹션 배열| Express

    %% Data transformations
    InputData -.->|전송| APIUtils
    OutputData -.->|수신| APIUtils

    %% Styling
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px,color:#000
    classDef backend fill:#339933,stroke:#0d2818,stroke-width:2px,color:#fff
    classDef external fill:#ff6b6b,stroke:#8b0000,stroke-width:2px,color:#fff
    classDef data fill:#ffd93d,stroke:#b8860b,stroke-width:2px,color:#000

    class React,InputSection,ResultSection,APIUtils frontend
    class Express,APIRoute,PromptGen,ResponseParser backend
    class OpenAI external
    class InputData,OutputData data
```

## 데이터 흐름 상세

```mermaid
sequenceDiagram
    participant U as 사용자
    participant FE as 프론트엔드<br/>(React)
    participant BE as 백엔드<br/>(Express)
    participant AI as OpenAI API

    U->>FE: 1. 입력 (URL, 설명, 이미지들)
    FE->>FE: 2. 이미지 base64 변환
    FE->>BE: 3. POST /api/generate-detail<br/>{referenceUrl, productDescription, images[]}
    BE->>BE: 4. 입력 검증<br/>(길이, 형식)
    BE->>BE: 5. 프롬프트 생성<br/>(createPrompt)
    BE->>AI: 6. POST /v1/chat/completions<br/>(GPT-4o Vision, images + text)
    AI->>BE: 7. JSON Response<br/>{sections: [...]}
    BE->>BE: 8. 응답 파싱<br/>(JSON 검증)
    BE->>FE: 9. HTTP 200<br/>{sections: [...]}
    FE->>FE: 10. 결과 렌더링<br/>(섹션별 이미지+텍스트)
    FE->>U: 11. 상세페이지 표시
```

## 컴포넌트 구조

```mermaid
graph TB
    subgraph "프론트엔드 컴포넌트"
        App[App.jsx<br/>상태 관리]
        Header[Header.jsx<br/>헤더]
        InputSection[InputSection.jsx<br/>입력 폼]
        ResultSection[ResultSection.jsx<br/>결과 표시]
        APIUtils[utils/api.js<br/>API 통신]
    end

    subgraph "백엔드 모듈"
        Server[index.js<br/>Express 서버]
        Route[POST /api/generate-detail<br/>라우트 핸들러]
        Prompt[createPrompt 함수<br/>프롬프트 생성]
        Parser[parseApiResponse 함수<br/>응답 파싱]
    end

    App --> Header
    App --> InputSection
    App --> ResultSection
    InputSection --> APIUtils
    ResultSection --> APIUtils
    APIUtils --> Server
    Server --> Route
    Route --> Prompt
    Route --> Parser
```

## 기술 스택

```mermaid
mindmap
  root((이커머스 상세페이지<br/>생성 SaaS))
    프론트엔드
      React 19
      Vite
      CSS
    백엔드
      Node.js
      Express
      dotenv
      cors
    외부 API
      OpenAI GPT-4o
      Vision API
    데이터 형식
      JSON
      Base64 Images
```
