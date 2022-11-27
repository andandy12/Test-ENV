/**
 * @name CustomStreamSettings
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/CustomStreamSettings.plugin.js
 * @description More control over screensharing.
 * @version 0.0.7
 */
module.exports = class StreamSettings {
    cancelMoreSettings = () => { };
    getName() { return "CustomStreamSettings"; };
    getDescription() { return "More control over screensharing."; };
    getVersion() { return "0.0.7"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.UI.showToast("CustomStreamSettings is starting");
        console.log("\n[CustomStreamSettings] Starting");
        this.patchsetDesktopSource();
        if (BdApi.Data.load(this.getName(), "preview").overrideWithDataBlank == null) {
            BdApi.Data.save(this.getName(), "frameRate", 30);
            BdApi.Data.save(this.getName(), "preview", { "forceDisabled": true, "overrideFile": false, "overrideWithData": "data:image/jpeg;base64,", "overrideWithDataBlank": "data:image/jpeg;base64," });
            BdApi.Data.save(this.getName(), "resolution", screen.height);
        }
        this.patchForEmojis();
        this.patchStreamPreview();
    }

    patchsetDesktopSource() {

        if (this.mediaEngine === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if ((m.exports?.[elem]?.getMediaEngine !== undefined)) {
                                this.mediaEngine = m.exports?.[elem]?.getMediaEngine();
                            }
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }])
        }

        BdApi.Patcher.before(this.getName(), this.mediaEngine, "setDesktopSource", (_, args, ret) => {
            console.log("Test", args);
            if (args[0]?.id == undefined)
                return;
            args[0]["frameRate"] = parseInt(BdApi.Data.load(this.getName(), "frameRate")) || 1; // if this is a string it will work only in the metadata
            args[0]["resolution"] = parseInt(BdApi.Data.load(this.getName(), "resolution")) || screen.height;
        })

        if (this.cancelMoreSettings == null)
            setTimeout(() => {
                BdApi.UI.showToast(`Failed To Patch MediaEngineStore handler`,{type:"error"});
                console.log("You cannot patch MediaEngineStore actionHandler without starting a stream... Start a stream and close it to init the handler.");
                this.patchsetDesktopSource();
            }, 10000);
        else
            BdApi.UI.showToast(`Stream quality succesfully patched`);

    }

    setHwndAsSoundshareSource(hwnd) {
        console.log(`setHwndAsSoundshareSource ${hwnd}`);
        if (this?.discord_utilsModule === undefined) {

            //BdApi.findModuleByProps("requireModule").requireModule("discord_utils").getPidFromWindowHandle("66646")
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {

                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if ((m.exports?.[elem]?.requireModule !== undefined)) {
                                this.discord_utilsModule = m.exports?.[elem]?.requireModule("discord_utils")
                            }
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }])
        }
        this.setPidAsSoundshareSource(this.discord_utilsModule.getPidFromWindowHandle(hwnd));
    }

    setPidAsSoundshareSource(pid) {
        console.log(`setPidAsSoundshareSource ${pid}`);
        if (this?.mediaEngine === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if ((m.exports?.[elem]?.getMediaEngine !== undefined)) {
                                this.mediaEngine = m.exports?.[elem]?.getMediaEngine();
                            }
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }])
        }
        if (this.discord_utilsModule === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if ((m.exports?.[elem]?.requireModule !== undefined)) {
                                this.discord_utilsModule = m.exports?.[elem]?.requireModule("discord_utils")
                            }
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }])
        }
        //BdApi.findModuleByProps("getMediaEngine").getMediaEngine().setSoundshareSource(12812, true, "stream")
        this.mediaEngine.setSoundshareSource(this.discord_utilsModule.getAudioPid(pid), true, "stream");
    }

    patchForEmojis() { // this will allow you to type emojis and have them auto embed
        BdApi.Patcher.instead(this.getName(), BdApi.findModuleByProps("getPremiumGradientColor"), "canUseAnimatedEmojis", (_, args, ret) => { return true });
        BdApi.Patcher.instead(this.getName(), BdApi.findModuleByProps("getPremiumGradientColor"), "canUseEmojisEverywhere", (_, args, ret) => { return true });
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

    patchStreamPreview() {
        BdApi.Patcher.before(this.getName(), BdApi.findModuleByProps("makeChunkedRequest"), "makeChunkedRequest", (_, args, ret) => {
            console.log(`test makeChunkedRequest`, _, args);
            if ((args[0].endsWith("preview") && args[2].method == "POST" && args[1]?.thumbnail !== undefined)) {
                let preview = BdApi.Data.load(this.getName(), "preview")
                console.log(`test 3 makeChunkedRequest`,preview);
                if(preview.overrideFile)
                    args[1].thumbnail = preview.overrideWithData;
                if(preview.forceDisabled)
                    args[1].thumbnail = "data:image/jpeg;base64,"; // replace the thumbnail with an empty image
            }
            console.log(`test2 makeChunkedRequest`, _, args);
        })
    }

    getSettingsPanel() {
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
                <input type="checkbox" ${preview.forceDisabled?"checked":""} oninput='{
                    console.log(this);
                    let preview = BdApi.Data.load("${this.getName()}", "preview");
                    preview.forceDisabled = this.checked;
                    BdApi.Data.save("${this.getName()}","preview",preview);
                };'\\>
            </div>
            <div>
                <label>Override preview with file</label>
                <input type="checkbox" ${preview.overrideFile?"checked":""} oninput='{
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
                    
                    <input type="text" disabled="" value="${preview.overrideWithData.substring(0,100)}">
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

    stop() {
        console.log(`[CustomStreamSettings] Unpatching all patches`);

        BdApi.Patcher.unpatchAll(this.getName());

        // typeof this?.unpatchAnimated === "function" && this.unpatchAnimated();
        // typeof this?.unpatchAnywhere === "function" && this.unpatchAnywhere();
        // typeof this?.unpatchsendMessage === "function" && this.unpatchsendMessage();

        console.log("[CustomStreamSettings] Stopped");
        BdApi.UI.showToast("[CustomStreamSettings] Stopped");
    }
}


