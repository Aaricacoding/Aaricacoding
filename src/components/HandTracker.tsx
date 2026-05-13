import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as HandsNS from '@mediapipe/hands';
import * as CameraNS from '@mediapipe/camera_utils';

import type { Results } from '@mediapipe/hands';

const HandTracker: React.FC<{ onHandUpdate: (results: Results) => void }> = ({ onHandUpdate }) => {
  const webcamRef = useRef<Webcam>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Accessing them this way to handle the non-standard export format of Mediapipe
    const Hands = (HandsNS as any).Hands || (window as any).Hands || (HandsNS as any).default?.Hands;
    const Camera = (CameraNS as any).Camera || (window as any).Camera || (CameraNS as any).default?.Camera;

    if (!Hands) {
      console.error('Hands not found in Mediapipe library');
      return;
    }

    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      onHandUpdate(results);
    });

    handsRef.current = hands;

    if (webcamRef.current && webcamRef.current.video && Camera) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (hands) {
        hands.close();
      }
    };
  }, [onHandUpdate]);

  return (
    <div style={{ display: 'none' }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: 'user',
        }}
      />
    </div>
  );
};

export default HandTracker;
