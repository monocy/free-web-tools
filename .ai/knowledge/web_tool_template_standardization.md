# Webツール共通アセットテンプレートの標準化と体系化

## 1. 概要
`free-web-tools` における各ツール開発を高速化かつ品質平準化するために、設定（テーマ、言語、背景画像、全画面表示など）の共通ロジックをテンプレートとして標準化・体系化しました。

## 2. テーマ切り替えにおける Tailwind CSS と CSS変数のハイブリッド連携
ライト・ダークおよびカスタムテーマ（サイバーネオン等）をシームレスに切り替えるため、以下の設計を採用しました。

* **課題**: 
  単に `theme-light` や `theme-neon` などの CSS クラス切り替えだけで CSS 変数を変えるだけでは、Tailwind CSS の `dark:` モード修飾子と連携できず、ライトテーマ時にダーク用の配色クラス（例：`text-slate-400` が本来ダーク向けなのに、ライトで視認できなくなるなど）が残存してしまう。
* **解決策**:
  テーマ適用スクリプトで、親要素から Tailwind の `dark` クラスをトグル切り替えする処理を追加。
  ```javascript
  if (themeName === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('dark'); // Tailwindのダーク修飾子を無効化
  } else {
    root.classList.add('dark');    // Tailwindのダーク修飾子を有効化
  }
  ```
  これにより、CSS変数によるきめ細かなスタイル制御と、Tailwind の `dark:` クラスを用いた配色定義の両方を安全に組み合わせることができます。

## 3. LocalStorage 保存の共通化と衝突回避
* **共通オブジェクト構造**:
  ツール設定は別々のキーで保存するのではなく、`tool-settings` というキーで一つの JSON オブジェクトにシリアライズして保存します。
* **カスタム設定の拡張**:
  各ツールの固有設定は `settings.custom` というサブオブジェクト配下に集約します。これにより、共通設定（`theme`, `lang`, `bgUrl` 等）の復元ロジックに影響を与えずに、ツール独自の追加設定を安全にシリアライズ・復元することができます。
  ```javascript
  const DEFAULT_SETTINGS = {
    lang: 'en',
    theme: 'dark',
    custom: { /* ツール固有の設定はここへ */ }
  };
  ```

## 4. 言語自動判別と LocalStorage フォールバック
* ユーザーが明示的に言語（日本語/英語）を切り替えた場合は LocalStorage の保存内容を最優先します。
* 初回アクセス時（LocalStorage が空の時）のみ、ブラウザ設定（`navigator.language`）に基づき、日本語環境（`ja` で始まる場合）であれば日本語、それ以外であれば英語を適用する以下のコードパターンを採用しています。
  ```javascript
  const stored = localStorage.getItem('tool-settings');
  if (stored) {
    Object.assign(settings, JSON.parse(stored));
  } else {
    const browserLang = navigator.language || '';
    settings.lang = browserLang.startsWith('ja') ? 'ja' : 'en';
  }
  ```
