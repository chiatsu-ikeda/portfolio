'use strict';

document.querySelector('#year').textContent = new Date().getFullYear();

// 外部サイトのプレビューが読み込めなかった場合も、サイト名とリンクを保持します。
document.querySelectorAll('.site-preview img').forEach(image => {
  image.addEventListener('error', () => image.closest('.site-preview').classList.add('image-unavailable'));
});
