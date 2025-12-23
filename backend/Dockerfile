FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências (production only)
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["npm", "start"]
