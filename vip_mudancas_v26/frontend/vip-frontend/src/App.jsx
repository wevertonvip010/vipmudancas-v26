import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import VIPAssistant from './components/VIPAssistant'
import EstoqueInteligente from './components/EstoqueInteligente'
import ClassificadorCliente from './components/ClassificadorCliente'
import RadarVIP from './components/RadarVIP'
import Notificacoes from './components/Notificacoes'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('vip_token')
    const userData = localStorage.getItem('vip_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('vip_token')
        localStorage.removeItem('vip_user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('vip_token', token)
    localStorage.setItem('vip_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('vip_token')
    localStorage.removeItem('vip_user')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando VIP Mudanças...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vip-assistant" element={<VIPAssistant />} />
              <Route path="/estoque" element={<EstoqueInteligente />} />
              <Route path="/classificador" element={<ClassificadorCliente />} />
              <Route path="/radar" element={<RadarVIP />} />
              <Route path="/notificacoes" element={<Notificacoes />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  )
}

export default App

