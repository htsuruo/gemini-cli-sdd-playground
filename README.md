# Gemini Spec-Driven Development Sample Project

## 概要

このプロジェクトは、Google Gemini CLI を活用した仕様駆動開発（Spec-Driven Development, SDD）を実践するためのサンプルアプリケーションです。
Node.js (TypeScript) をバックエンドとして、Passport.js を利用したGoogle OAuth 2.0 と2要素認証（2FA）を備えたユーザー認証機能を実装しています。

Gemini CLI のカスタムコマンド（`/kiro:*`）を用いて、要件定義、設計、タスク分割、実装までを一貫して管理するワークフローを体験できます。

## 主な特徴

- **仕様駆動開発 (SDD)**: Gemini CLI を用いた体系的な開発プロセス (`.kiro/` ディレクトリ参照)
- **モダンな技術スタック**: Node.js, Express, TypeScript, PostgreSQL, Sequelize
- **セキュアな認証機能**: Passport.js による Google OAuth 2.0 と2要素認証 (2FA)
- **コンテナベース開発**: Docker Compose による再現性の高い開発環境
- **テスト**: Jest と Supertest を用いた単体・結合テスト

## 仕様駆動開発 (SDD) ワークフロー

このプロジェクトでは、`GEMINI.md` に定義された以下のフェーズで開発を進めます。

1.  **Steering (操縦)**: プロジェクト全体のルールやコンテキストをAIに指示します。
2.  **Specification (仕様化)**:
    1.  **Requirements (要件定義)**: 機能要件を定義します。
    2.  **Design (設計)**: 要件に基づき、技術的な設計を行います。
    3.  **Tasks (タスク化)**: 設計を元に、具体的な実装タスクを生成します。
3.  **Implementation (実装)**: 生成されたタスクに従って開発を進めます。

各フェーズはGemini CLIの `/kiro:*` コマンドを通じて実行され、人間によるレビューを経て進行します。

## セットアップと実行方法

### 1. 環境変数の設定

`.env.example` ファイルをコピーして `.env` ファイルを作成し、Google OAuthのクライアントIDとシークレットなど、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. データベースとアプリケーションの起動

Docker Compose を使用して、PostgreSQLデータベースとアプリケーションを起動します。

```bash
docker-compose up --build
```

アプリケーションは `http://localhost:3000` （デフォルト）で起動します。

### 4. データベースマイグレーション

初回起動時やテーブル定義の変更後は、マイグレーションを実行してください。

```bash
# コンテナ内で実行する場合
docker-compose exec <app_service_name> npx sequelize-cli db:migrate
```

## ディレクトリ構成

```
.
├── .kiro/              # SDDの仕様書（要件、設計、タスク）
├── .gemini/            # Gemini CLIのカスタムコマンド定義
├── src/                # アプリケーションのソースコード (TypeScript)
├── models/             # Sequelizeのモデル定義
├── migrations/         # データベースのマイグレーションファイル
├── config/             # データベース設定など
├── compose.yml         # Docker Compose 設定ファイル
├── GEMINI.md           # このプロジェクトの開発ルールブック
└── package.json        # プロジェクト定義と依存関係
```

## 利用技術

- **バックエンド**: Node.js, Express.js
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **ORM**: Sequelize
- **認証**: Passport.js (passport-google-oauth20)
- **テスト**: Jest, Supertest
- **開発環境**: Docker
