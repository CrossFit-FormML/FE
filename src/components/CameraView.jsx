import React, { useEffect } from "react";
import { useMediaPipe } from "../hooks/useMediaPipe";
import { predictPosture } from "../services/api";

export default function CameraView({ onPredictionResult, onLoadingChange }) {
  const { videoRef, canvasRef, landmarks, isLoading, error, debugInfo } =
    useMediaPipe();

  // 랜드마크 데이터가 변경될 때 자세 예측 요청
  useEffect(() => {
    let timeoutId;

    const performPrediction = async () => {
      if (landmarks.length === 34) {
        // 필요한 모든 랜드마크가 있는지 확인
        try {
          const result = await predictPosture(landmarks);
          if (onPredictionResult) {
            onPredictionResult(result);
          }
        } catch (error) {
          console.error("자세 예측 중 오류 발생:", error);
        }
      }
    };

    // 100ms마다 예측 실행 (성능 최적화)
    if (landmarks.length > 0 && !isLoading) {
      timeoutId = setTimeout(performPrediction, 100);
    }

    // 로딩 상태 전달
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [landmarks, isLoading, onPredictionResult, onLoadingChange]);

  return (
    <div className="relative w-full h-0 pb-[75%] bg-black rounded-lg overflow-hidden">
      {/* 비디오 요소 (사용자에게 보이지 않음) */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover hidden"
        playsInline
      />

      {/* 캔버스 요소 (랜드마크 표시) */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        width={640}
        height={480}
      />

      {/* 가이드라인 메시지 */}
      <div className="absolute top-0 left-0 right-0 bg-blue-500 bg-opacity-70 text-white p-2 text-center text-sm">
        카메라에 전신이 보이도록 위치하고, 정면을 향해 서세요.
      </div>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-lg">
          카메라 연결 중...
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-3 rounded-lg">
          카메라 오류: {error}
        </div>
      )}

      {/* 디버그 정보 */}
      {debugInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs">
          <p>전신 감지: {debugInfo.isFullBody ? "예" : "아니오"}</p>
          <p>정면 감지: {debugInfo.isLookingFront ? "예" : "아니오"}</p>
          <p>랜드마크 수: {landmarks.length}/34</p>
          {debugInfo.visibilities && (
            <p>
              발목 신뢰도: 왼쪽(
              {(debugInfo.visibilities.lAnkle * 100).toFixed(1)}%), 오른쪽(
              {(debugInfo.visibilities.rAnkle * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
