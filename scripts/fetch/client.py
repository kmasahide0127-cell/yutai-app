"""J-Quants API V2 クライアント初期化モジュール。"""

import os
import sys
from pathlib import Path

import jquantsapi
from dotenv import load_dotenv

# プロジェクトルート(.envの場所)を解決
_PROJECT_ROOT = Path(__file__).parent.parent.parent


def get_client() -> jquantsapi.ClientV2:
    """
    .env から JQUANTS_API_KEY を読み込み、ClientV2 を返す。

    設定ファイルの探索順:
        1. プロジェクトルートの .env
        2. 環境変数 JQUANTS_API_KEY(既に設定済みなら .env より優先)

    Returns:
        jquantsapi.ClientV2: 初期化済みクライアント

    Raises:
        SystemExit: JQUANTS_API_KEY が未設定の場合
    """
    load_dotenv(_PROJECT_ROOT / ".env")

    api_key = os.getenv("JQUANTS_API_KEY")
    if not api_key:
        print("エラー: .envにJQUANTS_API_KEYを設定してください")
        print(f"  対象ファイル: {_PROJECT_ROOT / '.env'}")
        print("  形式: JQUANTS_API_KEY=your_api_key_here")
        print("  参考: .env.example を確認してください")
        sys.exit(1)

    return jquantsapi.ClientV2(api_key=api_key)
