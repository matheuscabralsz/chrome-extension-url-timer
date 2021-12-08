oninit();

function oninit() {

    chrome.storage.local.get('isActivated', data => {
        document.getElementById("activeSwitch").checked = data.isActivated;
        updateLabel(data.isActivated);
    });

    handleStoredUrlsState();

    handleListeners();
}

function updateLabel(activated) {
    document.getElementById('container').hidden = activated;
    if (activated) {
        document.getElementById('label').innerHTML = 'Disable';
    } else {
        document.getElementById('label').innerHTML = 'Enable';
    }
}

function handleStoredUrlsState() {
    chrome.storage.local.get('urls', data => {
        let urlList = '';
        const urls = data.urls ? data.urls : []
        urls.forEach(function (url) {
            urlList += listHtml(url);
        });
        document.getElementById('urlList').innerHTML = urlList;
    })
}

function editBtnEventListener(url, urls) {
    function editBtnClick() {
        document.getElementById("saveInput").style.display = 'inline'

        document.getElementById('timerInput').value = url.time
        document.getElementById('urlInput').value = url.url
        document.getElementById('nameInput').value = url.name
        document.getElementById('uuidInput').value = url.uuid

        document.getElementById("addBtnContainer").hidden = true
        document.getElementById("urlList").hidden = true
        document.getElementById("activeSwitchContainer").hidden = true

        document.getElementById('saveBtn').hidden = true;
        document.getElementById('saveEditBtn').hidden = false;
    }

    document.getElementById(url.uuid).getElementsByClassName('editBtn')[0]
        .removeEventListener('click', editBtnClick)
    document.getElementById(url.uuid).getElementsByClassName('editBtn')[0]
        .addEventListener("click", editBtnClick);
}

function saveEditBtnEventListener() {
    function saveEditBtnEvent() {
        editBtn();
    }

    document.getElementById('saveEditBtn')
        .removeEventListener('click', saveEditBtnEvent)
    document.getElementById('saveEditBtn')
        .addEventListener("click", saveEditBtnEvent);
}

function handleListeners() {

    switchEventListener()
    addBtnEventListener()
    cancelBtnEventListener();
    saveBtnEventListener();
    saveEditBtnEventListener();

    chrome.storage.local.get('urls', data => {
        const urls = data.urls ? data.urls : []
        for (const url of urls) {
            removeBtnEventListener(url, urls)
            editBtnEventListener(url, urls)
            moveDownEventListener(url, urls)
            moveUpEventListener(url, urls)
        }
    })
}

function cancel() {
    document.getElementById("saveInput").style.display = 'none'
    document.getElementById("addBtnContainer").hidden = false
    document.getElementById("urlList").hidden = false
    document.getElementById("activeSwitchContainer").hidden = false
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

var swapElements = function (urlId, urls, urlIndex, newUrlIndex) {
    if (urlIndex < newUrlIndex) {
        $("#" + urlId + "").insertAfter($("#" + urls[newUrlIndex].uuid + ""))
    } else {
        $("#" + urlId + "").insertBefore($("#" + urls[newUrlIndex].uuid + ""))
    }
}

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
}

function listHtml(url) {
    return "" +
        "    <ol id='" + url.uuid + "' class=\"list-group list-group-numbered ol\">\n" +
        "        <ul class=\"list-group\">\n" +
        "            <li class=\"list-group-item justify-content-between d-flex align-items-start\">\n" +
        "                <div style='width: 100px'>\n" +
        "                    <div class=\"name nameAndSeconds ms-2 me-auto fw-bold\"><strong>" + url.name + "</strong></div>\n" +
        "                    <div class=\"seconds nameAndSeconds ms-2 me-auto\">" + url.time + " Seconds</div>\n" +
        "                    <div class='urlInsideItem'>" + url.url + "</div>\n" +
        "                </div>\n" +
        "                <div>\n" +
        "                   <button class=\"editBtn btn btn-info\" type=\"button\">Editar</button>\n" +
        "                   <button class=\"removeBtn btn btn-danger\" type=\"button\">Remove</button>\n" +
        "                </div>\n" +
        "            </li>\n" +
        "            <li class=\"list-group-item d-flex justify-content-between align-items-start\">\n" +
        "                <button class=\"moveUpBtn btn btn-outline-primary\" style=\"margin: 0 15px;\" type=\"button\"><i class=\"bi bi-arrow-up-circle-fill\"></i></button>\n" +
        "                <button class=\"moveDownBtn btn btn-outline-primary\" style=\"margin: 0 15px;\" type=\"button\"><i class=\"bi bi-arrow-down-circle-fill\"></i></button>\n" +
        "            </li>\n" +
        "        </ul>\n" +
        "    </ol>"
}


function removeBtnEventListener(url, urls) {

    function removeEvent() {

        function askConfirm() {
            if (confirm("Remove this url?")) {
                const index = urls.findIndex(_url => _url.uuid === url.uuid)
                urls.splice(index, 1);
                chrome.storage.local.set({
                    urls: urls
                })
                document.getElementById(url.uuid).style.display = 'none'
            }
        }

        askConfirm();
    }

    document.getElementById(url.uuid).getElementsByClassName('removeBtn')[0]
        .removeEventListener('click', removeEvent)
    document.getElementById(url.uuid).getElementsByClassName('removeBtn')[0]
        .addEventListener("click", removeEvent);
}


function moveUpEventListener(url, urls) {

    function moveUpEvent() {
        const index = urls.findIndex(_url => _url.uuid === url.uuid)

        if (index === 0) {
            return
        }
        swapElements(url.uuid, urls, index, index - 1)
        array_move(urls, index, index - 1)

        chrome.storage.local.set({
            urls: urls
        })
    }

    document.getElementById(url.uuid).getElementsByClassName('moveUpBtn')[0]
        .removeEventListener('click', moveUpEvent)

    document.getElementById(url.uuid).getElementsByClassName('moveUpBtn')[0]
        .addEventListener("click", moveUpEvent);
}

function moveDownEventListener(url, urls) {

    function addEvent() {
        const index = urls.findIndex(_url => _url.uuid === url.uuid)
        if (index === urls.length - 1) {
            return
        }
        swapElements(url.uuid, urls, index, index + 1)
        array_move(urls, index, index + 1)

        chrome.storage.local.set({
            urls: urls
        })
    }

    document.getElementById(url.uuid).getElementsByClassName('moveDownBtn')[0]
        .removeEventListener('click', addEvent)
    document.getElementById(url.uuid).getElementsByClassName('moveDownBtn')[0]
        .addEventListener("click", addEvent);
}

function enableCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.storage.local.get('urls', urlsData => {
            const currentTab = tabs[0]
            chrome.storage.local.set({
                enabledTab: currentTab,
                currentUrl: urlsData.urls[0],
                isActivated: true
            })
            chrome.runtime.sendMessage({
                message: "enable",
            }, response => {
                if (response && response.message === 'success') {
                    console.log('background proccess started')
                }
            });
        })
    })
}

function disableRunningTab() {
    chrome.storage.local.set({
        enabledTab: null,
        isActivated: false
    })
}

function switchEventListener() {
    function switchEvent(ev) {
        updateLabel(ev.target.checked);
        if (ev.target.checked) {
            enableCurrentTab()
        } else {
            disableRunningTab();
        }
    }

    document.getElementById('activeSwitch')
        .removeEventListener('click', switchEvent)
    document.getElementById('activeSwitch')
        .addEventListener("click", switchEvent);
}

function addBtnEventListener() {
    function addBtnClick() {
        document.getElementById("saveInput").style.display = 'inline'
        document.getElementById("addBtnContainer").hidden = true
        document.getElementById("urlList").hidden = true
        document.getElementById("activeSwitchContainer").hidden = true

        document.getElementById('saveBtn').hidden = false;
        document.getElementById('saveEditBtn').hidden = true;
    }

    document.getElementById('addBtn')
        .removeEventListener('click', addBtnClick)
    document.getElementById('addBtn')
        .addEventListener("click", addBtnClick);
}

function cancelBtnEventListener() {

    function cancelBtnEventListener() {
        cancel();
    }

    document.getElementById('cancelBtn')
        .removeEventListener('click', cancelBtnEventListener)
    document.getElementById('cancelBtn')
        .addEventListener("click", cancelBtnEventListener);
}

function saveBtnEventListener() {
    function saveBtnEvent() {
        saveBtn();
    }

    document.getElementById('saveBtn')
        .removeEventListener('click', saveBtnEvent)
    document.getElementById('saveBtn')
        .addEventListener("click", saveBtnEvent);
}

function clearInputs() {
    document.getElementById('timerInput').value = 0;
    document.getElementById('urlInput').value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('uuidInput').value = ''
}

function saveBtn() {
    chrome.storage.local.get('urls', data => {
        const urls = data.urls ? data.urls : []
        const newItem = {
            time: document.getElementById('timerInput').value,
            url: document.getElementById('urlInput').value,
            name: document.getElementById('nameInput').value,
            uuid: uuidv4()
        }
        urls.push(newItem);
        chrome.storage.local.set({
            urls: urls
        })
        clearInputs()
        cancel();

        const urlList = document.getElementById('urlList');
        const newcontent = document.createElement('div');
        newcontent.innerHTML = listHtml(newItem)
        urlList.append(newcontent);
        removeBtnEventListener(newItem, urls)
        moveUpEventListener(newItem, urls)
        moveDownEventListener(newItem, urls)
        editBtnEventListener(newItem, urls)
    })
}

function editBtn() {

    chrome.storage.local.get('urls', data => {
        const urls = data.urls ? data.urls : []

        const uuidToEdit = document.getElementById('uuidInput').value

        const index = urls.findIndex(_url => _url.uuid === uuidToEdit)

        urls[index] = {
            time: document.getElementById('timerInput').value,
            url: document.getElementById('urlInput').value,
            name: document.getElementById('nameInput').value,
            uuid: document.getElementById('uuidInput').value,
        }

        chrome.storage.local.set({
            urls: urls
        })

        cancel();
        clearInputs()
        document.getElementById(uuidToEdit).getElementsByClassName('urlInsideItem')[0].innerHTML = urls[index].url;
        document.getElementById(uuidToEdit).getElementsByClassName('name')[0].innerHTML = `<strong>${urls[index].name}</strong>`
        document.getElementById(uuidToEdit).getElementsByClassName('seconds')[0].innerHTML = `${urls[index].time} Seconds`

        console.log(document.getElementById(uuidToEdit).getElementsByClassName('urlInsideItem').innerHtml)
        console.log(document.getElementById(uuidToEdit).getElementsByClassName('name').innerHtml)
        console.log(document.getElementById(uuidToEdit).getElementsByClassName('seconds').innerHtml)
    })
}
