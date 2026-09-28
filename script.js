'use strict';

document.querySelector('#year').textContent = new Date().getFullYear();

// 外部サイトのプレビューが読み込めなかった場合も、サイト名とリンクを保持します。
document.querySelectorAll('.site-preview img').forEach(image => {
  image.addEventListener('error', () => image.closest('.site-preview').classList.add('image-unavailable'));
});

// 簡易閲覧ゲート。ソースや画像を保護するものではありません。
const gate = document.querySelector('#access-gate');
const content = document.querySelector('#portfolio-content');
const form = document.querySelector('#access-form');
const passwordInput = document.querySelector('#access-password');
const message = document.querySelector('#access-message');
const expectedHash = window.PORTFOLIO_PASSWORD_HASH;
const sessionKey = 'portfolio-access';

function unlockPortfolio() {
  gate.hidden = true;
  content.hidden = false;
  passwordInput.value = '';
  const main = document.querySelector('#main');
  main.setAttribute('tabindex', '-1');
  main.focus({ preventScroll: true });
}

try {
  if (expectedHash && sessionStorage.getItem(sessionKey) === expectedHash) unlockPortfolio();
} catch {
  // ストレージが無効でも、パスワードの照合は利用できます。
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!expectedHash) {
    message.textContent = '閲覧設定の準備中です。';
    return;
  }
  if (!window.crypto?.subtle) {
    message.textContent = 'HTTPSのURLからアクセスしてください。';
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  passwordInput.removeAttribute('aria-invalid');
  message.textContent = '';
  try {
    const bytes = new TextEncoder().encode(passwordInput.value);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== expectedHash) {
      message.textContent = 'パスワードが違います。もう一度入力してください。';
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.select();
      return;
    }
    try { sessionStorage.setItem(sessionKey, expectedHash); } catch { /* 保存不可でも閲覧を許可 */ }
    unlockPortfolio();
  } catch {
    message.textContent = '確認できませんでした。ページを再読み込みしてお試しください。';
  } finally {
    button.disabled = false;
  }
});
