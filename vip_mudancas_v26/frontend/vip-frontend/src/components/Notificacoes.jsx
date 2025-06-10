import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, User, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarNotificacoes()
  }, [])

  const carregarNotificacoes = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/notificacoes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('vip_token')}` }
      })

      const data = await response.json()
      
      if (data.success) {
        setNotificacoes(data.notificacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = (id) => {
    setNotificacoes(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, lida: true } : notif
      )
    )
  }

  const getIconeNotificacao = (tipo) => {
    switch (tipo) {
      case 'financeiro': return <DollarSign className="h-5 w-5 text-green-600" />
      case 'estoque': return <Package className="h-5 w-5 text-orange-600" />
      case 'agenda': return <Calendar className="h-5 w-5 text-blue-600" />
      case 'sistema': return <Settings className="h-5 w-5 text-gray-600" />
      default: return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getCorNotificacao = (tipo) => {
    switch (tipo) {
      case 'financeiro': return 'border-l-green-500'
      case 'estoque': return 'border-l-orange-500'
      case 'agenda': return 'border-l-blue-500'
      case 'sistema': return 'border-l-gray-500'
      default: return 'border-l-blue-500'
    }
  }

  // Notificações simuladas adicionais baseadas no usuário
  const notificacoesPersonalizadas = [
    {
      id: 3,
      titulo: 'Lembrete de Visita',
      mensagem: 'Kenneth, você tem uma visita agendada para às 14h com o cliente João Silva.',
      tipo: 'agenda',
      data: new Date().toISOString(),
      prioridade: 'alta'
    },
    {
      id: 4,
      titulo: 'Meta Mensal',
      mensagem: 'Douglas, faltam 5 dias para o fechamento mensal. Receita atual: R$ 42.000.',
      tipo: 'financeiro',
      data: new Date().toISOString(),
      prioridade: 'media'
    },
    {
      id: 5,
      titulo: 'Avaliação Positiva',
      mensagem: 'Parabéns! Cliente Maria Santos deixou uma avaliação 5 estrelas no Google.',
      tipo: 'sistema',
      data: new Date().toISOString(),
      prioridade: 'baixa'
    }
  ]

  const todasNotificacoes = [...notificacoes, ...notificacoesPersonalizadas]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notificações Inteligentes</h1>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {todasNotificacoes.filter(n => !n.lida).length} Novas
          </span>
        </div>
        <Button onClick={carregarNotificacoes} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{todasNotificacoes.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {todasNotificacoes.filter(n => !n.lida).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todasNotificacoes.filter(n => n.lida).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Central de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todasNotificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`border-l-4 ${getCorNotificacao(notificacao.tipo)} bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  !notificacao.lida ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getIconeNotificacao(notificacao.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{notificacao.titulo}</h3>
                        {!notificacao.lida && (
                          <Badge variant="destructive" className="text-xs">Nova</Badge>
                        )}
                        {notificacao.prioridade === 'alta' && (
                          <Badge variant="destructive" className="text-xs">Urgente</Badge>
                        )}
                        {notificacao.prioridade === 'media' && (
                          <Badge variant="secondary" className="text-xs">Importante</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notificacao.mensagem}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notificacao.data).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {notificacao.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notificacao.lida && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarComoLida(notificacao.id)}
                      >
                        Marcar como Lida
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      Ações
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Tipos de Notificação</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Lembretes de agenda</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Alertas de estoque</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Relatórios financeiros</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Avaliações de clientes</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Horários de Notificação</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Manhã (8h - 12h)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Tarde (12h - 18h)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Noite (18h - 22h)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Fins de semana</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button className="w-full md:w-auto">
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Importações necessárias que faltaram
import { DollarSign, Package, Calendar, Settings } from 'lucide-react'

export default Notificacoes

