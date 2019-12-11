// ==UserScript==
// @name          Remove editability on click from trello card details
// @namespace     https://github.com/danbozaru
// @version       1.1.3
// @downloadURL   https://raw.githubusercontent.com/danbozaru/tampermonkey/master/remove-trello-click-to-edit.user.js
// @description   Removes click to edit behavior from card detail descriptions within modals.
// @author        danbozaru
// @include       https://trello.com/*
// @run-at        document-start
// @grant         GM_log
// ==/UserScript==

((window) => {
    const listeners = [];
    const doc = window.document;
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer;

    const ready = (selector, fn) => {
        listeners.push({
            selector: selector,
            fn: fn
        });
        if (!observer) {
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true
            });
        }
        check();
    }

    const check = () => {
        for (var i = 0, listenersLength = listeners.length, listener, elements; i < listenersLength; i++) {
            listener = listeners[i];
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, elementsLength = elements.length, element; j < elementsLength; j++) {
                element = elements[j];
                if (!element.ready) {
                    element.ready = true;
                    listener.fn.call(element, element);
                }
            }
        }
    }
    window.ready = ready;
})(this);

window.ready('.current.markeddown', node => {
    node.addEventListener('click', event => {
        event.stopPropagation();
    });
    node.style.cursor = 'auto';
});
