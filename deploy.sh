#!/bin/bash

# 🚀 Script de Deploy Automatizado - SmartEditor
# Uso: ./deploy.sh [frontend|backend|all]

set -e # Parar em caso de erro

echo "🚀 SmartEditor - Deploy Script"
echo "================================"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para mostrar progresso
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se está na raiz do projeto
if [ ! -f "DEPLOYMENT.md" ]; then
    log_error "Execute este script da raiz do projeto!"
    exit 1
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    log_error "Git não encontrado. Instale: https://git-scm.com/"
    exit 1
fi

# Função para deploy do frontend
deploy_frontend() {
    log_info "Iniciando deploy do Frontend (Vercel)..."

    cd frontend

    # Verificar se Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI não encontrado. Instalando..."
        npm install -g vercel
    fi

    # Build local para verificar
    log_info "Testando build local..."
    npm run build
    log_success "Build local OK!"

    # Deploy
    log_info "Fazendo deploy para Vercel..."
    vercel --prod

    log_success "Frontend deployed!"
    cd ..
}

# Função para deploy do backend
deploy_backend() {
    log_info "Iniciando deploy do Backend..."

    cd backend

    # Verificar se há mudanças
    if [[ -z $(git status -s) ]]; then
        log_info "Nenhuma mudança detectada no backend"
    else
        log_info "Mudanças detectadas. Commitando..."
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi

    # Push para GitHub (trigger deploy no Render)
    log_info "Pushing para GitHub..."
    git push origin main

    log_success "Backend pushed! Deploy será automático no Render."
    log_warning "Acesse Render Dashboard para acompanhar: https://dashboard.render.com"

    cd ..
}

# Verificar se tudo está commitado
check_git_status() {
    if [[ -n $(git status -s) ]]; then
        log_warning "Existem mudanças não commitadas:"
        git status -s

        read -p "Deseja commitar tudo agora? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "Mensagem do commit: " commit_msg
            git commit -m "$commit_msg"
            log_success "Mudanças commitadas!"
        else
            log_error "Deploy cancelado. Commite suas mudanças primeiro."
            exit 1
        fi
    fi
}

# Menu principal
case "$1" in
    frontend)
        log_info "Deploy: Frontend apenas"
        check_git_status
        deploy_frontend
        ;;
    backend)
        log_info "Deploy: Backend apenas"
        check_git_status
        deploy_backend
        ;;
    all)
        log_info "Deploy: Frontend + Backend"
        check_git_status
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "Uso: ./deploy.sh [frontend|backend|all]"
        echo ""
        echo "Opções:"
        echo "  frontend  - Deploy apenas frontend (Vercel)"
        echo "  backend   - Deploy apenas backend (Render via GitHub)"
        echo "  all       - Deploy completo (backend + frontend)"
        echo ""
        echo "Exemplo: ./deploy.sh all"
        exit 1
        ;;
esac

echo ""
log_success "Deploy concluído! 🎉"
echo ""
echo "📊 Status:"
echo "  Frontend: https://vercel.com/dashboard"
echo "  Backend:  https://dashboard.render.com"
echo "  Database: https://cloud.mongodb.com"
