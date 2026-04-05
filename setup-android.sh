#!/bin/bash

# Opencode Android Setup Script with Proot
# Run this on your Android device (in Termux or similar)

set -e

echo "=========================================="
echo "  Opencode Android Setup"
echo "=========================================="

# Check if running as root warning
if [ "$(id -u)" -eq 0 ]; then
    echo "Warning: Running as root. Some features may not work as expected."
fi

# Detect architecture
ARCH=$(uname -m)
echo "Detected architecture: $ARCH"

# Setup directories
PROOT_DIR="$HOME/opencode-proot"
APP_DIR="$HOME/grocery-marking-app"
BIN_DIR="$HOME/bin"

mkdir -p "$BIN_DIR"

# Step 1: Install proot if not available
echo ""
echo "[1/4] Checking for proot..."
if ! command -v proot &> /dev/null; then
    echo "Installing proot..."
    pkg update && pkg install proot -y
else
    echo "proot already installed"
fi

# Step 2: Download Opencode binary
echo ""
echo "[2/4] Downloading Opencode..."

# Detect architecture name
case $ARCH in
    aarch64)
        ARCH_NAME="linux-arm64";;
    armv7l|armv8l)
        ARCH_NAME="linux-arm";;
    x86_64)
        ARCH_NAME="linux-amd64";;
    i*86)
        ARCH_NAME="linux-386";;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1;;
esac

OPENCODE_TMP="/tmp/opencode-${ARCH_NAME}.tar.gz"

# Try official install script first (recommended method)
echo "Trying official install method..."
if command -v curl &> /dev/null; then
    if curl -fsSL https://opencode.ai/install | bash -s -- --help 2>/dev/null | grep -q "help"; then
        echo "Using official install script..."
        curl -fsSL https://opencode.ai/install | bash -s -- --bin-dir="$PROOT_DIR" --extract-only
    fi
fi

# Fallback: Download from SourceForge mirror
if [ ! -f "$PROOT_DIR/opencode" ]; then
    echo "Downloading from SourceForge..."
    SF_URL="https://sourceforge.net/projects/opencode-ai.mirror/files/v1.2.27/opencode-${ARCH_NAME}.tar.gz/download"
    curl -fSL "$SF_URL" -o "$OPENCODE_TMP" --progress-bar || {
        # Alternative: Try direct GitHub releases
        GH_URL="https://github.com/anomalyco/opencode/releases/latest/download/opencode-${ARCH_NAME}.tar.gz"
        echo "Trying GitHub releases..."
        curl -fSL "$GH_URL" -o "$OPENCODE_TMP" --progress-bar
    }
    
    mkdir -p "$PROOT_DIR"
    tar -xzf "$OPENCODE_TMP" -C "$PROOT_DIR"
fi

# Verify installation
if [ ! -f "$PROOT_DIR/opencode" ]; then
    echo "Error: Opencode binary not found after extraction"
    ls -la "$PROOT_DIR/" 2>/dev/null || echo "Directory empty"
    exit 1
fi

chmod +x "$PROOT_DIR/opencode"

# Step 3: Create launcher scripts
echo ""
echo "[3/4] Creating launcher scripts..."

# Main opencode launcher with proot
cat > "$BIN_DIR/opencode" << 'LAUNCHER'
#!/bin/bash
PROOT_DIR="$HOME/opencode-proot"
cd "$HOME/grocery-marking-app" 2>/dev/null || cd ~
exec proot -0 "$PROOT_DIR/opencode" "$@"
LAUNCHER

chmod +x "$BIN_DIR/opencode"

# Direct shortcut (no proot wrapping)
cat > "$BIN_DIR/grocery-dev" << 'SHORTCUT'
#!/bin/bash
exec "$HOME/opencode-proot/opencode" "$HOME/grocery-marking-app" "$@"
SHORTCUT

chmod +x "$BIN_DIR/grocery-dev"

# Alias setup script
cat > "$BIN_DIR/setup-alias" << 'ALIAS'
#!/bin/bash
SHELL_RC="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"

if ! grep -q 'alias oc=' "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Opencode shortcut" >> "$SHELL_RC"
    echo "alias oc='$HOME/bin/grocery-dev'" >> "$SHELL_RC"
    echo "export PATH=\"\$HOME/bin:\$PATH\"" >> "$SHELL_RC"
    echo "Alias 'oc' added to $SHELL_RC"
else
    echo "Alias 'oc' already exists in $SHELL_RC"
fi

echo ""
echo "Run 'source ~/.bashrc' or restart your shell to use 'oc' shortcut"
ALIAS

chmod +x "$BIN_DIR/setup-alias"

# Cleanup
rm -f "$OPENCODE_TMP"

# Step 4: Clone project if not exists
echo ""
echo "[4/4] Setting up project..."

if [ ! -d "$APP_DIR" ]; then
    echo "Cloning grocery-marking-app..."
    git clone https://github.com/Chilumulashivani659/Grocery-marking-app.git "$APP_DIR" 2>/dev/null || {
        echo "Note: Project not found on GitHub. Push to GitHub first."
    }
else
    echo "Project already exists at $APP_DIR"
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Quick start:"
echo "  $HOME/bin/grocery-dev"
echo ""
echo "Or add shortcut:"
echo "  source ~/.bashrc  # then use 'oc' command"
echo ""
echo "Project location: $APP_DIR"
echo ""
