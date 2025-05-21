import axios from "axios";

// API 서버 URL 설정
const API_URL = "http://localhost:8000";

// 랜드마크 데이터를 서버로 전송하여 자세 분석
export const predictPosture = async (landmarks) => {
  try {
    const response = await axios.post(`${API_URL}/api/predict`, {
      landmarks,
    });
    return response.data;
  } catch (error) {
    console.error("자세 분석 API 호출 에러:", error);
    throw error;
  }
};

// 서버 상태 확인 API
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("서버 상태 확인 에러:", error);
    throw error;
  }
};
