// ==UserScript==
// @name          Inbox Go To Link And Mark Done
// @namespace     https://github.com/ohdeerdog/
// @version       0.1
// @downloadURL   https://github.com/ohdeerdog/tampermonkey/raw/master/inbox-go-to-link-and-mark-done.user.js
// @description   Adds the ability to go to a link and mark the email as done in Google Inbox
// @author        ohdeerdog
// @include       https://inbox.google.com/*
// @run-at        document-body
// @grant         GM_openInTab
// @noframes
// ==/UserScript==

(function(history) {
  var pushState = history.pushState;
  history.pushState = function(state) {
    pushState.apply(history, arguments);
    if (typeof history.onpushstate === 'function') {
      history.onpushstate({ state: state });
    }
  };
})(window.history);

(function() {
  function get_parent(el, tag) {
    while (el.parentNode) {
      el = el.parentNode;
      if (el.tagName === tag) return el;
    }
    return null;
  }

  let in_inbox = false;
  let mouse_is_in = false;

  let button = document.createElement('i');
  button.innerHTML = '&check;';
  button.style = 'display: none; position: absolute; z-index: 9999; background: #5892fc; border-radius: 50%; box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24); color: #fff; text-align: center; cursor: pointer';
  button.title = 'Go to link and mark email as done';
  document.body.appendChild(button);

  button.addEventListener('mouseout', event => {
    button.style.display = 'none';
    mouse_is_in = false;
  });

  button.addEventListener('mouseenter', event => {
    mouse_is_in = true;
  });

  button.addEventListener('click', event => {
    let done_button = document.querySelector(
      'div.scroll-list-item[aria-expanded=true] li[jsaction="click:global.archive"]'
    );

    done_button.click();

    setTimeout(
      () => {
        GM_openInTab(button.dataset.href, { active: true });
      },
      500
    );
  });

  setInterval(
    () => {
      if (!mouse_is_in) {
        button.style.display = 'none';
      }
    },
    2000
  );

  history.onpushstate = event => {
    if (location.pathname.includes('/u/')) {
      in_inbox = /^\/u\/[0-9]\/$/.test(location.pathname);
    } else {
      in_inbox = location.pathname === '/';
    }

    if (!in_inbox) {
      button.style.display = 'none';
    }
  };

  document.addEventListener(
    'mouseenter',
    event => {
      let target = event.target;
      if (
        in_inbox &&
        target.tagName === 'A' &&
        target.classList.contains('gmail_msg') &&
        !get_parent(target, 'A')
      ) {
        mouse_is_in = true;
        let rect = target.getBoundingClientRect();

        const button_ref_size = 20;
        let button_size = button_ref_size - 4;

        if (rect.height < button_ref_size) {
          button_size = rect.height - 4;
        }

        button.style.top = document.body.scrollTop + rect.top + 'px';
        button.style.left = rect.left + rect.width + 2 + 'px';
        button.style.width = button_size + 'px';
        button.style.height = button_size + 'px';
        button.style.lineHeight = button_size + 'px';
        button.style.fontSize = button_size - 2 + 'px';
        button.style.display = 'block';
        button.dataset.href = target.href;
      }
    },
    true
  );

  document.addEventListener(
    'mouseleave',
    event => {
      let target = event.target;
      if (
        target.tagName === 'A' &&
        target.classList.contains('gmail_msg') &&
        !get_parent(target, 'A')
      ) {
        mouse_is_in = false;
      }
    },
    true
  );
})();
