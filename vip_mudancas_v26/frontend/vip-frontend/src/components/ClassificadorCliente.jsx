import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, Brain, Target, TrendingUp } from 'lucide-react'

const ClassificadorCliente = () => {
  const [formData, setFormData] = useState({ nome: '', email: '' })
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [historico, setHistorico] = useState([])

  const classificarCliente = async () => {
    if (!formData.nome || !formData.email) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/classificador-cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vip_token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        const novoResultado = {
          ...formData,
          ...data.classificacao,
          timestamp: new Date()
        }
        setResultado(novoResultado)
        setHistorico(prev => [novoResultado, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error('Erro ao classificar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerfilColor = (perfil) => {
    switch (perfil) {
      case 'AAA': return 'bg-yellow-100 text-yellow-800'
      case 'AA': return 'bg-blue-100 text-blue-800'
      case 'A': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPerfilDescription = (perfil) => {
    switch (perfil) {
      case 'AAA': return 'Cliente Premium - Alto valor, máxima prioridade'
      case 'AA': return 'Cliente Padrão - Bom potencial, abordagem profissional'
      case 'A': return 'Cliente Econômico - Foco em preço competitivo'
      default: return 'Perfil não definido'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Classificador de Clientes</h1>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          IA Avançada
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Classificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Análise Inteligente de Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: joao@empresa.com"
              />
            </div>

            <Button 
              onClick={classificarCliente}
              disabled={loading || !formData.nome || !formData.email}
              className="w-full"
            >
              {loading ? 'Analisando...' : 'Classificar Cliente'}
            </Button>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Como funciona:</p>
              <ul className="space-y-1">
                <li>• Análise do domínio do e-mail</li>
                <li>• Identificação de padrões no nome</li>
                <li>• Classificação automática AAA/AA/A</li>
                <li>• Sugestão de abordagem personalizada</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Classificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">{resultado.nome}</h3>
                  <p className="text-gray-600 text-sm mb-3">{resultado.email}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge className={getPerfilColor(resultado.perfil)}>
                      Perfil {resultado.perfil}
                    </Badge>
                    <Badge variant="outline">{resultado.cargo}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {getPerfilDescription(resultado.perfil)}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Estratégia de Abordagem</h4>
                  <p className="text-sm text-blue-700">{resultado.abordagem}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Potencial de Conversão</p>
                    <p className="text-2xl font-bold text-green-800">
                      {resultado.perfil === 'AAA' ? '85%' : resultado.perfil === 'AA' ? '65%' : '45%'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Valor Médio Esperado</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {resultado.perfil === 'AAA' ? 'R$ 4.5k' : resultado.perfil === 'AA' ? 'R$ 2.8k' : 'R$ 1.5k'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Insira os dados do cliente para ver a análise inteligente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Classificações */}
      {historico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="vip-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Cargo</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historico.map((item, index) => (
                    <tr key={index}>
                      <td className="font-medium">{item.nome}</td>
                      <td className="text-gray-600">{item.email}</td>
                      <td>
                        <Badge className={getPerfilColor(item.perfil)}>
                          {item.perfil}
                        </Badge>
                      </td>
                      <td>{item.cargo}</td>
                      <td className="text-sm text-gray-500">
                        {item.timestamp.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes AAA</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes AA</p>
                <p className="text-2xl font-bold text-blue-600">28</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes A</p>
                <p className="text-2xl font-bold text-green-600">45</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClassificadorCliente

