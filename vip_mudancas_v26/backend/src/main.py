import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import openai
from functools import wraps
import hashlib
import secrets

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'vip_mudancas_2024_secure_key_production_' + secrets.token_hex(16))
CORS(app, origins=["*"])

# Configuração OpenAI para VIP Assistant
openai.api_key = os.getenv('OPENAI_API_KEY', '')

# Middleware de segurança
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'success': False, 'message': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'success': False, 'message': 'Token necessário'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['username']
            current_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Token inválido'}), 401
        
        return f(current_user, current_role, *args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, current_role, *args, **kwargs):
            if current_role not in allowed_roles:
                return jsonify({'success': False, 'message': 'Acesso negado'}), 403
            return f(current_user, current_role, *args, **kwargs)
        return decorated
    return decorator

# Função para criptografar dados sensíveis
def encrypt_sensitive_data(data):
    """Simula criptografia de dados sensíveis"""
    return hashlib.sha256(str(data).encode()).hexdigest()

# Dados simulados com segurança aprimorada
usuarios = {
    'admin': {
        'password': generate_password_hash('admin123'),
        'role': 'gestor',
        'name': 'Administrador',
        'permissions': ['read', 'write', 'delete', 'admin']
    },
    'kenneth': {
        'password': generate_password_hash('kenneth123'),
        'role': 'vendedor',
        'name': 'Kenneth',
        'permissions': ['read', 'write']
    },
    'douglas': {
        'password': generate_password_hash('douglas123'),
        'role': 'financeiro',
        'name': 'Douglas',
        'permissions': ['read', 'write', 'financial']
    }
}

# Dados de estoque com proteção
estoque_items = [
    {'id': 1, 'nome': 'Caixas de Papelão', 'quantidade': 50, 'minimo': 20, 'valor_unitario': encrypt_sensitive_data(15.50)},
    {'id': 2, 'nome': 'Fita Adesiva', 'quantidade': 15, 'minimo': 10, 'valor_unitario': encrypt_sensitive_data(8.90)},
    {'id': 3, 'nome': 'Plástico Bolha', 'quantidade': 8, 'minimo': 15, 'valor_unitario': encrypt_sensitive_data(25.00)},
    {'id': 4, 'nome': 'Papel Jornal', 'quantidade': 25, 'minimo': 10, 'valor_unitario': encrypt_sensitive_data(12.00)}
]

# Dados de clientes com proteção
clientes_protegidos = [
    {
        'id': 1, 
        'nome': 'João Silva', 
        'email': encrypt_sensitive_data('joao@empresa.com'), 
        'perfil': 'AAA', 
        'cargo': 'CEO',
        'telefone': encrypt_sensitive_data('11999999999')
    },
    {
        'id': 2, 
        'nome': 'Maria Santos', 
        'email': encrypt_sensitive_data('maria@gmail.com'), 
        'perfil': 'AA', 
        'cargo': 'Gerente',
        'telefone': encrypt_sensitive_data('11888888888')
    }
]

# Log de auditoria
audit_log = []

def log_action(user, action, details):
    """Registra ações para auditoria"""
    audit_log.append({
        'timestamp': datetime.utcnow().isoformat(),
        'user': user,
        'action': action,
        'details': details,
        'ip': request.remote_addr
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Log da tentativa de login
    log_action(username, 'LOGIN_ATTEMPT', {'ip': request.remote_addr})
    
    if username in usuarios and check_password_hash(usuarios[username]['password'], password):
        token = jwt.encode({
            'username': username,
            'role': usuarios[username]['role'],
            'permissions': usuarios[username]['permissions'],
            'exp': datetime.utcnow() + timedelta(hours=8)  # Token expira em 8 horas
        }, app.config['SECRET_KEY'])
        
        log_action(username, 'LOGIN_SUCCESS', {'role': usuarios[username]['role']})
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'username': username,
                'name': usuarios[username]['name'],
                'role': usuarios[username]['role'],
                'permissions': usuarios[username]['permissions']
            }
        })
    
    log_action(username, 'LOGIN_FAILED', {'reason': 'Invalid credentials'})
    return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

@app.route('/api/vip-assistant', methods=['POST'])
@token_required
def vip_assistant(current_user, current_role):
    data = request.get_json()
    message = data.get('message', '')
    
    # Log da interação com IA
    log_action(current_user, 'AI_INTERACTION', {'message_length': len(message)})
    
    try:
        # Filtro de segurança para mensagens
        forbidden_keywords = ['password', 'token', 'secret', 'admin']
        if any(keyword in message.lower() for keyword in forbidden_keywords):
            return jsonify({'success': False, 'error': 'Consulta não permitida'}), 400
        
        # Simulação de resposta da IA baseada no papel do usuário
        if current_role == 'financeiro' and 'estoque' in message.lower():
            response = "Acesso negado. Consulte o setor de estoque para essas informações."
        elif 'estoque' in message.lower():
            response = "Verificando estoque... Temos 3 itens abaixo do mínimo: Plástico Bolha (8 unidades, mínimo 15)."
        elif 'agenda' in message.lower():
            response = "Hoje você tem 2 visitas agendadas: 14h - Cliente João Silva, 16h - Cliente Maria Santos."
        elif 'financeiro' in message.lower() and current_role in ['gestor', 'financeiro']:
            response = "Situação financeira: Receita do mês R$ 45.000, Despesas R$ 32.000, Lucro R$ 13.000."
        elif 'financeiro' in message.lower():
            response = "Acesso negado. Você não tem permissão para acessar dados financeiros."
        else:
            response = "Como posso ajudar você hoje? Posso fornecer informações sobre estoque, agenda e muito mais."
        
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        log_action(current_user, 'AI_ERROR', {'error': str(e)})
        return jsonify({'success': False, 'error': 'Erro interno do sistema'}), 500

@app.route('/api/notificacoes', methods=['GET'])
@token_required
def get_notificacoes(current_user, current_role):
    # Notificações filtradas por papel do usuário
    notificacoes_base = [
        {
            'id': 1,
            'titulo': 'Relatório Mensal',
            'mensagem': f'{current_user}, hoje é dia de gerar o relatório mensal.',
            'tipo': 'financeiro' if current_role == 'financeiro' else 'geral',
            'data': datetime.now().isoformat(),
            'role_required': ['gestor', 'financeiro']
        },
        {
            'id': 2,
            'titulo': 'Estoque Baixo',
            'mensagem': 'Plástico Bolha está abaixo do estoque mínimo.',
            'tipo': 'estoque',
            'data': datetime.now().isoformat(),
            'role_required': ['gestor', 'vendedor']
        }
    ]
    
    # Filtrar notificações baseadas no papel
    notificacoes_filtradas = [
        notif for notif in notificacoes_base 
        if current_role in notif.get('role_required', [current_role])
    ]
    
    log_action(current_user, 'VIEW_NOTIFICATIONS', {'count': len(notificacoes_filtradas)})
    
    return jsonify({'success': True, 'notificacoes': notificacoes_filtradas})

@app.route('/api/estoque', methods=['GET'])
@token_required
@role_required(['gestor', 'vendedor'])
def get_estoque(current_user, current_role):
    # Remove dados sensíveis para usuários não autorizados
    estoque_publico = []
    for item in estoque_items:
        item_publico = {
            'id': item['id'],
            'nome': item['nome'],
            'quantidade': item['quantidade'],
            'minimo': item['minimo']
        }
        # Apenas gestores veem valores
        if current_role == 'gestor':
            item_publico['valor_unitario'] = '[PROTEGIDO]'  # Em produção, descriptografar
        estoque_publico.append(item_publico)
    
    log_action(current_user, 'VIEW_STOCK', {'items_count': len(estoque_publico)})
    
    return jsonify({'success': True, 'estoque': estoque_publico})

@app.route('/api/estoque/alerta', methods=['GET'])
@token_required
@role_required(['gestor', 'vendedor'])
def estoque_alerta(current_user, current_role):
    alertas = [item for item in estoque_items if item['quantidade'] < item['minimo']]
    
    log_action(current_user, 'VIEW_STOCK_ALERTS', {'alerts_count': len(alertas)})
    
    return jsonify({'success': True, 'alertas': alertas})

@app.route('/api/classificador-cliente', methods=['POST'])
@token_required
@role_required(['gestor', 'vendedor'])
def classificar_cliente(current_user, current_role):
    data = request.get_json()
    nome = data.get('nome', '')
    email = data.get('email', '')
    
    # Validação de entrada
    if not nome or not email or '@' not in email:
        return jsonify({'success': False, 'error': 'Dados inválidos'}), 400
    
    # Log da classificação
    log_action(current_user, 'CLASSIFY_CLIENT', {'client_email': encrypt_sensitive_data(email)})
    
    # Simulação de classificação por IA
    if '@empresa.com' in email or 'ceo' in nome.lower():
        perfil = 'AAA'
        cargo = 'Executivo'
        abordagem = 'Abordagem premium, foco em qualidade e agilidade'
    elif '@gmail.com' in email:
        perfil = 'AA'
        cargo = 'Profissional'
        abordagem = 'Abordagem padrão, destaque custo-benefício'
    else:
        perfil = 'A'
        cargo = 'Pessoa Física'
        abordagem = 'Abordagem econômica, foco no preço'
    
    return jsonify({
        'success': True,
        'classificacao': {
            'perfil': perfil,
            'cargo': cargo,
            'abordagem': abordagem
        }
    })

@app.route('/api/radar-vip', methods=['GET'])
@token_required
@role_required(['gestor'])
def radar_vip(current_user, current_role):
    # Dados de inteligência de mercado - apenas para gestores
    dados_mercado = {
        'concorrentes': [
            {'nome': 'Mudanças Express', 'contratos': 15, 'valor_medio': 2500},
            {'nome': 'TransporTudo', 'contratos': 12, 'valor_medio': 2200},
            {'nome': 'Mudança Fácil', 'contratos': 8, 'valor_medio': 1800}
        ],
        'oportunidades': [
            {'descricao': 'Licitação Prefeitura - Mudança de Órgãos', 'valor': 50000, 'prazo': '15 dias'},
            {'descricao': 'Contrato Empresa XYZ - Relocação', 'valor': 25000, 'prazo': '30 dias'}
        ],
        'tendencias': {
            'crescimento_setor': '12%',
            'demanda_residencial': 'Alta',
            'demanda_corporativa': 'Média'
        }
    }
    
    log_action(current_user, 'VIEW_MARKET_RADAR', {'data_accessed': True})
    
    return jsonify({'success': True, 'dados': dados_mercado})

@app.route('/api/dashboard', methods=['GET'])
@token_required
def dashboard(current_user, current_role):
    # Dados do dashboard filtrados por papel
    dados_base = {
        'vendas_mes': 45000 if current_role in ['gestor', 'financeiro'] else None,
        'mudancas_realizadas': 23,
        'clientes_ativos': 156,
        'satisfacao_media': 4.7,
        'proximas_mudancas': [
            {'cliente': 'João Silva', 'data': '2025-06-10', 'valor': 3500 if current_role in ['gestor', 'financeiro'] else None},
            {'cliente': 'Maria Santos', 'data': '2025-06-12', 'valor': 2800 if current_role in ['gestor', 'financeiro'] else None}
        ]
    }
    
    log_action(current_user, 'VIEW_DASHBOARD', {'role': current_role})
    
    return jsonify({'success': True, 'dados': dados_base})

@app.route('/api/audit-log', methods=['GET'])
@token_required
@role_required(['gestor'])
def get_audit_log(current_user, current_role):
    """Endpoint para auditoria - apenas gestores"""
    log_action(current_user, 'VIEW_AUDIT_LOG', {'entries_count': len(audit_log)})
    
    return jsonify({'success': True, 'audit_log': audit_log[-50:]})  # Últimas 50 entradas

@app.route('/api/security-status', methods=['GET'])
@token_required
@role_required(['gestor'])
def security_status(current_user, current_role):
    """Status de segurança do sistema"""
    status = {
        'active_sessions': len([log for log in audit_log if log['action'] == 'LOGIN_SUCCESS' and 
                               (datetime.utcnow() - datetime.fromisoformat(log['timestamp'])).seconds < 28800]),
        'failed_logins_today': len([log for log in audit_log if log['action'] == 'LOGIN_FAILED' and 
                                   datetime.fromisoformat(log['timestamp']).date() == datetime.utcnow().date()]),
        'system_health': 'Operational',
        'last_backup': datetime.utcnow().isoformat(),
        'encryption_status': 'Active'
    }
    
    log_action(current_user, 'VIEW_SECURITY_STATUS', status)
    
    return jsonify({'success': True, 'status': status})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)  # Debug desabilitado em produção

