export const DISABLE_PINCH_ZOOM = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    document.body.style['user-select'] = 'none'; // 안드로이드 방지 - 텍스트 롱 프레스
    document.body.style['-webkit-user-select'] = 'none'; // ios 방지 - 텍스트 롱 프레스
  })();`;

export const DISABLE_SCROLL_AND_ZOOM = `(function() {
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);

  document.body.style['user-select'] = 'none';
  document.body.style['-webkit-user-select'] = 'none';

  // 스크롤 방지 추가
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';

  // 터치 이벤트로 인한 스크롤 방지
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
})();`;

// 스크롤은 허용하되 바운스 효과나 오버스크롤 방지를 위한 스크립트
export const PREVENT_BOUNCE = `(function() {
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);

  document.body.style['user-select'] = 'none'; // 안드로이드 방지 - 텍스트 롱 프레스
  document.body.style['-webkit-user-select'] = 'none'; // ios 방지 - 텍스트 롱 프레스

  // 오버스크롤 방지 (바운스 효과 방지)
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overscrollBehavior = 'none';
})();`;
