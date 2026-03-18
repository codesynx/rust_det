#!/bin/bash
# Deploy DET server components to VPS
# Usage: ./deploy.sh <vps-ip>

set -e

VPS=${1:?"Usage: ./deploy.sh <vps-ip>"}

echo "=== DET Server Deployment ==="

# 1. Install MediaMTX if not present
echo "Setting up MediaMTX..."
ssh root@$VPS 'bash -s' << 'REMOTE'
if ! command -v mediamtx &>/dev/null && [ ! -f /usr/local/bin/mediamtx ]; then
    echo "Installing MediaMTX..."
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="amd64" ;;
        aarch64) ARCH="arm64" ;;
    esac
    wget -q "https://github.com/bluenviron/mediamtx/releases/download/v1.9.3/mediamtx_v1.9.3_linux_${ARCH}.tar.gz" -O /tmp/mediamtx.tar.gz
    tar -xzf /tmp/mediamtx.tar.gz -C /usr/local/bin/ mediamtx
    chmod +x /usr/local/bin/mediamtx
    echo "MediaMTX installed"
else
    echo "MediaMTX already installed"
fi
REMOTE

# 2. Copy config
echo "Copying MediaMTX config..."
scp mediamtx.yml root@$VPS:/etc/mediamtx.yml

# 3. Copy and set up WS relay
echo "Setting up WebSocket relay..."
ssh root@$VPS 'mkdir -p /opt/det-server'
scp ws_relay.ts package.json root@$VPS:/opt/det-server/

# 4. Install Bun on VPS if needed
ssh root@$VPS 'bash -s' << 'REMOTE'
if ! command -v bun &>/dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
fi
REMOTE

# 5. Create systemd services
echo "Creating systemd services..."
ssh root@$VPS 'bash -s' << 'REMOTE'
cat > /etc/systemd/system/mediamtx.service << EOF
[Unit]
Description=MediaMTX SRT Server
After=network.target

[Service]
ExecStart=/usr/local/bin/mediamtx /etc/mediamtx.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/det-relay.service << EOF
[Unit]
Description=DET WebSocket Relay
After=network.target

[Service]
ExecStart=/root/.bun/bin/bun run /opt/det-server/ws_relay.ts
WorkingDirectory=/opt/det-server
Restart=always
RestartSec=5
Environment=WS_PORT=8765

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mediamtx det-relay
systemctl restart mediamtx det-relay

echo "Services started:"
systemctl status mediamtx --no-pager -l || true
systemctl status det-relay --no-pager -l || true
REMOTE

echo "=== Deployment complete ==="
echo "MediaMTX SRT: srt://$VPS:8890"
echo "WS Relay: ws://$VPS:8765"
echo "MediaMTX API: http://$VPS:9997"
