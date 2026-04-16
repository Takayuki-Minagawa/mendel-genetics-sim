# 1. 軽量なPython環境をベースにする
FROM python:3.11-slim

# 2. 必須システムツールと【sudo】のインストール
# ※軽量イメージにはsudoとgnupgが含まれていないため追加し、最後にキャッシュを削除します
RUN apt-get update && apt-get install -y \
    curl \
    git \
    gnupg \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# 3. Node.jsのインストール（Claude Code実行用）
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 4. GitHub CLI (gh) のインストール
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# 5. Claude Codeのインストール
RUN npm install -g @anthropic-ai/claude-code

# 6. 【重要】一般ユーザーの作成とsudoパスワード免除設定
# "developer"というユーザーを作り、sudoをパスワードなしで実行できるようにします
RUN useradd -m -s /bin/bash developer \
    && echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && mkdir -p /workspace \
    && chown -R developer:developer /workspace

# ---------------------------------------------------
# ここから下のコマンドは「developer」ユーザーとして実行されます
# ---------------------------------------------------
USER developer

# 7. 超高速パッケージマネージャー「uv」のインストール
# ※developerユーザーのホームディレクトリにインストールされるよう、USER設定の後に配置しています
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/home/developer/.local/bin:$PATH"

# 8. 作業ディレクトリの設定
WORKDIR /workspace

# 9. 【魔法の1行】ローカルのファイルとGit設定をすべてコンテナ内に吸い込む
# ※一般ユーザーで編集できるように、所有権を「developer」に変更しながらコピーします
COPY --chown=developer:developer . /workspace