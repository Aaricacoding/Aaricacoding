import { useState, useCallback } from 'react'
import './App.css'
import HandTracker from './components/HandTracker'
import MagicParticles from './components/MagicParticles'
import type { Results } from '@mediapipe/hands'

function App() {
  const [indexFingerPos, setIndexFingerPos] = useState<{ x: number, y: number } | null>(null);

  const handleHandUpdate = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Landmark 8 is the tip of the index finger
      const indexFingerTip = results.multiHandLandmarks[0][8];
      // Coordinates are normalized (0 to 1), map them to window size
      // We also flip X because webcam is usually mirrored
      setIndexFingerPos({
        x: (1 - indexFingerTip.x) * window.innerWidth,
        y: indexFingerTip.y * window.innerHeight
      });
    } else {
      setIndexFingerPos(null);
    }
  }, []);

  return (
    <div className="app-container">
      <div className="ui-overlay">
        <h1 className="title">AETHER HANDS</h1>
        <p className="subtitle">Move your hand in front of the camera</p>
      </div>

      <HandTracker onHandUpdate={handleHandUpdate} />
      <MagicParticles pointer={indexFingerPos} />

      <div className="scanner-line"></div>
    </div>
  )
}

export default App
