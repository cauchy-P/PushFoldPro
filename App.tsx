import React, { useState } from 'react';
import { RangeEditor } from './views/RangeEditor';
import { TrainingMode } from './views/TrainingMode';
import { Layers, PlayCircle, BarChart3 } from 'lucide-react';

type View = 'train' | 'edit';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('train');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              P
            </div>
            <span className="font-bold text-slate-800 tracking-tight">PushFold<span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setCurrentView('train')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'train' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PlayCircle size={16} />
              <span className="hidden sm:inline">Train</span>
            </button>
            <button 
              onClick={() => setCurrentView('edit')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'edit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers size={16} />
              <span className="hidden sm:inline">Ranges</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {currentView === 'train' ? <TrainingMode /> : <RangeEditor />}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          <p>Local Storage Enabled • No Server Required</p>
      </footer>
    </div>
  );
};

export default App;