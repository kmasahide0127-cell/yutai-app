"""J-Quants API V2 クライアント初期化モジュール。"""

import os
import sys
from pathlib import Path

import jquantsapi
from dotenv import load_dotenv

# scripts/.env の場所を解決(このファイルは scripts/fetch/ にある)
_SCRIPTS_DIR = Path(__file__).parent.parent


def get_client() -> jquantsapi.ClientV2:
    """
    scripts/.env から JQUANTS_API_KEY を読み込み、ClientV2 を返す。

    設定ファイルの探索順:
        1. scripts/.env
        2. 環境変数 JQUANTS_API_KEY(既に設定済みなら .env より優先)

    Returns:
        jquantsapi.ClientV2: 初期化済みクライアント

    Raises:
        SystemExit: JQUANTS_API_KEY が未設定の場合
    """
    load_dotenv(_SCRIPTS_DIR / ".env")

    api_key = os.getenv("JQUANTS_API_KEY")
    if not api_key:
        print("エラー: scripts/.envにJQUANTS_API_KEYを設定してください")
        print(f"  対象ファイル: {_SCRIPTS_DIR / '.env'}")
        print("  .env.example を .env にコピーして、APIキーを記入してください")
        print("  cp scripts/.env.example scripts/.env")
        sys.exit(1)

    return jquantsapi.ClientV2(api_key=api_key)
