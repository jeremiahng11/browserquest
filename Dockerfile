# BrowserQuest — single container that serves both the static client and the
# game websocket on one port (server/config.json has use_one_port=true).
#
# Node 10 is the newest runtime the 2012-era socket.io 1.x stack runs cleanly on.
# After swapping bcrypt -> bcryptjs every dependency is pure JS, so no build
# toolchain is needed and the alpine image stays small.
FROM node:10-alpine

WORKDIR /app

# Install production deps first for better layer caching.
COPY package.json ./
RUN npm install --production --no-audit --no-fund \
    && npm cache clean --force

# Copy the rest of the application (client/, server/, shared/, maps, etc.).
COPY . .

# Game + static client both listen here. Coolify can override PORT.
ENV PORT=8000
EXPOSE 8000

# Liveness probe against the built-in status endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/status" >/dev/null 2>&1 || exit 1

CMD ["node", "server/js/main.js"]
