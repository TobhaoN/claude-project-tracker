import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PasswordGate from './components/PasswordGate'
import Header from './components/Header'
import Home from './pages/Home'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import ProjectDetail from './pages/ProjectDetail'
import Analytics from './pages/Analytics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

export default function App() {
  return (
    <PasswordGate>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/edit" element={<EditProject />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </PasswordGate>
  )
}
