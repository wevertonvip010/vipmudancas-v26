import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Radar, TrendingUp, Building, DollarSign, Calendar, RefreshCw } from 'lucide-react'

const RadarVIP = () => {
  const [dadosMercado, setDadosMercado] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/radar-vip', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('vip_token')}` }
      })

      const data = await response.json()
      
      if (data.success) {
        setDadosMercado(data.dados)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do radar:', error)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radar className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Radar VIP - Inteligência de Mercado</h1>
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Dados em Tempo Real
          </span>
        </div>
        <Button onClick={carregarDados} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Tendências do Mercado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Crescimento do Setor</p>
                <p className="text-2xl font-bold">{dadosMercado?.tendencias.crescimento_setor}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Demanda Residencial</p>
                <p className="text-2xl font-bold">{dadosMercado?.tendencias.demanda_residencial}</p>
              </div>
              <Building className="h-8 w-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Demanda Corporativa</p>
                <p className="text-2xl font-bold">{dadosMercado?.tendencias.demanda_corporativa}</p>
              </div>
              <Building className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Concorrência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Radar className="h-5 w-5 mr-2" />
            Análise de Concorrência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="vip-table">
              <thead>
                <tr>
                  <th>Concorrente</th>
                  <th>Contratos Públicos</th>
                  <th>Valor Médio</th>
                  <th>Performance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dadosMercado?.concorrentes.map((concorrente, index) => (
                  <tr key={index}>
                    <td className="font-medium">{concorrente.nome}</td>
                    <td>{concorrente.contratos}</td>
                    <td>R$ {concorrente.valor_medio.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(concorrente.contratos / 20) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((concorrente.contratos / 20) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {index === 0 && <Badge variant="destructive">Líder</Badge>}
                      {index === 1 && <Badge variant="secondary">Forte</Badge>}
                      {index === 2 && <Badge variant="outline">Emergente</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades de Negócio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Oportunidades de Negócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosMercado?.oportunidades.map((oportunidade, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-lg">{oportunidade.descricao}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    R$ {oportunidade.valor.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Prazo: {oportunidade.prazo}
                  </div>
                  <Button size="sm" className="ml-auto">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Insights Estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Oportunidade:</strong> Mercado residencial em alta. 
                Considere aumentar investimento em marketing digital.
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Concorrente "Mudanças Express" 
                está ganhando contratos públicos. Monitore preços.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Vantagem:</strong> Seu valor médio está competitivo. 
                Foque na qualidade do serviço para diferenciação.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Participação de Mercado</span>
                  <span>18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Competitividade de Preço</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Satisfação do Cliente</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RadarVIP

