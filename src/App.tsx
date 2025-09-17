import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';

function App() {
  return (
    <div className="w-full h-screen relative">
      <Toolbar />
      <Canvas />
    </div>
  );
}

export default App
