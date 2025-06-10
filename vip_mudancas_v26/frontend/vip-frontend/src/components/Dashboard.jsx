import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  Star,
  Truck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const Dashboard = () => {
  const [dadosDashboard, setDadosDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDashboard()
  }, [])

  const carregarDashboard = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('vip_token')}` }
      })

      const data = await response.json()
      
      if (data.success) {
        setDadosDashboard(data.dados)
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard VIP Mudanças</h1>
          <p className="text-gray-600">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Última atualização</p>
          <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Vendas do Mês</p>
                <p className="text-3xl font-bold">R$ {dadosDashboard?.vendas_mes?.toLocaleString()}</p>
                <p className="text-blue-100 text-sm">+12% vs mês anterior</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Mudanças Realizadas</p>
                <p className="text-3xl font-bold">{dadosDashboard?.mudancas_realizadas}</p>
                <p className="text-green-100 text-sm">Este mês</p>
              </div>
              <Truck className="h-12 w-12 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Clientes Ativos</p>
                <p className="text-3xl font-bold">{dadosDashboard?.clientes_ativos}</p>
                <p className="text-purple-100 text-sm">+8 novos esta semana</p>
              </div>
              <Users className="h-12 w-12 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Satisfação Média</p>
                <p className="text-3xl font-bold">{dadosDashboard?.satisfacao_media}</p>
                <p className="text-yellow-100 text-sm">⭐ Excelente</p>
              </div>
              <Star className="h-12 w-12 text-yellow-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário e Próximas Mudanças */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Próximas Mudanças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosDashboard?.proximas_mudancas?.map((mudanca, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{mudanca.cliente}</p>
                    <p className="text-sm text-gray-600">{new Date(mudanca.data).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">R$ {mudanca.valor.toLocaleString()}</p>
                    <Badge variant="outline">Agendada</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">Estoque Baixo</p>
                  <p className="text-xs text-red-600">Plástico Bolha precisa ser reposto</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Visita Hoje</p>
                  <p className="text-xs text-blue-600">14h - Cliente João Silva</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Meta Atingida</p>
                  <p className="text-xs text-green-600">Vendas do mês superaram expectativa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vendas</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Satisfação</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eficiência</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Ranking da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">1°</span>
                  <span className="font-medium">Kenneth</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">2°</span>
                  <span className="font-medium">Douglas</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">4.7</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">3°</span>
                  <span className="font-medium">Sebastião</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">4.5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acesso Rápido aos Módulos de IA */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos de Inteligência Artificial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Package className="h-6 w-6 mb-2" />
              <span className="text-sm">Estoque Inteligente</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Classificador IA</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Radar VIP</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Home className="h-6 w-6 mb-2" />
              <span className="text-sm">VIP Assistant</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

