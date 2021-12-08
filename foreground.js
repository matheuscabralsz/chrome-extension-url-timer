init();

function init() {

    console.log('---> INIT URL REDIRECT TIMER')

    if (!window.isUrlRedirectTimerRunning) {
        window.isUrlRedirectTimerRunning = true
        chrome.storage.local.get('currentUrl', async data => {
            const currentUrl = data.currentUrl;
            const secondsToWait = currentUrl.time
            await countdown(secondsToWait);
            redirectToNextUrl();
        })
    }
}

function redirectToNextUrl() {
    chrome.storage.local.get('isActivated', async isActivatedData => {
        const isActivated = isActivatedData.isActivated
        if (isActivated) {
            chrome.runtime.sendMessage({
                message: "countdown_complete"
            }, response => {
                if (response.message === 'success') {
                }
            });
        }
    });
}

async function countdown(secondsToWait) {
    let i = 0;
    while (secondsToWait > i) {
        console.log('secondsToWait: ', secondsToWait)
        console.log('countdown: ', i)
        i++
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
