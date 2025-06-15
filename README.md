# CrossFit 자세 분석 프론트엔드

크로스핏 운동 자세를 실시간으로 분석하고 피드백을 제공하는 React 기반 웹 애플리케이션입니다.

## 프로젝트 구조

```
├── package.json                    # 프로젝트 설정 및 의존성
├── package-lock.json               # 의존성 잠금 파일
├── README.md
├── src/
│   └── services/
│       └── api.js                  # API 통신 모듈
└── app/
    └── page.js                     # 메인 페이지 
```

## 주요 기능

- **실시간 자세 분석**: MediaPipe를 사용한 실시간 포즈 추출
- **카메라 연동**: 웹캠을 통한 실시간 동작 캡처
- **서버 통신**: Flask ML 서버와 API 통신
- **결과 시각화**: 자세 분석 결과를 사용자에게 표시

## 기술 스택

- **Framework**: Next.js 15.3.2
- **Language**: React 19.0.0
- **Pose Detection**: MediaPipe Pose
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

애플리케이션은 `http://localhost:3000`에서 실행됩니다.

## API 설정

`src/services/api.js`에서 서버 URL을 설정할 수 있습니다:
```javascript
const API_URL = "http://localhost:8000";
```

## 주요 패키지

- `@mediapipe/pose`: 포즈 감지
- `@mediapipe/camera_utils`: 카메라 유틸리티
- `@mediapipe/drawing_utils`: 포즈 시각화
- `axios`: HTTP 통신

## 참고사항

- 현재 미완성 상태입니다
- Flask ML 서버가 실행되어야 정상 동작합니다
- 웹캠 접근 권한이 필요합니다
