export const DISABLE_PINCH_ZOOM = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    document.body.style['user-select'] = 'none'; // 안드로이드 방지 - 텍스트 롱 프레스
    document.body.style['-webkit-user-select'] = 'none'; // ios 방지 - 텍스트 롱 프레스
  })();`;
