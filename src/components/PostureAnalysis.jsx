import React from "react";

export default function PostureAnalysis({ predictionResult }) {
  // 예측 결과가 없는 경우
  if (!predictionResult || !predictionResult.best_posture) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold mb-4">분석 결과</h2>
        <p className="text-gray-500">
          자세를 분석하려면 카메라 앞에서 크로스핏 동작을 수행하세요.
        </p>
      </div>
    );
  }

  const { best_posture, all_results } = predictionResult;

  // 자세 유형 한글 매핑
  const postureTypeKorean = {
    deadlift: "데드리프트",
    squat: "스쿼트",
    press: "프레스",
    clean: "클린",
  };

  // 정확도 백분율 계산
  const accuracy = best_posture.normal_probability * 100;

  // 정확도에 따른 색상 설정
  const getAccuracyColor = (acc) => {
    if (acc >= 80) return "bg-green-500";
    if (acc >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">분석 결과</h2>

      {/* 최적 자세 정보 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">감지된 자세:</span>
          <span className="font-bold text-blue-600">
            {postureTypeKorean[best_posture.type]}
          </span>
        </div>

        <div className="mb-2">
          <span className="font-semibold block mb-1">정확도:</span>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getAccuracyColor(accuracy)}`}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-sm font-semibold">
              {accuracy.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold">자세 상태:</span>
          <span
            className={
              best_posture.is_normal
                ? "text-green-600 font-bold"
                : "text-red-600 font-bold"
            }
          >
            {best_posture.is_normal ? "정상" : "비정상"}
          </span>
        </div>
      </div>

      {/* 모든 자세 분석 결과 */}
      <div>
        <h3 className="font-bold mb-2">모든 자세 분석</h3>
        <div className="space-y-2">
          {Object.entries(all_results).map(([type, result]) => (
            <div key={type} className="flex justify-between items-center">
              <span>{postureTypeKorean[type]}:</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div
                    className={`h-full ${getAccuracyColor(
                      result.normal_probability * 100
                    )}`}
                    style={{ width: `${result.normal_probability * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold">
                  {(result.normal_probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
