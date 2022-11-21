/**
 * @name OTR
 */
module.exports = class OTRClass {
    // todo: When receiving a ui event be able to modify displayed data and log it to file so we can do it in future
    //    we replace the content of a message_create event if its potentially encrypted and its not ours.
    // todo: Display the current state of chats (unsupported, plaintext, encrypted) 
    //    potentially with current chat color
    //        selector to current chat document.querySelectorAll('[data-list-item-id*="channelid"]')
    //    potentially with textinput color
    //        this displays the status of the last message
    // todo: Settings pannel that is iterative and able to support per channel settings
    //    wow this is bad... atleast it only runs when you open the panel and works as intended

    cancelSendPatch() {  };
    cancelReceivePatch() {  };
    tempDefine() {  };

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
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    /**
     * Updates the color of the current text entry area within the current text channel.
     * @param {String} hue hue 
     */
    updateTextAreaColor(hue) {
        document.querySelector('[class*="channelTextArea"] > div').style.backgroundColor = "hsla(" + hue + ",54%,25%,1)";
    }

    start() {
        BdApi.showToast("OTR is starting");
        console.log("\n[OTR] Starting");

        this.patchReceiveEvent();
        this.patchSendEvent();

        this.addJSDependenciesToDOM();

        this.testForScripts();
    }
    /**
     * Replaces window['define'] and adds libraries to DOM.
     */
    addJSDependenciesToDOM() {
        console.log("[OTR] Ruining window['define]' (will fix when scripts are all loaded)");
        this.tempDefine = window['define'];
        window['define'] = undefined;

        if (typeof Salsa20 == "undefined")
            BdApi.linkJS(this.obsfucateString("salsa20js"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/salsa20.js");
        if (typeof bigintotr == "undefined")
            BdApi.linkJS(this.obsfucateString("bigintjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/bigintotr.js");
        if (typeof EventEmitter == "undefined")
            BdApi.linkJS(this.obsfucateString("eventemitterjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/eventemitter.js");
        if (typeof CryptoJS == "undefined")
            BdApi.linkJS(this.obsfucateString("cryptojs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/crypto.js");
        if (typeof OTR == "undefined")
            BdApi.linkJS(this.obsfucateString("otrjs"), "https://cdn.jsdelivr.net/gh/andandy12/Test-ENV/otr/dep/otr.js");
    }
    /**
     * Removes required libraries from DOM.
     */
    removeJSDependenciesFromDOM() {
        if (typeof Salsa20 != "undefined")
            BdApi.unlinkJS(this.obsfucateString("salsa20js"));
        if (typeof bigintotr != "undefined")
            BdApi.unlinkJS(this.obsfucateString("bigintjs"));
        if (typeof EventEmitter != "undefined")
            BdApi.unlinkJS(this.obsfucateString("eventemitterjs"));
        if (typeof CryptoJS != "undefined")
            BdApi.unlinkJS(this.obsfucateString("cryptojs"));
        if (typeof OTR != "undefined")
            BdApi.unlinkJS(this.obsfucateString("otrjs"));
    }
    /**
     * Checks if all the required libraries are loaded then repairs window['define'].
     */
    testForScripts() {
        if (typeof Salsa20 == "undefined" || typeof bigintotr == "undefined" || typeof EventEmitter == "undefined" || typeof CryptoJS == "undefined" || typeof OTR == "undefined")
            setTimeout(() => { this.testForScripts() }, 250);
        else {
            this.removeJSDependenciesFromDOM()
            console.log("[OTR] Completed JS Links");

            window['define'] = this.tempDefine;//Fix window['define'], we break this otherwise monaco will complain and the scripts wont load.
            console.log("[OTR] window['define'] is restored");
        }
    }
    /**
     * Very basic function that directs event to handlers.
     * @param {Object} evt The event that the dispatcher(previously dirtyDispatch) receives.
     */
    processDispatchEvent(evt) {
        switch (evt.type) {
            case "MESSAGE_CREATE":
                this.processMESSAGE_CREATE(evt.message);
                break;
            default:
                break;
        }
    }
    /**
     * Update a key for a plugin after performing a operation on said data.
     * @param {String} plugin The plugin name where the object is stored
     * @param {String} key The key of the object that is saved
     * @param {*} operation Ex. (data) => { data.REQUIRE_ENCRYPTION = false; return data })
     */
    updateData(plugin, key, operation) {
        let temp1 = operation(BdApi.loadData(plugin, key));
        BdApi.saveData(plugin, key, temp1);
    }

    /**
     * When passed a channel we have store we create and setup a OTR object for it.
     * @param {String} channelid A discord channel id.
     */
    pushLocalOTRToMem(channelid) {
        let data = BdApi.loadData(this.getName(), channelid);
        console.log(data);
        if (data && typeof OTR[channelid == "undefined"]) {// if we have data locally and its not in mem
            OTR[channelid] = new OTR({ "priv": DSA(data.priv), "instance_tag": data.instance_tag });

            OTR[channelid].ALLOW_V2 = data.ALLOW_V2;
            OTR[channelid].ALLOW_V3 = data.ALLOW_V3;
            OTR[channelid].REQUIRE_ENCRYPTION = data.REQUIRE_ENCRYPTION;
            OTR[channelid].SEND_WHITESPACE_TAG = data.SEND_WHITESPACE_TAG;
            OTR[channelid].WHITESPACE_START_AKE = data.WHITESPACE_START_AKE;
            OTR[channelid].ERROR_START_AKE = data.ERROR_START_AKE;
            OTR[channelid].send_interval = 333;
            OTR[channelid].fragment_size = 1900;
            OTR[channelid].CHANNEL = channelid;

            OTR[channelid].on('io', (msg) => { // this fires when we are sending
                if (!msg.includes("OTR")) {// if msg isnt encrypted
                    this.updateTextAreaColor(0);
                    console.log(OTR[channelid]);
                    if (OTR[channelid].REQUIRE_ENCRYPTION != true) {
                        this.forceSendMessage(OTR[channelid].CHANNEL, msg);
                        BdApi.showToast(`${this.getName()} Sending unencrypted message... REQUIRE_ENCRYPTION = ${OTR[channelid].REQUIRE_ENCRYPTION}`, { type: "error" });
                    } else
                        BdApi.showConfirmationModal(`${this.getName()} plugin"`, "Last message was not sent, because REQUIRE_ENCRYPTION is true in current channel.", {
                            cancelText: "Turn off",
                            confirmText: "Send Query",
                            onCancel: () => { this.updateData("OTR", "ChannelObj-ChannelId", (data) => { data.REQUIRE_ENCRYPTION = false; return data }) },
                            onConfirm: () => { OTR[channelid].sendQueryMsg() }
                        });
                } else {// msg is encrypted
                    this.updateTextAreaColor(133);
                    this.forceSendMessage(OTR[channelid].CHANNEL, msg);
                }
            });

            OTR[channelid].on('error', (error) => { // I know that OTR.ERROR_START_AKE exists but was giving bugs so here is my own bad implementation
                switch (error) {
                    case 'Received a message intended for a different session.':
                        if (OTR[channelid].msgstate != 0 && OTR[channelid].authstate == 0) { // to prevent constant bounce back and forth during invalid session
                            // we need to send a message that would result in the other client throwing same error
                            OTR[channelid].sendMsg("?OTR:AAMDG3n0Af6WUEsAAAAAAgAAAAIAAADAog7Enk3/p17aDjQVsqq/w1lRDvkIz5U5k62UdMG/VVrifYk9AgmkciYnST+Kjd2/WGSKlj/MEb0UaNton8h8j7dSRdZA845zGiw8Hj2WX1G0hoZBp19c1OcYK/pGjfYcN0TEVAbrWbs6qCTEn+8wUvs3qdwBejlBR0iVrhwsX8QF8Yo+76S6YbSCJPd5QT5BMwjo48NCQ9YPmOlyz9eoebMYfplH7HqCVUHJBiGNxpePEE8t+uyG/KVAUYgfS1WAAAAAAAAAAAEAAAFeR9DokhefIfvqg9YHHdlx6KBjtpcUPs4PS9CjxeQvNNezFEC+2hhDAQhr6INUUnvM+OZOj+nmG+ai36nSDd2/z3p895CWaPVkCyuSHG8OeZAEMBwaNrjMJv6RoZ5VbuZ/8MOuG8fdNq3j7M2XgNWrxRY8ODdDgDZc+SXfygaQcgwdYLt0tMc5h6/NPnu45pm9yL2LGSMpn6fIz115T5iwIwSs40zJT+dDzeZOdrBrVQD8kt8HjgqlQWO+7WqJ6y/e0pwc9IywrN86rwjZdTvoNCpqv4PoZzV34v4KU8O+hlni9mPdg66QMdDyFbbrCLxvPZJKADRzuaDTQauxXAPbGKu0TApl77xR4Gzhr+Jp7TYoorXkQ1E2FO0ACdgIjihHWs6MgWSVeivf9kg6fkbShVE0PPylVunHxFHoTSfM9NQnj0W1/niSMk6bC1HLGCf3gBk4xsZxecAFzm6sqZttmKfkHVymz27+76qiW3lCVwBi1QAAAAA=.");
                            // we need the other client to be ready to do a ake
                            OTR[channelid].their_instance_tag = "\u0000\u0000\u0000\u0000";
                            OTR[channelid].their_keyid = 0; OTR[channelid].their_old_y = null;
                            OTR[channelid].their_priv_pk = null; OTR[channelid].their_y = null;
                            OTR[channelid].msgstate = 0; OTR[channelid].authstate = 0;
                            BdApi.showToast(`${this.getName(), error}`, { type: "error" });
                        } else {
                            OTR[channelid].sendQueryMsg();
                        }
                        break;
                    case "Not ready to encrypt.":
                        BdApi.showToast(`${this.getName()} last message did not send: ${error}`, { type: "error" });
                        break;
                    default:
                        BdApi.showToast(`${this.getName(), error}`, { type: "error" });
                        break;
                }

            });
        }
    }
    /**
     * When receiving a message we either modify or leave it alone.
     * @param {Object} message A discord message object
     */
    processMESSAGE_CREATE(message) {
        //console.log("[OTR] processing message", message);

        if (message.author.id != this.currentUser.id) {

            if (typeof OTR[message.channel_id] != "undefined") { // if the channels otr is defined
                if (typeof OTR[message.channel_id]._getEvents().ui == "undefined") {// if we dont have the ui event defined we want to define it (this has to be here so we can modify what the client receives)
                    OTR[message.channel_id].on('ui', (msg) => {  // received message fired
                        if (OTR[message.channel_id].authstate != 0 || OTR[message.channel_id].msgstate != 1 || msg.includes("?OTRv")) { // if auth hasnt completed or if msg is querymsg
                            // channel isnt secure
                            if (msg.includes("OTR:")) // if msg potentially encrypted
                                console.log("[OTR] Received potentially encrypted message over insecure channel", msg);
                            else
                                console.log("[OTR] Received plaintext msg on insecure channel", msg);
                        } else {
                            // channel is secure?
                            if (msg.includes("OTR:")) { // msg is potentially encrypted
                                console.log("[OTR] Received encrypted msg to over secure channel, replace msg if we come across it", msg);
                                message.content = msg;
                                //make to sure to replace original content with msg when we come across it
                            } else
                                console.log("[OTR] Recieved Unencrypted msg under secure channel", msg);
                        }
                    })
                }
                console.log(`[OTR] OTR object ${message.channel_id} is receiving ${message.content}`);
                OTR[message.channel_id].receiveMsg(message.content);
            } else {
                this.pushLocalOTRToMem(message.channel_id);
            }
        }
    }

    /**
     * Create then write a OTR object to memory.
     * @param {String} channelid The channel to store.
     */
    storeLocalOTR(channelid) {
        if (BdApi.getData(this.getName(), channelid) == undefined) {
            BdApi.saveData(this.getName(), channelid, {
                "priv": new DSA(), "ALLOW_V2": false, "instance_tag": OTR.makeInstanceTag(),
                "ALLOW_V3": true, "REQUIRE_ENCRYPTION": false, "SEND_WHITESPACE_TAG": false,
                "WHITESPACE_START_AKE": true, "ERROR_START_AKE": false,
            });
        }
    }
    /**
     * Patches _dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE[4] so we can intercept messages sent/received.
     */
    patchReceiveEvent() {
        // patching dispatch.events.MESSAGE_CREATE does not call the functions
        // but patching _dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE works on some functions
        // however in testing with logpoints we can see that flux complains about a slow dispatch
        // everytime you send a message All MESSAGE_CREATE functions are called three times (hitting enter, text going grey, text going white)... no idea what grey and white mean
        // the below lists are not complete as I did not want to include events that would get spammed
        // the ones that fire on MESSAGE_CREATE are 1,4,5,6,7,8,9,10,11,13,15,16,17,19,20,21,22
        // the ones that fire on MESSAGE_ACK are 17,20
        // the ones that fire on MESSAGE_UPDATE are 1,9
        // the ones that fire on MESSAGE_DELETE are 17

        // 9-14-2022 it has come to my attention that the way discord dispatch works has changed completely
        if (typeof BdApi.findModuleByProps("_dispatcher")._dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE != "undefined") {
            console.log("[OTR] Patching _dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE[4].actionHandler()");
            this.cancelReceivePatch = BdApi.monkeyPatch(BdApi.findModuleByProps("_dispatcher")._dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE[4], "actionHandler", {
                "before": (e) => {
                    this.processDispatchEvent(e.methodArguments[0]);
                }
            });
        } else {
            BdApi.showConfirmationModal(`${"OTR"} plugin`, "In order to patch the required MESSAGE_CREATE event you need to send/receive a message.",
                {
                    cancelText: "Disable Addon", onCancel: () => { BdApi.Plugins.disable("OTR") }, onConfirm: () => {
                        setTimeout(() => this.patchReceiveEvent(), 10000);
                    }
                });
        }
    }
    /**
     * Patches sendMessage so we can intercept messages sent.
     */
    patchSendEvent() {
        console.log("[OTR] Patching sendMessage()");
        this.cancelSendPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("sendMessage"), "sendMessage", {
            instead: (a) => {
                if (typeof OTR[a.methodArguments[0]] != "undefined") // if we have a object for the channel we are sending to 
                    OTR[a.methodArguments[0]].sendMsg(a.methodArguments[1].content);
                else {
                    console.log(`[OTR] Sending plaintext to channel ${a.methodArguments[0]}: ${a.methodArguments[1].content} `);
                    this.forceSendMessage(a.methodArguments[0], a.methodArguments[1].content);
                }
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
        console.log("[OTR] Unpatching sendMessage()");
        this.cancelSendPatch();
        console.log("[OTR] Unpatching _dispatcher._actionHandlers._orderedActionHandlers.MESSAGE_CREATE[4].actionHandler()");
        this.cancelReceivePatch();

        console.log("[OTR] Stopped");
        BdApi.showToast("[OTR] Stopped");
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
            if (typeof data != "undefined") {  // we check if we have a stored object for that channel
                // we want to 
                template += `
                <div >
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
     * Appends a button to the last message sent in a channel.
     * @param {String} currchannel 
     */
    addOTRDeletionButton(currchannel) {
        document.querySelector('[class*=scrollerInner-]').lastElementChild.previousElementSibling.innerHTML += `<button style="margin-left:20px" onclick="BdApi.showConfirmationModal(\'${this.getName()}\'+ ' plugin','Do you want to permenantly delete the local OTR for this channel? (This will permenantly stop it from working)',{
            'cancelText':'no',
            'confirmText':'yes',
            'onConfirm':()=>{
                BdApi.deleteData(\'${this.getName()}\',\'${currchannel}\');
                BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRAllowButton(\'${currchannel}\');
                document.querySelectorAll(\`[onclick*='Do you want to permenantly delete the local OTR for this channel?']\`).forEach((e)=>e.remove());
                document.querySelectorAll(\`[onclick*='sendQueryMsg()']\`).forEach((e)=>e.remove());
                OTR[\'${currchannel}\'] = undefined;
            }})"><p style="margin:5px">Delete OTR</p></button>`
    }

    /**
     * Appends a button to the last message sent in a channel.
     * @param {String} currchannel 
     */
    addOTRAllowButton(currchannel) {
        document.querySelector('[class*=scrollerInner-]').lastElementChild.previousElementSibling.innerHTML += `<button style="margin-left:20px" onclick="BdApi.showConfirmationModal(\'${this.getName()}\'+ ' plugin','Do you want to turn on OTR in the current channel?',{
            'cancelText':'no',
            'confirmText':'yes',
            'onConfirm':()=>{
                BdApi.Plugins.get(\'${this.getName()}\').instance.storeLocalOTR(\'${currchannel}\');
                BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRDeletionButton(\'${currchannel}\');
                BdApi.Plugins.get(\'${this.getName()}\').instance.addOTRSendQueryMsgButton(\'${currchannel}\');
                BdApi.Plugins.get(\'${this.getName()}\').instance.pushLocalOTRToMem(\'${currchannel}\');
                document.querySelectorAll(\`[onclick*='Do you want to turn on OTR in the current channel?']\`).forEach((e)=>e.remove());
                
            }})"><p style="margin:5px">Create OTR</p></button>`
    }

    /**
     * Appends a button to the last message sent in a channel.
     * @param {String} currchannel 
     */
    addOTRSendQueryMsgButton(currchannel) {
        document.querySelector('[class*=scrollerInner-]').lastElementChild.previousElementSibling.innerHTML += `<button style="margin-left:20px" onclick="OTR[\'${currchannel}\'].sendQueryMsg();this.remove();"><p style="margin:5px">Send Query Message</p></button>`;
    }

    onSwitch() {
        if (document.location.href.includes("@me/")) { // we are in a dm (could be group still)
            if (document.querySelectorAll(`[class*="membersWrap"]`).length == 0) { // we are not in a group and could do otr in here
                let currchannel = document.location.href.split("@me/")[1];
                let currchanneldata = BdApi.loadData("OTR", currchannel);
                if (!currchanneldata) { // if we dont have data for the current channel
                    console.log("[OTR] No stored object for current channel");
                    this.addOTRAllowButton(currchannel);
                } else {
                    console.log("[OTR] Found stored object for current channel");
                    this.addOTRDeletionButton(currchannel);
                    if (typeof OTR[currchannel] != "undefined") {// if we have the OTR object stored in mem we want to allow the user to
                        if (OTR[currchannel].msgstate == 0 || OTR[currchannel].authstate != 0) // if we havent authed or completed it
                            this.addOTRSendQueryMsgButton(currchannel);
                    } else {
                        console.log("[OTR] pushing local object to mem");
                        this.pushLocalOTRToMem(currchannel);
                    }
                }
            }
        }
    }
}
