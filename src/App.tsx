import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import { Toolbar } from './components/Toolbar';

function App() {
  return (
    <div className="w-full h-screen relative">
      <Toolbar />
      <Canvas>
        <Timeline />
      </Canvas>
    </div>
  );
}

export default App
