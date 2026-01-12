import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (개발 환경)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));

// OpenAI API 프록시 엔드포인트
app.post('/api/generate-detail', async (req, res) => {
  try {
    const { productDescription, referenceUrl, images } = req.body;

    // 입력 검증
    if (!productDescription || typeof productDescription !== 'string') {
      return res.status(400).json({ 
        error: '판매할 상품 설명을 입력해주세요.' 
      });
    }

    const description = productDescription.trim();
    const minLength = 10;
    const maxLength = 5000;

    if (description.length < minLength) {
      return res.status(400).json({ 
        error: `상품 설명은 최소 ${minLength}자 이상 입력해주세요.` 
      });
    }

    if (description.length > maxLength) {
      return res.status(400).json({ 
        error: `상품 설명은 ${maxLength}자 이하여야 합니다.` 
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        error: '상품 이미지를 최소 1장 이상 업로드해주세요.' 
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[서버 오류] OPENAI_API_KEY가 설정되지 않았습니다.');
      return res.status(500).json({ 
        error: '서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.' 
      });
    }

    // 프롬프트 생성
    const prompt = createPrompt({
      productDescription: description,
      referenceUrl: referenceUrl || null,
      imageCount: images.length
    });

    // OpenAI API 호출 - Vision API with multiple images
    const contentArray = [
      { type: 'text', text: prompt }
    ];

    // 이미지들을 content에 추가
    images.forEach((image) => {
      if (image && typeof image === 'string' && image.startsWith('data:image/')) {
        contentArray.push({
          type: 'image_url',
          image_url: { url: image },
        });
      }
    });

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: contentArray,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    };

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API 오류: ${openaiResponse.status}`;
      console.error('[OpenAI API 오류]', errorMessage, errorData);
      
      // 사용자 친화적 에러 메시지
      let userMessage = '콘텐츠 생성 중 오류가 발생했습니다.';
      if (openaiResponse.status === 401) {
        userMessage = 'API 인증 오류가 발생했습니다. 관리자에게 문의하세요.';
      } else if (openaiResponse.status === 429) {
        userMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (openaiResponse.status === 500) {
        userMessage = '서비스 일시 중단 중입니다. 잠시 후 다시 시도해주세요.';
      }
      
      return res.status(openaiResponse.status >= 500 ? 500 : 400).json({ error: userMessage });
    }

    const data = await openaiResponse.json();
    const result = parseApiResponse(data, images);

    res.json(result);
  } catch (error) {
    console.error('[서버 오류]', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
  }
});

// 프롬프트 생성 함수
function createPrompt({ productDescription, referenceUrl, imageCount }) {
  const referenceInstruction = referenceUrl
    ? `참고 상품 URL:
${referenceUrl}

위 URL은 다른 판매자의 상품 페이지입니다.
문구의 형식, 흐름, 정보 배치 방식, 톤만 참고하세요.
절대 해당 URL의 상품을 따라 쓰거나 언급하지 마세요.
문장, 표현, 수치, 고유한 문구는 절대 재사용하지 마세요.`
    : '';

  return `당신은 쿠팡/컬리 상세페이지를 구성하는 이커머스 콘텐츠 에디터입니다.

목표:
사용자가 이 상품을 쓰는 장면이 자연스럽게 떠오르는
상세페이지 콘텐츠를 작성하세요.

입력 정보:
[판매할 상품 설명]
${productDescription}

${referenceInstruction}

이미지 개수: ${imageCount}장

작업 지시:
각 이미지를 하나의 독립된 상세페이지 섹션으로 간주하세요.
총 ${imageCount}개의 섹션을 생성해야 합니다.

각 섹션마다:
1) 이미지 하단 오버레이로 표시될 헤드라인 문구 (짧고 강함, 1줄, 이미지와 자연스럽게 결합)
2) 이미지 하단에 배치되는 설명 문단 (2~4줄, 이미지를 뒷받침하는 내용)

작성 규칙:
- 이미지 묘사가 아니라 "상품 이해를 돕는 설명"을 작성하세요
- 설명문처럼 쓰지 마세요
- "이 상품은 ~입니다" 같은 교과서 문장 금지
- 기능/스펙 나열 금지
- 사용 맥락과 가치 중심으로 서술
- 과장, 감탄사, 광고 문구 금지
- 이미지가 있다는 사실을 언급하지 마세요
- 참고 URL이나 다른 상품을 직접 언급하지 마세요

출력 형식:
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운 절대 금지.

{
  "sections": [
    {
      "headline": "이미지 위에 들어갈 핵심 문구",
      "body": "해당 이미지와 연결되는 설명 문단"
    },
    {
      "headline": "...",
      "body": "..."
    }
  ]
}

sections 배열의 길이는 반드시 ${imageCount}개여야 합니다.
각 섹션은 입력된 이미지 순서와 1:1 대응됩니다.`;
}

// API 응답 파싱 함수 (JSON sections 배열 반환)
function parseApiResponse(apiResponse, images) {
  const content = apiResponse.choices[0]?.message?.content || '';
  
  if (!content) {
    console.error('[파싱 오류] API 응답이 비어있습니다.');
    throw new Error('생성된 콘텐츠가 없습니다.');
  }
  
  try {
    // JSON 응답 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // sections 배열 검증
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('sections 배열이 없습니다.');
    }

    if (parsed.sections.length !== images.length) {
      console.warn(`[파싱 경고] sections 개수(${parsed.sections.length})가 이미지 개수(${images.length})와 일치하지 않습니다.`);
    }

    // 각 섹션 검증
    const validSections = parsed.sections.filter(section => 
      section && 
      typeof section.headline === 'string' && 
      typeof section.body === 'string'
    );

    if (validSections.length === 0) {
      throw new Error('유효한 섹션이 없습니다.');
    }

    return {
      sections: validSections,
    };
  } catch (e) {
    console.error('[파싱 오류]', e, '원본 응답:', content);
    throw new Error('응답 파싱에 실패했습니다. 다시 시도해주세요.');
  }
}

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`프론트엔드: http://localhost:5173`);
});