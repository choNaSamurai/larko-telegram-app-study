// src/App.tsx
// Global layout root — tab router integration point
// CONSTRAINT: Bottom nav integration happens HERE, not in screen components

import { MyTasksScreen } from '@/components/screens/MyTasks/MyTasksScreen';

export function App() {
  // Phase 1: Only W1 My Tasks screen exists.
  // TODO: Add React Router for Balance + Profile tabs when those screens are built
  return <MyTasksScreen />;
}
