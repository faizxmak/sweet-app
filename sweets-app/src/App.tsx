import './App.css'
import { AuthProvider } from './context/AuthContext'
import { SweetProvider } from './context/SweetContext'
import Home from './Home'

function App() {
  return (
    <AuthProvider>
      <SweetProvider>
        <div className="app">
          <Home />
        </div>
      </SweetProvider>
    </AuthProvider>
  )
}

export default App
