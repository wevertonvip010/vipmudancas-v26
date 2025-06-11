from flask import Flask
from routes.user import user_bp  # importa suas rotas (ajuste se necessário)

app = Flask(__name__)

# Rota de verificação da API
@app.route('/saude')
def saude():
    return {'mensagem': 'API da VIP Mudanças está online!'}

# Registra as rotas do sistema
app.register_blueprint(user_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
