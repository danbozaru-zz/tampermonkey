// ==UserScript==
// @name          Google Title Tooltips
// @namespace     https://github.com/ohdeerdog/
// @version       0.2
// @downloadURL   https://github.com/ohdeerdog/tampermonkey/raw/master/google-title-tooltips.user.js
// @description   Applies original page titles to Google search results with truncated names
// @author        ohdeerdog
// @include       *://*.google.tld/*
// @run-at        document-body
// @grant         none
// @noframes
// ==/UserScript==

(function() {
  document.addEventListener('mouseover', event => {
    let target = event.target;
    let parent = target.parentElement;

    if (
      target.tagName === 'A' &&
      parent.tagName === 'H3' &&
      parent.classList.contains('r') &&
      target.innerText.indexOf('...') > 0 &&
      target.dataset.hovered === undefined
    ) {
      target.dataset.hovered = true;
      let cached_title = sessionStorage.getItem('url-title-' + target.href);
      if (!cached_title) {
        let request = new Request('https://urltitle.herokuapp.com/', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ url: target.href }),
        });

        fetch(request).then(response => {
          if (response.status === 200) {
            response.json().then(data => {
              target.setAttribute('title', data.title);
              sessionStorage.setItem('url-title-' + target.href, data.title);
              let cloned = target.cloneNode(true);
              target.style.display = 'none';
              parent.appendChild(cloned);
              setTimeout(() => {
                parent.removeChild(cloned);
                target.removeAttribute('style');
              });
            });
          }
        });
      } else {
        target.setAttribute('title', cached_title);
      }
    }
  });
})();
