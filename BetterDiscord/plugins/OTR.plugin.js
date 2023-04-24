/**
 * @name OTR
 */
module.exports = class OTRClass {
    // todo: When receiving a ui event be able to modify displayed data and log it to file so we can do it in future
    //    we replace the content of a message_create event if its potentially encrypted and its not ours.
    // todo: Display the current state of chats (unsupported, plaintext, encrypted) 
    //    potentially with current chat color
    //        selector to current chat document.querySelectorAll('[data-list-item-id*="channelId"]')
    //    potentially with textinput color
    //        this displays the status of the last message
    // todo: Settings pannel that is iterative and able to support per channel settings
    //    wow this is bad... atleast it only runs when you open the panel and works as intended

    cancelSendPatch() {  };
    cancelReceivePatch() {  };
    cancelloadCompletePatch() {  };
    tempDefine() {  };
    messageMap = [];
    currentUser = BdApi.findModuleByProps("getCurrentUser").getCurrentUser();
    randhex = Math.random().toString(16).substr(2);
    /**
     * Obsfucates strings so that we can use them in DOM or other locations.
     * @param {*} str 
     * @returns The obsfucated string
     */
    obsfucateString(str) { return this.randhex + str; }; // was doing a sha1 hash originally but stopped 

    getName() { return "OTR"; };
    getDescription() { return "This is my OTR implementation its probably not safe."; };
    getVersion() { return "0.0.6"; };
    getAuthor() { return "andandy12"; };

    logToConsole(){console.log(`[${this.getName()}]\t`,...arguments);};
    showToast(){
        arguments[0] = `${this.getName()} ${arguments[0]}`;
        this.logToConsole(...arguments);
        BdApi.showToast(...arguments);
    };

    /**
     * Updates the color of the current text entry area within the current text channel.
     * @param {String} hue hue 
     */
    updateTextAreaColor(hue) {
        document.querySelector('[class*="channelTextArea"] > div').style.backgroundColor = "hsla(" + hue + ",54%,25%,1)";
    }

    start() {
        this.showToast("is starting");
        this.logToConsole("Starting");

        this.patchReceiveEvent();
        this.patchSendEvent();
        this.patchLoadComplete(); 

        this.addJSDependenciesToDOM();

        this.testForScripts();
    }
    /**
     * Replaces window['define'] and adds libraries to DOM.
     */
    addJSDependenciesToDOM() {
        this.logToConsole("Ruining window['define]' (will fix when scripts are all loaded)");
        this.tempDefine = window['define'];
        window['define'] = undefined;

        if (typeof Salsa20 == 'undefined')
            BdApi.linkJS(this.obsfucateString("salsa20js"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/salsa20.js");
        if (typeof bigintotr == 'undefined')
            BdApi.linkJS(this.obsfucateString("bigintjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/bigintotr.js");
        if (typeof EventEmitter == 'undefined')
            BdApi.linkJS(this.obsfucateString("eventemitterjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/eventemitter.js");
        if (typeof CryptoJS == 'undefined')
            BdApi.linkJS(this.obsfucateString("cryptojs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/crypto.js");
        if (typeof OTR == 'undefined')
            BdApi.linkJS(this.obsfucateString("otrjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/otr.js");
    }
    /**
     * Removes required libraries from DOM.
     */
    removeJSDependenciesFromDOM() {
        if (typeof Salsa20 != 'undefined')
            BdApi.unlinkJS(this.obsfucateString("salsa20js"));
        if (typeof bigintotr != 'undefined')
            BdApi.unlinkJS(this.obsfucateString("bigintjs"));
        if (typeof EventEmitter != 'undefined')
            BdApi.unlinkJS(this.obsfucateString("eventemitterjs"));
        if (typeof CryptoJS != 'undefined')
            BdApi.unlinkJS(this.obsfucateString("cryptojs"));
        if (typeof OTR != 'undefined')
            BdApi.unlinkJS(this.obsfucateString("otrjs"));
    }
    /**
     * Checks if all the required libraries are loaded then repairs window['define'].
     */
    testForScripts() {
        if (typeof Salsa20 == 'undefined' || typeof bigintotr == 'undefined' || typeof EventEmitter == 'undefined' || typeof CryptoJS == 'undefined' || typeof OTR == 'undefined')
            setTimeout(() => { this.testForScripts() }, 250);
        else {
            this.removeJSDependenciesFromDOM()
            this.logToConsole("Completed JS Links");

            window['define'] = this.tempDefine;//Fix window['define'], we break this otherwise monaco will complain and the scripts wont load.
            this.logToConsole("window['define'] is restored");
        }
    }
    /**
     * Update a key for a plugin after performing a operation on the data.
     * @param {String} plugin The plugin name where the object is stored
     * @param {String} key The key of the object that is saved
     * @param {*} operation Ex. (data) => { data.REQUIRE_ENCRYPTION = false; return data })
     */
    updateData(plugin, key, operation) {
        let temp1 = operation(BdApi.loadData(plugin, key));
        BdApi.saveData(plugin, key, temp1);
    }
    /**
     * Create then write a OTR object to memory.
     * @param {String} channelId The channel to store.
     */
    storeLocalOTR(channelId) {
        this.logToConsole("storeLocalOTR",channelId);
        BdApi.saveData(this.getName(), channelId, {
            "priv": new DSA(), "ALLOW_V2": false, "instance_tag": OTR.makeInstanceTag(),
            "ALLOW_V3": true, "REQUIRE_ENCRYPTION": false, "SEND_WHITESPACE_TAG": false,
            "WHITESPACE_START_AKE": true, "ERROR_START_AKE": false,
        });
    }

    /**
     * When passed a channel we have store we create and setup a OTR object for it.
     * @param {String} channelId A discord channel id.
     */
    pushLocalOTRToMem(channelId) {
        let data = BdApi.loadData(this.getName(), channelId);
        this.logToConsole("pushLocalOTRToMem",data);
        if (data) {// if we have data locally
            OTR[channelId] = new OTR({ "priv": DSA(data.priv), "instance_tag": data.instance_tag });

            OTR[channelId].ALLOW_V2 = data.ALLOW_V2;
            OTR[channelId].ALLOW_V3 = data.ALLOW_V3;
            OTR[channelId].REQUIRE_ENCRYPTION = data.REQUIRE_ENCRYPTION;
            OTR[channelId].SEND_WHITESPACE_TAG = data.SEND_WHITESPACE_TAG;
            OTR[channelId].WHITESPACE_START_AKE = data.WHITESPACE_START_AKE;
            OTR[channelId].ERROR_START_AKE = data.ERROR_START_AKE;
            OTR[channelId].send_interval = 333;
            OTR[channelId].fragment_size = 1900;
            OTR[channelId].CHANNEL = channelId;

            OTR[channelId].on('io', (msg) => { // this fires when we are sending
                this.logToConsole("io event",msg,channelId);
                if (OTR[channelId].msgstate == OTR.CONST.MSGSTATE_PLAINTEXT && OTR[channelId].passThroughQuery === undefined) {// if msg isnt encrypted
                    this.updateTextAreaColor(0);
                    this.logToConsole(OTR[channelId]);
                    if (OTR[channelId].REQUIRE_ENCRYPTION != true) {
                        this.forceSendMessage(OTR[channelId].CHANNEL, msg);
                        this.showToast(`Sending unencrypted message... REQUIRE_ENCRYPTION = ${OTR[channelId].REQUIRE_ENCRYPTION}`, { type: "error" });
                    } else{
                        BdApi.showConfirmationModal(`${this.getName()} plugin"`, "Last message was not sent, because REQUIRE_ENCRYPTION is true in current channel.", {
                            cancelText: "Turn off",
                            confirmText: "Send Query",
                            onCancel: () => { 
                                this.updateData("OTR", channelId, (data) => { data.REQUIRE_ENCRYPTION = false; return data });
                                this.pushLocalOTRToMem(channelId);
                            },
                            onConfirm: () => {
                                OTR[channelId].sendQueryMsg();
                                OTR[channelId].passThroughQuery = true;
                            }
                        });
                    }
                } else {// msg is encrypted
                    this.updateTextAreaColor(133);
                    this.forceSendMessage(OTR[channelId].CHANNEL, msg);
                }
                if(OTR[channelId].passThroughQuery)
                    delete OTR[channelId].passThroughQuery;
                
            });

            OTR[channelId].on('error', (error) => { // I know that OTR.ERROR_START_AKE exists but was giving bugs so here is my own bad implementation
                switch (error) {
                    case 'Received a message intended for a different session.':
                        this.showToast(`: ${error}\nRecreating OTR and sending query message.`, { type: "error" });
                        this.reinitOTRSession(channelId);
                        OTR[channelId].sendQueryMsg();
                        break;
                    case "Not ready to encrypt.":
                        this.showToast(`last message did not send: ${error}`, { type: "error" });
                        break;
                    default:
                        this.showToast(`${error}`, { type: "error" });
                        break;
                }
            });

            OTR[channelId].on('ui', (msg,encrypted,meta) => {  // received message fired
                this.logToConsole("ui event",msg,encrypted,meta);
                if(encrypted){
                    // we will place the new content in the messageMap
                    this.messageMap[meta.id] = msg;
                    this.updateMessageCache(meta.channel_id,meta.id,msg);
                }
            });
        }
    }

    /**
     * Fires when something wrong has occured (wrong session or target wants to reinit).
     * Essentially purges that data saved on disk and memory for the targets session.
     * @param {String} channelId 
     */
     reinitOTRSession(channelId){
        this.logToConsole(`Reinit OTR session ${channelId}`);
        BdApi.deleteData(this.getName(),channelId);
        OTR[channelId] = undefined;
        this.storeLocalOTR(channelId);
        this.pushLocalOTRToMem(channelId);
    }

    /**
     * This will query the message and replace innerText for that element.
     * @param {String} channelId 
     * @param {String} messageId 
     */
    rerenderMessage(channelId,messageId){
        let newMessageContent = BdApi.Plugins.get("OTR").instance.getmodule._channelMessages[channelId]._map[messageId].content;
        let messageelem = document.querySelector(`#message-content-${messageId}`);
        if(messageelem?.innerText != undefined)
            messageelem.innerText = newMessageContent;
    }

    /**
     * We update the message cache with the selected content.
     * @param {String} channelId 
     * @param {String} messageId 
     * @param {String} content 
     */
    updateMessageCache(channelId,messageId,content){
        setTimeout(() => {
            //this.logToConsole("updateMessageCache pre",channelId,messageId,content);
            if(BdApi.Plugins.get("OTR").instance.getmodule?._channelMessages[channelId]?._map[messageId] != undefined){
                //this.logToConsole("updateMessageCache mid",channelId,messageId,content);
                BdApi.Plugins.get("OTR").instance.getmodule._channelMessages[channelId]._map[messageId].content = content;
                this.rerenderMessage(channelId,messageId);
            }
        }, 250);
    }

    /**
     * When receiving a message we either modify or leave it alone.
     * @param {Object} message A discord message object
     */
    processMESSAGE_CREATE(message) {
        this.logToConsole("processMESSAGE_CREATE", message);

        if (message.author.id != this.currentUser.id) {

            if (OTR[message.channel_id] != undefined) { // if the channels otr is defined
                // if the message is an init message we should reset the OTR
                if(message.content.startsWith("?OTRv")){
                    this.logToConsole("Received query message... initing new object ");
                    this.reinitOTRSession(message.channel_id);
                }
                this.logToConsole(`OTR object ${message.channel_id} is receiving ${message.content}`);
                OTR[message.channel_id].receiveMsg(message.content,message);
            } else {
                this.pushLocalOTRToMem(message.channel_id);
            }
        } else {
            if(message.state != "SENDING" && OTR[message.channel_id] != undefined && OTR[message.channel_id]?.msgstate != OTR.CONST.MSGSTATE_PLAINTEXT && OTR[message.channel_id]?.authstate == OTR.CONST.AUTHSTATE_NONE && OTR[message.channel_id]?.lastMessage != undefined){
                this.messageMap[message.id] = OTR[message.channel_id].lastMessage;
                this.updateMessageCache(message.channel_id,message.id,OTR[message.channel_id].lastMessage);
                OTR[message.channel_id].lastMessage = undefined;
            }
        }
    }

    /**
     * Patches _dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE[4] so we can intercept messages sent/received.
     */
    patchReceiveEvent() {
        if (this.getmodule === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if ((m.exports?.[elem]?.get != undefined) && (m.exports?.[elem]?.hasPresent != undefined)&& (m.exports?.[elem]?._channelMessages != undefined)) {
                                this.getmodule = m.exports?.[elem];
                            }
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }])
        }

        this.logToConsole("Patching receiveMessage()");
        this.cancelReceivePatch = BdApi.monkeyPatch(BdApi.findModuleByPrototypes("receiveMessage").prototype, "receiveMessage", {
            "before": (e) => {
                this.processMESSAGE_CREATE(e.methodArguments[0]);
            }
        });
    }
    /**
     * Patches sendMessage so we can intercept messages sent.
     */
    patchSendEvent() {
        this.logToConsole("Patching sendMessage()");
        this.cancelSendPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("sendMessage"), "sendMessage", {
            instead: (a) => {
                this.logToConsole("sendMessage()",a);
                if (OTR[a.methodArguments[0]] != undefined){ // if we have a object for the channel we are sending to 
                    OTR[a.methodArguments[0]].sendMsg(a.methodArguments[1].content);
                    OTR[a.methodArguments[0]].lastMessage = a.methodArguments[1].content;
                }
                else {
                    this.logToConsole(`Sending plaintext to channel ${a.methodArguments[0]}: ${a.methodArguments[1].content} `);
                    this.forceSendMessage(a.methodArguments[0], a.methodArguments[1].content);
                }
            }
        });
    }
    /**
     * Patches loadComplete as to intercept message loaded in bulk such as previous messages.
     */
    patchLoadComplete() {
        this.logToConsole("Patching loadComplete()");
        this.cancelloadCompletePatch = BdApi.monkeyPatch(BdApi.findModuleByPrototypes("loadComplete").prototype, "loadComplete", {
            before: (a) => {
                let messages = a.methodArguments[0].newMessages;
                this.logToConsole("loadComplete() pre",a);
                this.logToConsole("loadComplete() pre",this.messageMap);
                if(typeof this.messageMap == 'object'){
                    for (const messageID in this.messageMap) {
                        let index = messages.findIndex(e=>e.id == messageID)
                        if(index != -1){
                            this.logToConsole("loadComplete() mid",index,messages[index]);
                            messages[index].content = this.messageMap[messageID];
                        }
                    }
                }
                this.logToConsole("loadComplete() post",a);
            }
        });
    }

    /**
     * Calls the function that sendMessage() originally calls with some predefined args.
     */
    forceSendMessage(channel, message) {
        BdApi.findModuleByProps("sendMessage")._sendMessage(channel, { "content": message, "tts": false, "invalidEmojis": [], "validNonShortcutEmojis": [] }, {});
    }

    stop() {
        this.logToConsole("Unpatching sendMessage()");
        this.cancelSendPatch();
        this.logToConsole("Unpatching receiveMessage()");
        this.cancelReceivePatch();
        this.logToConsole("Unpatching loadComplete()");
        this.cancelloadCompletePatch();

        this.logToConsole("Stopped");
        this.showToast("Stopped");
    }

    getSettingsPanel() {// I fully understand that this is so bad but it works for now so...
        let template = document.createElement("template");
        template = "<p style='color:aliceblue'>This plugin is in very early development... I would not trust it to keep you safe</br>TODO: Display when disconnect received, Implement: SMP, ESK</p>";
        let temp2 = document.createElement("temp2");
        temp2 = `<td> 
                    <label class="${this.obsfucateString("switch")}" onchange="
                        let channel = this.parentElement.parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerText;
                        let settingname = this.parentElement.previousElementSibling.innerText;
                        let settingval = this.children[0].checked;
                        BdApi.Plugins.get(\'${this.getName()}\').instance.updateData(\'${this.getName()}\',channel,(data) => \{data[settingname] = settingval;return data\});
                        BdApi.Plugins.get(\'${this.getName()}\').instance.pushLocalOTRToMem(channel);">
                        <input class="${this.obsfucateString("checkbox")}" type="checkbox">
                    </label>
                </td>`;
        document.querySelectorAll(`[data-list-item-id*= private-channels]`).forEach((e) => { // for all elements in the current dm list
            let data = BdApi.getData("OTR", e.getAttribute("data-list-item-id").split("___")[1]);
            if (data != undefined) {  // we check if we have a stored object for that channel
                // we want to 
                template += `
                <div>
                <p onclick="this.nextElementSibling.style.display=(this.nextElementSibling.style.display == 'block')?'none':'block'" onmouseover="this.nextElementSibling.querySelectorAll(\`[class = \'${this.obsfucateString("checkbox")}\']\`).forEach((e)=>e.checked = BdApi.getData(\'${this.getName()}\',e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerText)[e.parentElement.parentElement.previousElementSibling.innerText])" style="background-color:rgb(0 0 0 / 20%);color:aliceblue;padding:5px">${e.getAttribute("data-list-item-id").split("___")[1]}</p>
                <div style="padding-left: 15px; display:none" >
                <table style="color:aliceblue">
                <tr>
                <td>ALLOW_V2</td>${temp2}
                <td>ALLOW_V3</td>${temp2}
                <td onmouseover="this.innerText+=' '+BdApi.getData(\'${this.getName()}\', this.parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerText).instance_tag" onmouseout="this.innerText = 'Instance Tag'">Instance Tag</td>
                </tr><tr>
                <td>REQUIRE_ENCRYPTION</td>${temp2}
                <td>ERROR_START_AKE</td>${temp2}
                </tr><tr>
                <td>SEND_WHITESPACE_TAG</td>${temp2}
                <td>WHITESPACE_START_AKE</td>${temp2}
                </tr>
                </table></div>
                </div>`;
            }
        });
        if (template.toString().length >= 176)
            template += "<p style='color:aliceblue'>You must allow the plugin to receive over a channel to see settings.</p>";
        return template;
    }
    /**
     * Appends a button to the channel header. This button will delete the current OTR instance.
     * @param {String} currchannel 
     */
    addOTRDeletionButton(currchannel) {
        if(document.querySelector('[aria-label="Channel header"] [class*=children] [onclick*="Do you want to permenantly delete the local OTR for this channel?"]') === null){
            let htmlstring = `<button style="margin-left:5px" onclick="BdApi.showConfirmationModal(\'${this.getName()}\'+ ' plugin','Do you want to permenantly delete the local OTR for this channel? (This will permenantly stop it from working)',{
                'cancelText':'no',
                'confirmText':'yes',
                'onConfirm':()=>{
                    OTR['${currchannel}']?.endOtr();
                    BdApi.deleteData(\'${this.getName()}\',\'${currchannel}\');
                    BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRCreateButton(\'${currchannel}\');
                    BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRCreateButton(\'${currchannel}\');
                    document.querySelectorAll(\`[onclick*='Do you want to permenantly delete the local OTR for this channel?']\`).forEach((e)=>e.remove());
                    document.querySelectorAll(\`[onclick*='sendQueryMsg()']\`).forEach((e)=>e.remove());
                    OTR[\'${currchannel}\'] = undefined;
                }})"><p style="margin:5px">Delete OTR</p></button>`;
            document.querySelector('[aria-label="Channel header"] [class*=children]').insertAdjacentHTML("beforeend",htmlstring);
        }
    }

    /**
     * Appends a button to the channel header. This button will create an OTR instance.
     * @param {String} currchannel 
     */
    addOTRCreateButton(currchannel) {
        if(document.querySelector('[aria-label="Channel header"] [class*=children] [onclick*="Do you want to turn on OTR in the current channel?"]') === null){
            let htmlstring =`<button style="margin-left:5px" onclick="BdApi.showConfirmationModal(\'${this.getName()}\'+ ' plugin','Do you want to turn on OTR in the current channel?',{
                'cancelText':'no',
                'confirmText':'yes',
                'onConfirm':()=>{
                    BdApi.Plugins.get(\'${this.getName()}\').instance.storeLocalOTR(\'${currchannel}\');
                    BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRDeletionButton(\'${currchannel}\');
                    BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRSendQueryMsgButton(\'${currchannel}\');
                    BdApi.Plugins.get(\'${this.getName()}\').instance.pushLocalOTRToMem(\'${currchannel}\');
                    document.querySelectorAll(\`[onclick*='Do you want to turn on OTR in the current channel?']\`).forEach((e)=>e.remove());
                    
                }})"><p style="margin:5px">Create OTR</p></button>`;
            document.querySelector('[aria-label="Channel header"] [class*=children]').insertAdjacentHTML("beforeend",htmlstring);
        }
    }

    /**
     * Appends a button to the channel header. This button will send a query message in the current channel.
     * @param {String} currchannel 
     */
    addOTRSendQueryMsgButton(currchannel) {
        if(document.querySelector(`[aria-label="Channel header"] [class*=children] [onclick*="OTR[\'${currchannel}\'].sendQueryMsg()"]`) === null){
            let htmlstring = `<button style="margin-left:5px" onclick="OTR[\'${currchannel}\'].sendQueryMsg();"><p style="margin:5px">Send Query Message</p></button>`;
            document.querySelector('[aria-label="Channel header"] [class*=children]').insertAdjacentHTML("beforeend",htmlstring);
        }
    }

    onSwitch() {
        if (document.location.href.includes("@me/")) { // we are in a dm (could be group still)
            if (document.querySelectorAll(`[class*="membersWrap"]`).length == 0) { // we are not in a group and could do otr in here
                let currchannel = document.location.href.split("@me/")[1];
                let currchanneldata = BdApi.loadData("OTR", currchannel);
                if (!currchanneldata) { // if we dont have data for the current channel
                    this.logToConsole("No stored object for current channel");
                    this.addOTRCreateButton(currchannel);
                } else {
                    this.logToConsole("Found stored object for current channel");
                    this.addOTRDeletionButton(currchannel);
                    if (OTR[currchannel] != undefined) {// if we have the OTR object stored in mem we want to allow the user to
                        if (OTR[currchannel].msgstate == OTR.CONST.MSGSTATE_PLAINTEXT || OTR[currchannel].authstate != OTR.CONST.AUTHSTATE_NONE) // if we havent authed or completed it
                            this.addOTRSendQueryMsgButton(currchannel);
                    } else {
                        this.logToConsole("pushing local object to mem");
                        this.pushLocalOTRToMem(currchannel);
                    }
                }
            }
        }
    }
}
