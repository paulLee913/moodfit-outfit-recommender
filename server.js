const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateRecommendation } = require('./src/recommendations');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// API 엔드포인트를 정적 파일 서빙보다 먼저 정의
// API 엔드포인트: 코디 추천
app.post('/api/recommend', (req, res) => {
  const { weather, situation, mood } = req.body;

  // 입력값 검증
  if (!weather || !situation || !mood) {
    return res.status(400).json({
      error: '날씨, 상황, 분위기 모두를 선택해주세요.'
    });
  }

  // 추천 생성
  const recommendation = generateRecommendation(weather, situation, mood);

  if (recommendation.error) {
    return res.status(400).json(recommendation);
  }

  res.json(recommendation);
});

// 옵션 조회 엔드포인트
app.get('/api/options', (req, res) => {
  res.json({
    weathers: ['hot', 'cool', 'rainy'],
    weatherLabels: {
      hot: '더운 날씨',
      cool: '쌀쌀한 날씨',
      rainy: '비 오는 날씨'
    },
    situations: ['class', 'presentation', 'meeting', 'interview', 'walk'],
    situationLabels: {
      class: '대학 수업',
      presentation: '발표',
      meeting: '약속/미팅',
      interview: '면접',
      walk: '산책'
    },
    moods: ['clean', 'comfortable', 'casual', 'neat', 'street'],
    moodLabels: {
      clean: '깔끔함',
      comfortable: '편안함',
      casual: '캐주얼',
      neat: '단정함',
      street: '스트릿'
    }
  });
});

// 정적 파일 서빙 (API 엔드포인트 이후)
app.use(express.static('.'));

// 루트 경로 (정적 파일 미들웨어가 처리)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`MoodFit 서버가 ${PORT} 포트에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT} 에서 접속하세요.`);
});
