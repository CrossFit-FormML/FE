"use client";

import { useState, useEffect } from "react";
import CameraView from "../components/CameraView";
import PostureAnalysis from "../components/PostureAnalysis";
import Feedback from "../components/Feedback";
import Loading from "../components/Loading";
import { checkServerHealth } from "../services/api";

export default function Home() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);

  // 서버 상태 확인
  useEffect(() => {
    const checkServer = async () => {
      try {
        const status = await checkServerHealth();
        setServerStatus(status);
      } catch (error) {
        console.error("서버 상태 확인 오류:", error);
        setServerStatus({
          status: "error",
          message: "서버에 연결할 수 없습니다.",
        });
      }
    };

    checkServer();
  }, []);

  // 예측 결과 처리 함수
  const handlePredictionResult = (result) => {
    setPredictionResult(result);
  };

  // 로딩 상태 처리 함수
  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            크로스핏 자세 교정 시스템
          </h1>
          <p className="text-gray-600">
            웹캠을 통해 실시간으로 운동 자세를 분석합니다
          </p>
        </header>

        {/* 서버 연결 오류 메시지 */}
        {serverStatus && serverStatus.status === "error" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md">
            <p className="font-bold">서버 연결 오류</p>
            <p>{serverStatus.message}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* 왼쪽: 카메라 화면 */}
          <div className="md:w-1/2">
            <CameraView
              onPredictionResult={handlePredictionResult}
              onLoadingChange={handleLoadingChange}
            />
          </div>

          {/* 오른쪽: 분석 결과 및 피드백 */}
          <div className="md:w-1/2">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <PostureAnalysis predictionResult={predictionResult} />
                <Feedback predictionResult={predictionResult} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
