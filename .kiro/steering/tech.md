# 技術スタック

## アーキテクチャ

Gemini APIと対話するコマンドラインインターフェース（CLI）ツールです。仕様とコマンドを管理するために、`.kiro/` および `.gemini/` というディレクトリベースのシステムを使用します。

## 設定

コマンドは、`.gemini/commands/kiro/` にあるTOMLファイルを使用して定義されます。

## 開発環境

Gemini CLIにアクセスできるシェル環境。特定のプログラミング言語はファイル構造からは明らかではありませんが、ロジックはGemini CLIのバックエンドによって処理される可能性が高いです。

## 一般的なコマンド

- `/kiro:spec-init`
- `/kiro:spec-requirements`
- `/kiro:spec-design`
- `/kiro:spec-tasks`
- `/kiro:spec-status`
- `/kiro:steering`

## 環境変数

このプロジェクトに固有の主要な環境変数は現在定義されていません。

## ポート設定

このプロジェクトはサービスを公開しないため、標準のポート設定はありません。
