// DOM 요소
const weatherOptions = document.querySelectorAll('input[name="weather"]');
const situationOptions = document.querySelectorAll('input[name="situation"]');
const moodOptions = document.querySelectorAll('input[name="mood"]');
const recommendBtn = document.getElementById('recommendBtn');
const newRecommendBtn = document.getElementById('newRecommendBtn');

const selectionSection = document.querySelector('.selection-section');
const resultSection = document.getElementById('resultSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// 모든 선택지
const allOptions = [...weatherOptions, ...situationOptions, ...moodOptions];

// 이벤트 리스너 추가
allOptions.forEach(option => {
    option.addEventListener('change', updateButtonState);
});

recommendBtn.addEventListener('click', handleRecommendClick);
newRecommendBtn.addEventListener('click', resetForm);

// 추천 받기 버튼 상태 업데이트
function updateButtonState() {
    const weatherSelected = document.querySelector('input[name="weather"]:checked');
    const situationSelected = document.querySelector('input[name="situation"]:checked');
    const moodSelected = document.querySelector('input[name="mood"]:checked');

    const allSelected = weatherSelected && situationSelected && moodSelected;
    recommendBtn.disabled = !allSelected;
}

// 추천 받기 클릭
async function handleRecommendClick() {
    const weather = document.querySelector('input[name="weather"]:checked');
    const situation = document.querySelector('input[name="situation"]:checked');
    const mood = document.querySelector('input[name="mood"]:checked');

    // 선택 검증
    if (!weather || !situation || !mood) {
        showError('모든 항목(날씨, 상황, 분위기)을 선택해주세요.');
        return;
    }

    // 로딩 상태 표시
    showLoading();

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                weather: weather.value, 
                situation: situation.value, 
                mood: mood.value 
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `오류 발생: ${response.status}`);
        }

        const data = await response.json();

        // 결과 표시
        displayResult(data);
    } catch (error) {
        console.error('추천 요청 오류:', error);
        showError(error.message || '서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        hideLoading();
    }
}

// 로딩 표시
function showLoading() {
    selectionSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
}

// 로딩 숨기기
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// 결과 표시
function displayResult(data) {
    selectionSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // 제목
    const titleText = `${getWeatherLabel(data.weather)} | ${getSituationLabel(data.situation)} | ${getMoodLabel(data.mood)}`;
    document.getElementById('resultTitle').textContent = titleText;

    // 코디 방향
    document.getElementById('directionText').textContent = data.direction;

    // 추천 아이템
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    data.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        itemsList.appendChild(li);
    });

    // 추천 이유
    document.getElementById('reasonText').textContent = data.reason;

    // 주의할 점
    document.getElementById('cautionText').textContent = data.caution;

    // 스크롤
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 에러 표시
function showError(message) {
    selectionSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = `⚠️ ${message}`;
    errorMessage.scrollIntoView({ behavior: 'smooth' });
    console.error('추천 오류:', message);
}

// 폼 리셋
function resetForm() {
    // 모든 라디오 버튼 선택 해제
    allOptions.forEach(option => {
        option.checked = false;
    });

    // 버튼 비활성화
    recommendBtn.disabled = true;

    // 섹션 전환
    selectionSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // 스크롤
    selectionSection.scrollIntoView({ behavior: 'smooth' });
}

// 라벨 함수들
function getWeatherLabel(weather) {
    const labels = {
        hot: '☀️ 더운 날씨',
        cool: '🍂 쌀쌀한 날씨',
        rainy: '🌧️ 비 오는 날씨'
    };
    return labels[weather] || weather;
}

function getSituationLabel(situation) {
    const labels = {
        class: '📚 대학 수업',
        presentation: '🎤 발표',
        meeting: '👥 약속/미팅',
        interview: '💼 면접',
        walk: '🚶 산책'
    };
    return labels[situation] || situation;
}

function getMoodLabel(mood) {
    const labels = {
        clean: '✨ 깔끔함',
        comfortable: '🛋️ 편안함',
        casual: '👕 캐주얼',
        neat: '👔 단정함',
        street: '🎨 스트릿'
    };
    return labels[mood] || mood;
}

// 초기화
updateButtonState();
console.log('MoodFit 초기화 완료!');
