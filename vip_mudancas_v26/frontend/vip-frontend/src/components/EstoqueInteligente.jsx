import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'

const EstoqueInteligente = () => {
  const [estoque, setEstoque] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [estoqueRes, alertasRes] = await Promise.all([
        fetch('http://localhost:5000/api/estoque', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('vip_token')}` }
        }),
        fetch('http://localhost:5000/api/estoque/alerta', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('vip_token')}` }
        })
      ])

      const estoqueData = await estoqueRes.json()
      const alertasData = await alertasRes.json()

      if (estoqueData.success) setEstoque(estoqueData.estoque)
      if (alertasData.success) setAlertas(alertasData.alertas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (item) => {
    if (item.quantidade < item.minimo) {
      return <Badge variant="destructive">Crítico</Badge>
    } else if (item.quantidade < item.minimo * 1.5) {
      return <Badge variant="secondary">Baixo</Badge>
    } else {
      return <Badge variant="default">Normal</Badge>
    }
  }

  const calcularPrevisao = (item) => {
    // Simulação de previsão baseada em consumo médio
    const consumoMedio = 5 // unidades por semana
    const diasRestantes = Math.floor(item.quantidade / (consumoMedio / 7))
    return diasRestantes
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Estoque Inteligente</h1>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            IA Ativa
          </span>
        </div>
        <Button onClick={carregarDados} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alertas Críticos */}
      {alertas.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas Críticos ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">{item.nome}</p>
                    <p className="text-sm text-red-600">
                      Estoque atual: {item.quantidade} | Mínimo: {item.minimo}
                    </p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Comprar Agora
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{estoque.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{alertas.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ 12.5k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Itens Normais</p>
                <p className="text-2xl font-bold text-green-600">{estoque.length - alertas.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantidade</th>
                  <th>Mínimo</th>
                  <th>Status</th>
                  <th>Previsão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estoque.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.minimo}</td>
                    <td>{getStatusBadge(item)}</td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {calcularPrevisao(item)} dias
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        {item.quantidade < item.minimo && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Comprar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Previsões Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle>Previsões Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📊 Análise de Consumo</h4>
              <p className="text-sm text-blue-700">
                Com base no histórico, você precisará repor <strong>Plástico Bolha</strong> em 3 dias.
                Recomendamos fazer o pedido hoje para evitar ruptura.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">💡 Sugestão de Compra</h4>
              <p className="text-sm text-green-700">
                Para otimizar custos, considere comprar <strong>Caixas de Papelão</strong> em maior quantidade.
                Desconto de 15% para pedidos acima de 100 unidades.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EstoqueInteligente

