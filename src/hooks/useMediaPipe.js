import { useState, useEffect, useRef } from "react";

export const useMediaPipe = () => {
  const [landmarks, setLandmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  // MediaPipe Pose 초기화 및 설정
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        setIsLoading(true);

        // MediaPipe 모듈 동적 로드
        const { Pose } = await import("@mediapipe/pose");
        const { drawConnectors, drawLandmarks } = await import(
          "@mediapipe/drawing_utils"
        );
        const { Camera } = await import("@mediapipe/camera_utils");

        // POSE_CONNECTIONS 가져오기
        const { POSE_CONNECTIONS } = await import("@mediapipe/pose");

        // 필요한 랜드마크 매핑 (MediaPipe 인덱스 <-> 필요한 랜드마크)
        const landmarkIndices = {
          LShoulder: 11,
          RShoulder: 12,
          LElbow: 13,
          RElbow: 14,
          LWrist: 15,
          RWrist: 16,
          LHip: 23,
          RHip: 24,
          LKnee: 25,
          RKnee: 26,
          LAnkle: 27,
          RAnkle: 28,
          LHeel: 29,
          RHeel: 30,
          LBigToe: 31,
          RBigToe: 32,
        };

        // 필요한 연결만 필터링 (상체, 하체)
        const neededConnections = POSE_CONNECTIONS.filter(([start, end]) => {
          return (
            // 상체 연결 (어깨, 팔꿈치, 손목)
            (start >= 11 && start <= 16 && end >= 11 && end <= 16) ||
            // 하체 연결 (엉덩이, 무릎, 발목, 발)
            (start >= 23 && start <= 32 && end >= 23 && end <= 32) ||
            // 몸통 연결 (어깨-엉덩이)
            (start === 11 && end === 23) || // 왼쪽 어깨 - 왼쪽 엉덩이
            (start === 12 && end === 24) || // 오른쪽 어깨 - 오른쪽 엉덩이
            (start === 11 && end === 12) || // 왼쪽 어깨 - 오른쪽 어깨
            (start === 23 && end === 24) // 왼쪽 엉덩이 - 오른쪽 엉덩이
          );
        });

        // 정면을 향하고 있는지 확인하는 함수
        function checkFrontFacing(landmarks) {
          // 어깨의 x 좌표 차이가 작으면 정면
          const lShoulderX = landmarks[11].x;
          const rShoulderX = landmarks[12].x;
          return Math.abs(lShoulderX - rShoulderX) > 0.1; // 어깨가 적절히 벌어져 있어야 함
        }

        // 전신이 보이는지 확인하는 함수
        function checkFullBody(landmarks) {
          // 발목 랜드마크의 visibility가 일정 값 이상이면 전신이 보이는 것으로 간주
          const lAnkleVis = landmarks[27].visibility;
          const rAnkleVis = landmarks[28].visibility;
          return lAnkleVis > 0.5 && rAnkleVis > 0.5;
        }

        // MediaPipe Pose 설정
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // 결과 처리 콜백 함수
        pose.onResults((results) => {
          setIsLoading(false);

          if (!canvasRef.current || !results.poseLandmarks) return;

          const canvasCtx = canvasRef.current.getContext("2d");
          const { width, height } = canvasRef.current;

          // 캔버스 초기화
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, width, height);

          // 비디오 프레임 그리기
          canvasCtx.drawImage(results.image, 0, 0, width, height);

          // 포즈 랜드마크 그리기 - 필요한 랜드마크와 연결만
          if (results.poseLandmarks) {
            // 필요한 연결만 그리기
            drawConnectors(
              canvasCtx,
              results.poseLandmarks,
              neededConnections,
              { color: "#00FF00", lineWidth: 2 }
            );

            // 필요한 랜드마크만 그리기
            const neededLandmarks = Object.values(landmarkIndices).map(
              (idx) => results.poseLandmarks[idx]
            );
            drawLandmarks(canvasCtx, neededLandmarks, {
              color: "#FF0000",
              lineWidth: 1,
              radius: 3,
            });

            // 필요한 랜드마크 추출
            const extractedLandmarks = [];

            // 각 필요한 관절의 x, y 좌표 추가
            for (const [name, index] of Object.entries(landmarkIndices)) {
              extractedLandmarks.push(results.poseLandmarks[index].x);
              extractedLandmarks.push(results.poseLandmarks[index].y);
            }

            // Hip 중앙점 추가 (LHip과 RHip의 중간)
            const hipX =
              (results.poseLandmarks[landmarkIndices["LHip"]].x +
                results.poseLandmarks[landmarkIndices["RHip"]].x) /
              2;
            const hipY =
              (results.poseLandmarks[landmarkIndices["LHip"]].y +
                results.poseLandmarks[landmarkIndices["RHip"]].y) /
              2;

            // Hip 중앙점 추가 위치 확인
            const hipIndex = 12; // LHip_x, LHip_y, RHip_x, RHip_y 다음 인덱스
            extractedLandmarks.splice(hipIndex, 0, hipX, hipY);

            // 정면을 향하고 있는지 확인
            const isLookingFront = checkFrontFacing(results.poseLandmarks);

            // 랜드마크가 전신인지 확인
            const isFullBody = checkFullBody(results.poseLandmarks);

            // 디버그 정보 업데이트
            setDebugInfo({
              isLookingFront,
              isFullBody,
              visibilities: {
                lAnkle: results.poseLandmarks[27].visibility,
                rAnkle: results.poseLandmarks[28].visibility,
              },
            });

            // 정면을 향하고 있고, 전신이 보이는 경우에만 랜드마크 설정
            // 또는 테스트를 위해 조건을 완화할 수 있습니다:
            // setLandmarks(extractedLandmarks);
            if (isLookingFront && isFullBody) {
              setLandmarks(extractedLandmarks);
            } else {
              // 조건이 맞지 않으면 빈 배열 설정
              setLandmarks([]);
            }
          }

          canvasCtx.restore();
        });

        poseRef.current = pose;

        // 카메라 설정
        if (videoRef.current) {
          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          cameraRef.current.start().catch((err) => {
            console.error("카메라 시작 오류:", err);
            setError(
              "카메라를 시작할 수 없습니다. 카메라 접근 권한을 확인해주세요."
            );
          });
        }
      } catch (err) {
        console.error("MediaPipe 초기화 오류:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initMediaPipe();

    // 정리 함수
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, []);

  return { videoRef, canvasRef, landmarks, isLoading, error, debugInfo };
};
