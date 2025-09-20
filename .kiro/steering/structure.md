# プロジェクト構造

## ルートディレクトリ構成

- `.kiro/`: Kiro Spec-Driven Developmentワークフローに関連するすべてのファイルを格納します。
- `.gemini/`: カスタムコマンドを含む、Gemini CLIの設定を格納します。
- `GEMINI.md`: プロジェクトの主要なドキュメントです。

## サブディレクトリ構造

- `.kiro/steering/`: プロジェクト全体のコンテキストとルール（製品、技術、構造）を記述したステアリングファイルを格納します。
- `.kiro/specs/`: 機能固有の仕様書を格納します。
- `.gemini/commands/kiro/`: `.toml` ファイルを使用して、カスタムの `/kiro:*` スラッシュコマンドを定義します。

## ファイル命名規則

- **コマンド**: `[command-name].toml`
- **仕様**: `[feature-name]/[document-type].md` （例: `my-feature/requirements.md`）
- **ステアリング**: `product.md`, `tech.md`, `structure.md`

## 主要なアーキテクチャ原則

- **仕様駆動**: すべての開発は、`.kiro/specs/` にある承認済みの仕様に基づいています。
- **コンテキスト維持**: `.kiro/steering/` のドキュメントは、AIに一貫したプロジェクトコンテキストを提供するために使用されます。
- **コマンド拡張性**: 新しい機能やワークフローは、`.gemini/commands/` にTOMLファイルを追加することで、カスタムコマンドとして定義できます。
