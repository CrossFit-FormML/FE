import React from "react";

export default function Feedback({ predictionResult }) {
  if (!predictionResult || !predictionResult.best_posture) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-2">피드백</h2>
        <p className="text-gray-500">
          카메라 앞에서 크로스핏 동작을 수행해주세요.
        </p>
      </div>
    );
  }

  const { best_posture } = predictionResult;
  const { type, is_normal } = best_posture;

  // 자세 유형별 피드백 메시지
  const feedbackMessages = {
    deadlift: {
      normal: "좋은 데드리프트 자세입니다. 허리를 곧게 유지하세요.",
      abnormal:
        "데드리프트 자세를 개선하세요. 등을 곧게 펴고 고관절 힌지 동작을 의식하세요.",
    },
    squat: {
      normal: "좋은 스쿼트 자세입니다. 무릎이 발끝을 넘지 않도록 유지하세요.",
      abnormal:
        "스쿼트 자세를 개선하세요. 무릎이 너무 앞으로 나오지 않도록 주의하세요.",
    },
    press: {
      normal: "좋은 프레스 자세입니다. 어깨와 팔의 정렬을 유지하세요.",
      abnormal:
        "프레스 자세를 개선하세요. 어깨와 팔의 정렬을 확인하고 코어를 단단히 유지하세요.",
    },
    clean: {
      normal: "좋은 클린 자세입니다. 전신의 밸런스를 유지하세요.",
      abnormal:
        "클린 자세를 개선하세요. 바의 경로를 수직에 가깝게 유지하고 엉덩이를 충분히 사용하세요.",
    },
  };

  // 현재 자세 및 상태에 맞는 피드백 메시지 선택
  const message = feedbackMessages[type][is_normal ? "normal" : "abnormal"];

  // 자세 상태에 따른 스타일 클래스
  const statusClass = is_normal
    ? "bg-green-100 border-green-500"
    : "bg-red-100 border-red-500";

  return (
    <div className={`rounded-lg shadow-md p-4 border-l-4 ${statusClass}`}>
      <h2 className="text-xl font-bold mb-2">피드백</h2>
      <p className="text-gray-700">{message}</p>
    </div>
  );
}
