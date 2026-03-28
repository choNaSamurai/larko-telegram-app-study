import { W1MyTasks } from './pages/W1MyTasks'

function App() {
  return (
    <div className="max-w-[420px] mx-auto min-h-screen border-x border-white/5 shadow-2xl overflow-hidden relative">
      <W1MyTasks />
      
      {/* Background Gradient Orbs for Visual Premium Feel */}
      <div className="fixed top-[-100px] left-[-100px] size-[300px] bg-status-info/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[100px] right-[-100px] size-[300px] bg-status-warning/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}

export default App
