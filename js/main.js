/**
 * ================================================================
 * MAIN JAVASCRIPT
 * ================================================================
 * サイト全体のインタラクティブ機能を実装するJavaScript
 *
 * 主な機能:
 * - モバイルメニューの開閉
 * - スクロールアニメーション（Intersection Observer）
 * - 数値カウントアップアニメーション
 * - スムーズスクロール
 * - フォームバリデーション
 * - ヘッダーのスクロール効果
 *
 * 外部ライブラリは使用せず、Vanilla JSで実装
 */

'use strict';

// ============================================
// MOBILE MENU (モバイルメニュー)
// ============================================

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

// モバイルメニューボタンのクリックイベント
mobileMenuBtn.addEventListener('click', () => {
  const isOpen = !mobileMenu.hasAttribute('hidden');

  // メニューの開閉
  if (isOpen) {
    mobileMenu.setAttribute('hidden', '');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.querySelector('.mobile-menu-btn__icon').textContent = '☰';
  } else {
    mobileMenu.removeAttribute('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.querySelector('.mobile-menu-btn__icon').textContent = '✕';
  }
});

// ============================================
// SCROLL ANIMATION (スクロールアニメーション)
// ============================================

/**
 * Intersection Observerでスクロール到達時に要素を表示する
 * 要素にfade-inクラスが付いている場合、可視化時にfade-in--visibleを付与
 */
const observerOptions = {
  root: null,           // ビューポートをルートに設定
  rootMargin: '0px',   // ルートマージン（ビューポートからのオフセット）
  threshold: 0.1        // 要素が10%見えたらトリガー
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 要素が見えたらvisibleクラスを追加
      entry.target.classList.add('fade-in--visible');

      // 数値カウントアップの開始
      if (entry.target.querySelector('.stat-card__number')) {
        startCountUp(entry.target);
      }

      // 一度表示されたら監視を停止
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// fade-inクラスを持つすべての要素を監視
document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// ============================================
// COUNT UP ANIMATION (数値カウントアップ)
// ============================================

/**
 * 数値を0から目標値までカウントアップするアニメーション
 * @param {HTMLElement} container - stat-cardを含むコンテナ
 */
function startCountUp(container) {
  const numberElements = container.querySelectorAll('.stat-card__number');

  numberElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000; // アニメーション時間（ミリ秒）
    const frameDuration = 16; // 1フレームの時間（約60fps）
    const totalFrames = duration / frameDuration;
    const increment = target / totalFrames;

    let current = 0;
    let frame = 0;

    // カウントアップ関数
    const animate = () => {
      frame++;
      current += increment;

      // 目標値を超えないように丸める
      if (current > target) {
        current = target;
      }

      el.textContent = Math.floor(current);

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    // アニメーション開始
    requestAnimationFrame(animate);
  });
}

// ============================================
// SMOOTH SCROLL (スムーズスクロール)
// ============================================

/**
 * アンカーリンクをクリックした時、スムーズにスクロールする
 * CSSのscroll-behavior: smoothで実装済みだが、
 * JSでの制御が必要な場合の実装例
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      // ヘッダーの高さを考慮してスクロール
      const headerHeight = document.querySelector('.site-header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // モバイルメニューが開いている場合は閉じる
      if (mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.querySelector('.mobile-menu-btn__icon').textContent = '☰';
      }    }
  });
});

// ============================================
// HEADER SCROLL EFFECT (ヘッダーのスクロール効果)
// ============================================

let lastScrollY = window.scrollY;
const siteHeader = document.querySelector('.site-header');

/**
 * スクロール時にヘッダーのスタイルを変更
 * スクロールダウン時は背景色を濃くする
 */
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 100) {
    // スクロール位置が100pxを超えたら背景を濃くする
    siteHeader.style.background = 'rgba(15, 23, 42, 0.98)';
  } else {
    // トップに近い場合は通常の背景
    siteHeader.style.background = 'rgba(15, 23, 42, 0.95)';
  }

  lastScrollY = currentScrollY;
});

// ============================================
// FORM VALIDATION (フォームバリデーション)
// ============================================

const contactForm = document.querySelector('form[action="/contact"]');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    let isValid = true;
    const formData = new FormData(contactForm);

    // 必須項目のバリデーション
    const requiredFields = ['company', 'name', 'email', 'phone', 'message'];

    requiredFields.forEach(fieldName => {
      const field = contactForm.querySelector(`[name="${fieldName}"]`);
      const value = formData.get(fieldName);

      // 値が空の場合
      if (!value || value.trim() === '') {
        isValid = false;
        showError(field, 'この項目は必須です');
      } else {
        clearError(field);
      }

      // メールアドレスの形式チェック
      if (fieldName === 'email' && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          showError(field, '正しいメールアドレスを入力してください');
        }
      }

      // 電話番号の形式チェック
      if (fieldName === 'phone' && value.trim() !== '') {
        const phoneRegex = /^[0-9-]+$/;
        if (!phoneRegex.test(value)) {
          isValid = false;
          showError(field, '正しい電話番号を入力してください');
        }
      }
    });

    // バリデーションエラーがあれば送信を中止
    if (!isValid) {
      e.preventDefault();
    } else {
      // フォーム送信（実際の処理はサーバー側で実装）
      alert('お問い合わせありがとうございます。\n担当者より折り返しご連絡いたします。');
    }
  });
}

/**
 * フォーム項目にエラーメッセージを表示
 * @param {HTMLElement} field - フォーム項目
 * @param {string} message - エラーメッセージ
 */
function showError(field, message) {
  // 既存のエラーメッセージを削除
  clearError(field);

  // エラーメッセージ要素を作成
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.style.cssText = 'color: var(--color-error); font-size: var(--font-size-sm); margin-top: var(--space-1);';
  errorEl.textContent = message;

  // フォーム項目の後に挿入
  field.parentNode.insertBefore(errorEl, field.nextSibling);

  // エラー状態のスタイルを適用
  field.style.borderColor = 'var(--color-error)';
}

/**
 * フォーム項目のエラーメッセージを削除
 * @param {HTMLElement} field - フォーム項目
 */
function clearError(field) {
  const errorEl = field.parentNode.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
  field.style.borderColor = 'transparent';
}

// 入力時にエラーをクリア
contactForm?.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    clearError(field);
  });
});

// ============================================
// INIT (初期化)
// ============================================

/**
 * ページ読み込み時の初期化処理
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('サイトが読み込まれました。');

  // すでに見えている要素にはfade-in--visibleを追加
  document.querySelectorAll('.fade-in').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('fade-in--visible');
    }
  });
});

// ============================================
// CONSOLE MESSAGE (開発用コンソールメッセージ)
// ============================================

console.log(`
================================================
FUBAKO Sample Site
================================================
このサイトはFLOCSアーキテクチャで構築されています。

FLOCS (Flat Object CSS) の特徴:
- 3つのレイヤー: Function, Layout, Utility
- フラットな構造（ネストは最大2レベル）
- モバイルファースト
- CSS変数でテーマ管理

学習リソース:
https://github.com/vladh/flatobjectcss
================================================
`);
