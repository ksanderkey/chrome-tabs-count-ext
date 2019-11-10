'use strict';

chrome.runtime.onInstalled.addListener(onInit);

if (chrome.runtime && chrome.runtime.onStartup) {
    chrome.runtime.onStartup.addListener(function () {
        console.log('Starting browser... updating icon.');
        updateIcon();
    });
} else {
    // This hack is needed because Chrome 22 does not persist browserAction icon
    // state, and also doesn't expose onStartup. So the icon always starts out in
    // wrong state. We don't actually use onStartup except as a clue that we're
    // in a version of Chrome that has this problem.
    chrome.windows.onCreated.addListener(function () {
        console.log('Window created... updating icon.');
        updateIcon();
    });
}

chrome.tabs.onRemoved.addListener(
    (tabId) => {
        updateCount(tabId, true);
    });
chrome.tabs.onCreated.addListener(
    (tabId) => {
        updateCount(tabId, false);
    });

function onInit() {
    console.log('onInit');
    updateCount();
}

function updateIcon() {
    let defaultBadgeColor = {
        color: [190, 190, 190, 230]
    };
    let defaultBadgeText = {
        text: "?"
    };

    if (localStorage.hasOwnProperty('tabsCount')) {
        defaultBadgeColor.color = [208, 0, 24, 255];
        defaultBadgeText.text = localStorage.tabsCount !== "0" ? localStorage.tabsCount : "";
    }

    chrome.browserAction.setBadgeBackgroundColor(defaultBadgeColor);
    chrome.browserAction.setBadgeText(defaultBadgeText);
}

function updateCount(tabId, isOnRemoved) {
    chrome.tabs.query({}, tabs => {
        let length = tabs.length;

        // onRemoved fires too early and the count is one too many.
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
        if (isOnRemoved && tabId && tabs.map((t) => {
            return t.id;
        }).includes(tabId)) {
            length--;
        }

        localStorage.tabsCount = length;
        updateIcon();
    });
}
