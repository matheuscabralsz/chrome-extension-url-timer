function reddenPage() {
    chrome.storage.local.get('currentUrl', data => {
        window.location.replace(data.currentUrl.url);
    })
}

async function countdownComplete() {
    chrome.storage.local.get('urls', urlsData => {
        chrome.storage.local.get('currentUrl', currentUrlData => {
            chrome.storage.local.get('enabledTab', enabledTabData => {
                chrome.storage.local.get('isActivated', async isActivatedData => {
                    const urls = urlsData.urls
                    const isActivated = isActivatedData.isActivated
                    let currentUrl = currentUrlData.currentUrl
                    const enabledTab = enabledTabData.enabledTab;
                    if (isActivated) {
                        for (let i = 0; i < urls.length; i++) {
                            if (i === urls.length - 1) {
                                currentUrl = urls[0]
                                break;
                            } else if (urls[i].uuid === currentUrl.uuid) {
                                currentUrl = urls[i + 1]
                                break;
                            }
                        }

                        chrome.storage.local.set({
                            currentUrl: currentUrl
                        });

                        chrome.scripting.executeScript({
                            target: {tabId: enabledTab.id},
                            function: reddenPage
                        });
                    }
                    return true
                })
            })
        })
    })
}

async function enableTab() {
    chrome.storage.local.get('enabledTab', enabledTabData => {
        const enabledTab = enabledTabData.enabledTab;
        chrome.scripting.executeScript({
            target: {tabId: enabledTab.id},
            function: reddenPage
        });
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'enable') {

        enableTab();

        if (chrome.runtime.lastError) {
            sendResponse({message: 'fail'});
            return;
        }

        sendResponse({
            message: 'success',
        });

        return true
    }

    if (request.message === 'countdown_complete') {

        countdownComplete()

        if (chrome.runtime.lastError) {
            sendResponse({message: 'fail'});
            return;
        }

        sendResponse({
            message: 'success',
        });

        return true
    }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.storage.local.get('enabledTab', enabledTabData => {
            const enabledTab = enabledTabData.enabledTab;
            if (enabledTab && enabledTab.id === tabId) {
                chrome.scripting.executeScript({
                    target: {tabId: enabledTab.id},
                    files: ["foreground.js"]
                })
            }
        })
    }
    return true;
});

chrome.tabs.onRemoved.addListener(function (tabid, removed) {
    chrome.storage.local.get('enabledTab', enabledTabData => {
        const enabledTab = enabledTabData.enabledTab;
        if (enabledTab && enabledTab.id === tabid) {
            chrome.storage.local.set({
                isActivated: false
            })
        }
    })

    return true;
})
