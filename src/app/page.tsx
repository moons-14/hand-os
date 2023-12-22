import React, { useCallback, useEffect, useRef, VFC } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { drawCanvas } from "@/canvas/drawCanvas";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<any>(null);

  /**
   * 検出結果（フレーム毎に呼び出される）
   * @param results
   */
  const onResults = useCallback((results: Results) => {
    resultsRef.current = results;

    const canvasCtx = canvasRef.current!.getContext("2d")!;
    drawCanvas(canvasCtx, results);
  }, []);

  // 初期設定
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current!.video! });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, [onResults]);

  /** 検出結果をconsoleに出力する */
  const OutputData = () => {
    const results = resultsRef.current as Results;
    console.log(results.multiHandLandmarks);
  };

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "environment",
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {/* capture */}
      <Webcam
        audio={false}
        style={{ visibility: "hidden" }}
        width={720}
        height={1280}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      {/* draw */}
      <canvas
        ref={canvasRef}
        className="w-[720px] h-[1280px] bg-white absolute"
      />
      {/* output */}
      <div className="absolute top-4 left-4">
        <button
          className="text-white bg-blue-500 text-sm rounded-lg px-4 py-2 cursor-pointer"
          onClick={OutputData}
        >
          Output Data
        </button>
      </div>
    </div>
  );
}
