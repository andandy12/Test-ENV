/**
 * @name CustomStreamSettings
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/CustomStreamSettings.plugin.js
 * @description More control over screensharing.
 * @version 0.0.13
 */
module.exports = class StreamSettings {
    getName() { return "CustomStreamSettings"; };
    getDescription() { return "More control over screensharing."; };
    getVersion() { return "0.0.13"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.UI.showToast("CustomStreamSettings is starting");
        console.log("\n[CustomStreamSettings] Starting");

        if (BdApi.Data.load(this.getName(), "preview")?.overrideWithDataBlank === undefined) {
            BdApi.Data.save(this.getName(), "frameRate", 30);
            BdApi.Data.save(this.getName(), "preview", { "forceDisabled": true, "overrideFile": false, "overrideWithData": "data:image/jpeg;base64,", "overrideWithDataBlank": "data:image/jpeg;base64," });
            BdApi.Data.save(this.getName(), "resolution", screen.height);
        }
        this.patchsetDesktopSource();
        this.patchStreamPreview();
        // everything below is bypasses I previously had in old plugins
        this.patchForEmojis();
        this.patchVerificationCriteria();
        this.patchGuildPermission();
        this.patchSpotifyPrem();
        this.setupMainScreenShareZoomInterval();
    }

    modules = undefined;
    populateModules = () => {
        window.webpackChunkdiscord_app.push([[Symbol()], {}, r => this.modules = r]);
    }
    getModules = () => {
        this.populateModules();
        return this.modules.c;
    }
    findModules = (cond) => {
        return Object.values(this.getModules()).filter(m => cond(m) == true);
    }

    moduleDepth1 = (cond) => {
        return this.findModules((m) => {
            try {
                return m?.exports != undefined && Object.entries(m.exports).find(e => cond(e)) != undefined
            } catch (e) { return false; }
        });
    }

    patchsetDesktopSource = () => {
        if (this.mediaEngine === undefined) {
            this.moduleDepth1((e)=>e[1]?.getMediaEngine != undefined && (this.mediaEngine = e[1].getMediaEngine()))
        }

        // 7-22-23 Discord retired the old function and is now using setGoLiveSource
        // BdApi.Patcher.before(this.getName(), this.mediaEngine, "setDesktopSource", (_, args, ret) => {
        //     if (args[0]?.id == undefined)
        //         return;
        //     args[0]["frameRate"] = parseInt(BdApi.Data.load(this.getName(), "frameRate")) || 1; // if this is a string it will work only in the metadata
        //     args[0]["resolution"] = parseInt(BdApi.Data.load(this.getName(), "resolution")) || screen.height;
        // })

        BdApi.Patcher.before(this.getName(), this.mediaEngine, "setGoLiveSource", (_, args, ret) => {
        //console.log("[CustomStreamSettings] setGoLiveSource args", args);
        if (args[0]["desktopDescription"]?.["id"] == undefined)
            return;
        args[0]["desktopDescription"]["hdrCaptureMode"] = "always";
        args[0]["quality"]["frameRate"] = parseInt(BdApi.Data.load(this.getName(), "frameRate")) || 1; // if this is a string it will work only in the metadata
        args[0]["quality"]["resolution"] = parseInt(BdApi.Data.load(this.getName(), "resolution")) || screen.height;
    })

    }

    setupMainScreenShareZoomInterval = () => {

        this.zoomInterval = setInterval(()=>{
            document.querySelectorAll('[class*=videoFrame]:not(.zoomScroll)').forEach((element)=>{
                var scale = 1;
                var factor = 0.05;
                var max_scale = 4;
                divMain = element;
                divMain.classList += " zoomScroll";
                divMain.addEventListener('wheel', (e) => {
                    if (!e.ctrlKey) {
                        return;
                    }
                
                    e.preventDefault();
                    var delta = e.delta || e.wheelDelta;
                    if (delta === undefined) {
                        //we are on firefox
                        delta = e.originalEvent.detail;
                    }
                    delta = Math.max(-1,Math.min(1,delta)); // cap the delta to [-1,1] for cross browser consistency
                
                    var offset = {x: divMain.scrollLeft, y: divMain.scrollTop};
                    var image_loc = {
                        x: e.pageX + offset.x,
                        y: e.pageY + offset.y
                    };
                
                    var zoom_point = {x:image_loc.x/scale, y: image_loc.y/scale};
                
                    // apply zoom
                    scale += delta*factor * scale;
                    scale = Math.max(1,Math.min(max_scale,scale));
                
                    var zoom_point_new = {x:zoom_point.x * scale, y: zoom_point.y * scale};
                
                    var newScroll = {
                        x: zoom_point_new.x - e.pageX,
                        y: zoom_point_new.y - e.pageY
                    };
                
                    divMain.style.transform = `scale(${scale}, ${scale})`;
                    divMain.scrollTop = newScroll.y;
                    divMain.scrollLeft = newScroll.x;
                    
                    let x = e.layerX; //x position within the element
                    let y = e.layerY; //y position within the element
                
                    divMain.style.transformOrigin = `${x / divMain.offsetWidth * 100}% ${y / divMain.offsetHeight * 100}%`;
                });
            })
        },1000);
    }

setHwndAsSoundshareSource = (hwnd) => {
    console.log(`setHwndAsSoundshareSource ${hwnd}`);
    this.discord_utilsModule = window.DiscordNative.nativeModules.requireModule("discord_utils");
    this.setPidAsSoundshareSource(this.discord_utilsModule.getPidFromWindowHandle(hwnd));
}

setPidAsSoundshareSource = (pid) => {
    console.log(`setPidAsSoundshareSource ${pid}`);
    if (this.mediaEngine === undefined) {
        this.moduleDepth1((e)=>e[1]?.getMediaEngine != undefined && (this.mediaEngine = e[1].getMediaEngine()))
    }
    this.discord_utilsModule = window.DiscordNative.nativeModules.requireModule("discord_utils");
    //BdApi.findModuleByProps("getMediaEngine").getMediaEngine().setSoundshareSource(12812, true, "stream")
    this.mediaEngine.setSoundshareSource(this.discord_utilsModule.getAudioPid(pid), true, "stream");
}

patchStreamPreview = () => {
    BdApi.Patcher.before(this.getName(), BdApi.findModuleByProps("makeChunkedRequest"), "makeChunkedRequest", (_, args, ret) => {
        if ((args[0].endsWith("preview") && args[2].method == "POST" && args[1]?.thumbnail !== undefined)) {
            let preview = BdApi.Data.load(this.getName(), "preview")
            if (preview.overrideFile)
                args[1].thumbnail = preview.overrideWithData;
            if (preview.forceDisabled)
                args[1].thumbnail = "data:image/jpeg;base64,"; // replace the thumbnail with an empty image
        }
    })
    // 12-13-23 BROKEN 
    // this patch will remove any preview with a data url syncing what you see with the server
    BdApi.Patcher.after(this.getName(), BdApi.findModuleByProps("getPreviewURL"), "getPreviewURL", (_, args, ret) => {
        if (ret?.startsWith("data:image/jpeg;base64,") === true) {
            let previews = _.__getLocalVars().streamPreviews;
            let preview = previews[Object.keys(previews).find(m => m.includes(`${args[0]}:${args[1]}:${args[2]}`))];
            console.log(`[${this.getName()}] Queuing preview for deletion`, preview);
            preview.expires = Date.now();
        }
    });
}

patchForEmojis = () => { // this will allow you to type emojis and have them auto embed

    // This is really gross I can't be asked to make this better
    this.canUseAnimatedEmojisModule = this.findModules((e)=>e?.exports?.default?.canUseAnimatedEmojis != undefined)[0];
    if(this.canUseAnimatedEmojisModuleOriginal == undefined)
        this.canUseAnimatedEmojisModuleOriginal = this.canUseAnimatedEmojisModule.exports.default.canUseAnimatedEmojis;
    this.canUseAnimatedEmojisModule.exports.default = { ...this.canUseAnimatedEmojisModule.exports.default, ["canUseAnimatedEmojis"]: ()=>{return true} };
    this.unpatchcanUseAnimatedEmojis = ()=>{this.canUseAnimatedEmojisModule.exports.default = { ...this.canUseAnimatedEmojisModule.exports.default, ["canUseAnimatedEmojis"]: this.canUseAnimatedEmojisModuleOriginal }};

    this.canUseEmojisEverywhereModule = this.findModules((e)=>e?.exports?.default?.canUseEmojisEverywhere != undefined)[0];
    if(this.canUseEmojisEverywhereModuleOriginal == undefined)
        this.canUseEmojisEverywhereModuleOriginal = this.canUseEmojisEverywhereModule.exports.default.canUseEmojisEverywhere;
    this.canUseEmojisEverywhereModule.exports.default = { ...this.canUseEmojisEverywhereModule.exports.default, ["canUseEmojisEverywhere"]: ()=>{return true} };
    this.unpatchcanUseEmojisEverywhere = ()=>{this.canUseEmojisEverywhereModule.exports.default = { ...this.canUseEmojisEverywhereModule.exports.default, ["canUseEmojisEverywhere"]: this.canUseEmojisEverywhereModuleOriginal }};

    this.canUseSoundboardEverywhereModule = this.findModules((e)=>e?.exports?.default?.canUseSoundboardEverywhere != undefined)[0];
    if(this.canUseSoundboardEverywhereModuleOriginal == undefined)
        this.canUseSoundboardEverywhereModuleOriginal = this.canUseSoundboardEverywhereModule.exports.default.canUseSoundboardEverywhere;
    this.canUseSoundboardEverywhereModule.exports.default = { ...this.canUseSoundboardEverywhereModule.exports.default, ["canUseSoundboardEverywhere"]: ()=>{return true} };
    this.unpatchcanUseSoundboardEverywhere = ()=>{this.canUseSoundboardEverywhereModule.exports.default = { ...this.canUseSoundboardEverywhereModule.exports.default, ["canUseSoundboardEverywhere"]: this.canUseSoundboardEverywhereModuleOriginal }};

    this.canUseCustomCallSoundsModule = this.findModules((e)=>e?.exports?.default?.canUseCustomCallSounds != undefined)[0];
    if(this.canUseCustomCallSoundsModuleOriginal == undefined)
        this.canUseCustomCallSoundsModuleOriginal = this.canUseCustomCallSoundsModule.exports.default.canUseCustomCallSounds;
    this.canUseCustomCallSoundsModule.exports.default = { ...this.canUseCustomCallSoundsModule.exports.default, ["canUseCustomCallSounds"]: ()=>{return true} };
    this.unpatchcanUseCustomCallSounds = ()=>{this.canUseCustomCallSoundsModule.exports.default = { ...this.canUseCustomCallSoundsModule.exports.default, ["canUseCustomCallSounds"]: this.canUseCustomCallSoundsModuleOriginal }};


    //BdApi.Patcher.instead(this.getName(), BdApi.findModuleByProps("getPremiumGradientColor"), "canUseAnimatedEmojis", (_, args, ret) => { return true });
    //BdApi.Patcher.instead(this.getName(), BdApi.findModuleByProps("getPremiumGradientColor"), "canUseEmojisEverywhere", (_, args, ret) => { return true });
    //BdApi.Patcher.instead(this.getName(), BdApi.findModuleByProps("getPremiumGradientColor"), "canUseSoundboardEverywhere", (_, args, ret) => { return true });
    BdApi.Patcher.before(this.getName(), BdApi.findModuleByProps("sendMessage"), "sendMessage", (_, args, ret) => {
        let arrofmessages = [args[1].content];
        args[1]?.validNonShortcutEmojis?.filter(e => e.managed !== true)?.forEach((emoji, index, array) => {
            // loop through all messages and split by the regex
            let localarrofmessages = [...arrofmessages];
            arrofmessages = [];
            localarrofmessages.forEach(message => {
                let temparr = message.split(new RegExp("(<.?" + emoji.allNamesString + "\\d*>)", "g"));
                for (let index = 0; index < temparr.length; index++) {
                    if (temparr[index].match(new RegExp("(<.?" + emoji.allNamesString + "\\d*>)", "g")))
                        temparr[index] = emoji.url;
                }
                arrofmessages.push(...temparr);
            });
        });
        for (let index = 0; index < arrofmessages.length - 1; index++) {
            if (arrofmessages[index].trim() !== "") {
                let tempargs = JSON.parse(JSON.stringify(args));
                tempargs[1].content = arrofmessages[index];
                tempargs[1].validNonShortcutEmojis = [];
                BdApi.findModuleByProps("sendMessage").sendMessage(args[0], tempargs[1], undefined, {});
            }
        }
        args[1].content = arrofmessages.pop();
    });
}


patchSpotifyPrem = () => {// this will allow you to listen along, etc. without premium

    var key = undefined;
    var spotifyModule = this.moduleDepth1((e)=>e[1]?.toString?.()?.includes(`{type:"SPOTIFY_PROFILE_UPDATE",accountId:`) && (key = e[0]))?.[0]?.exports;
    if(spotifyModule == undefined || key == undefined)
        return console.error(this.getName(), "Failed to find spotify module");

    BdApi.Patcher.instead(this.getName(), spotifyModule, key, async (e, t) => {
        BdApi.findModuleByProps("dispatch").dispatch({
            type: "SPOTIFY_PROFILE_UPDATE",
            accountId: e,
            isPremium: true,
        });
        return t;
    })

    BdApi.Patcher.after(this.getName(), BdApi.findModuleByProps("getActiveSocketAndDevice"), "getActiveSocketAndDevice", (_, args, ret) => { ret.socket.isPremium = true; return ret });
}

patchGuildPermission = () => {
    BdApi.Patcher.after(this.getName(), BdApi.findModuleByProps("canAccessGuildSettings"), "canAccessGuildSettings", (_, args, ret) => {
        return ret = true;
    });
    BdApi.Patcher.after(this.getName(), BdApi.findModuleByProps("getGuildPermissions").__proto__, "getGuildPermissionProps", (_, args, ret) => {
        ret.canViewGuildAnalytics = true;
        ret.canManageGuild = true;
        ret.canManageRoles = true;
        ret.canManageChannels = true;
        ret.canManageWebhooks = true;
        return ret;
    })
}

// was in original plugin it allows you to talk in vcs before the 10 minute timer when joining a new server
patchVerificationCriteria = () => {

    if(this.patchVerificationCriteriaOrignalReq == undefined)
        this.patchVerificationCriteriaOrignalReq = BdApi.findModuleByProps("VerificationCriteria").VerificationCriteria;

    Object.defineProperty(BdApi.findModuleByProps("VerificationCriteria"), "VerificationCriteria", {
        value: { "ACCOUNT_AGE": 0, "MEMBER_AGE": 0 }, configurable: true
    })
    //this.patchVerificationCriteriaModule = { ...this.patchVerificationCriteriaModule, [this.patchVerificationCriteriaKey]: { "ACCOUNT_AGE": 0, "MEMBER_AGE": 0 } };
}

unpatchVerificationCriteria = () => {
    if (this.patchVerificationCriteriaOrignalReq === undefined)
        return console.error(this.getName(), "Attempted to restore the original verification criteria but they dont exist");

    Object.defineProperty(BdApi.findModuleByProps("VerificationCriteria"), "VerificationCriteria", {
        value: this.patchVerificationCriteriaOrignalReq, configurable: true
    });
}

getSettingsPanel = () => {
    let currentres = BdApi.Data.load(this.getName(), "resolution");
    let currentfps = BdApi.Data.load(this.getName(), "frameRate");
    let preview = BdApi.Data.load(this.getName(), "preview");
    return `<div>
            <div>
                <label>Frame Rate</label>
                <input type="range" min="1" max="144" value="${currentfps}"oninput="this.nextElementSibling.innerText = this.value" onchange='BdApi.Data.save("${this.getName()}","frameRate",this.value);'\\>
                <label>${currentfps}</label>
            </div>
            <div>
                <label>Resolution</label>
                <input type="range" min="100" max="${screen.height}" value="${currentres}" oninput="this.nextElementSibling.innerText = this.value" onchange='BdApi.Data.save("${this.getName()}","resolution",this.value);'\\>
                <label>${currentres}</label>
            </div>
            <div>
                <label>Empty stream preview</label>
                <input type="checkbox" ${preview.forceDisabled ? "checked" : ""} oninput='{
                    console.log(this);
                    let preview = BdApi.Data.load("${this.getName()}", "preview");
                    preview.forceDisabled = this.checked;
                    BdApi.Data.save("${this.getName()}","preview",preview);
                };'\\>
            </div>
            <div>
                <label>Override preview with file</label>
                <input type="checkbox" ${preview.overrideFile ? "checked" : ""} oninput='{
                    let preview = BdApi.Data.load("${this.getName()}", "preview");
                    preview.overrideFile = this.checked;
                    BdApi.Data.save("${this.getName()}","preview",preview);
                };'\\>
                <div>
                    <input type="file" accept="image/*" onclick="this.value = null" onchange='{
                        let preview = BdApi.Data.load("${this.getName()}", "preview");
                        let reader = new FileReader();
                        reader.onload = ()=>{
                            preview.overrideWithData = reader.result;
                            BdApi.Data.save("${this.getName()}","preview",preview);
                            this.nextElementSibling.value = reader.result.substring(0,100);
                        }
                        reader.onerror = (error)=>{
                            console.log("[${this.getName()}] FileReader Error: ", error);
                        };
                        if(this.files[0].size < 200000) // they will reject larger than 200kb
                            reader.readAsDataURL(this.files[0]);
                        else
                            BdApi.UI.showToast("You can not use files larger than 200kb",{type:"error"});
                    };'>
                    
                    <input type="text" disabled="" value="${preview.overrideWithData.substring(0, 100)}">
                    <button onmousedown='{
                        let preview = BdApi.Data.load("${this.getName()}", "preview");
                        preview.overrideWithData = preview.overrideWithDataBlank;
                        BdApi.Data.save("${this.getName()}","preview",preview);
                        this.previousElementSibling.value = preview.overrideWithData.substring(0,100);
                    }'>Clear override</button>
                </div>
            </div>
            <div style="background-color:var(--info-warning-background)">
                <p style="color:var(--text-danger)">These things will freeze discord ui if invalid info entered.</p>
                <div class="flex flex-row">
                    <input type="number" id="${this.getName()}-soundsourceinput"\\>
                    <button onmousedown="BdApi.Plugins.get(\'${this.getName()}\').instance.setPidAsSoundshareSource(parseInt(document.getElementById(\'${this.getName()}-soundsourceinput\').value))">Set pid</button>
                    <button onmousedown="BdApi.Plugins.get(\'${this.getName()}\').instance.setHwndAsSoundshareSource(parseInt(document.getElementById(\'${this.getName()}-soundsourceinput\').value))">Set hwnd</button>
                </div>
            </div>
        </div>`;
}

stop = () => {
    console.log(`[CustomStreamSettings] Unpatching all patches`);

    BdApi.Patcher.unpatchAll(this.getName());

    clearInterval(this.zoomInterval,1000);

    this.unpatchVerificationCriteria();
    this.unpatchcanUseAnimatedEmojis();
    this.unpatchcanUseEmojisEverywhere();
    this.unpatchcanUseSoundboardEverywhere();

    console.log("[CustomStreamSettings] Stopped");
    BdApi.UI.showToast("[CustomStreamSettings] Stopped");
}
}
