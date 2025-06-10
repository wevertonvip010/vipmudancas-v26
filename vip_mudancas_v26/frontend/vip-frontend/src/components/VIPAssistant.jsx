import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Mic, MicOff, Send } from 'lucide-react'

const VIPAssistant = () => {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = { type: 'user', content: message, timestamp: new Date() }
    setConversation(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/vip-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vip_token')}`
        },
        body: JSON.stringify({ message })
      })

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage = { 
          type: 'assistant', 
          content: data.response, 
          timestamp: new Date() 
        }
        setConversation(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setLoading(false)
      setMessage('')
    }
  }

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'pt-BR'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
      }

      recognition.start()
    } else {
      alert('Reconhecimento de voz não suportado neste navegador')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">VIP Assistant</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          IA Integrada
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="text-lg">Conversa com o Assistente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversation.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Olá! Sou o VIP Assistant. Como posso ajudar você hoje?</p>
                    <p className="text-sm mt-2">Pergunte sobre estoque, agenda, financeiro ou qualquer coisa!</p>
                  </div>
                )}
                
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button
                  onClick={startVoiceRecognition}
                  variant="outline"
                  size="icon"
                  className={isListening ? 'bg-red-100 text-red-600' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={sendMessage} disabled={loading || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comandos Rápidos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comandos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setMessage('Como está o estoque hoje?')}
              >
                📦 Verificar Estoque
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setMessage('Qual minha agenda de hoje?')}
              >
                📅 Minha Agenda
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setMessage('Situação financeira do mês')}
              >
                💰 Financeiro
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setMessage('Relatório de vendas')}
              >
                📊 Vendas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Use comandos de voz clicando no microfone</li>
                <li>• Pergunte sobre qualquer área do sistema</li>
                <li>• O assistente aprende com suas preferências</li>
                <li>• Disponível 24/7 para sua equipe</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VIPAssistant

