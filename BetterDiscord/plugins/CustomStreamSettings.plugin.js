/**
 * @name CustomStreamSettings
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/CustomStreamSettings.plugin.js
 * @description More control over screensharing.
 * @version 0.0.3
 */
 module.exports = class StreamSettings {
    cancelMoreSettings = () => { };
    getName() { return "CustomStreamSettings"; };
    getDescription() { return "More control over screensharing."; };
    getVersion() { return "0.0.3"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("CustomStreamSettings is starting"); 
        console.log("\n[CustomStreamSettings] Starting");
        this.patchsetDesktopSource();
        if(BdApi.Data.load(this.getName(),"frameRate") == null){
            BdApi.Data.save(this.getName(),"frameRate",30);
            BdApi.Data.save(this.getName(),"resolution",screen.height);
        }
    }

    patchsetDesktopSource() {

        if (this.mediaEngine === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                        if ((m.exports?.[elem]?.getMediaEngine !== undefined)) {
                            this.mediaEngine = m.exports?.[elem]?.getMediaEngine();
                        }
                    })
                }
            }])
        }

        this.cancelMoreSettings = BdApi.Patcher.before("CustomStreamSettings.SetDesktopSourceMediaEngine",this.mediaEngine,"setDesktopSource",(_,args,ret)=> {
            console.log("Test",args);
            if(args[0]?.id == undefined)
                return;
            args[0]["frameRate"] = parseInt(BdApi.Data.load(this.getName(),"frameRate")) || 1; // if this is a string it will work only in the metadata
            args[0]["resolution"] = parseInt(BdApi.Data.load(this.getName(),"resolution")) || screen.height;
        })

        if(this.cancelMoreSettings == null)
            setTimeout(() => {
                BdApi.showToast(`Failed To Patch MediaEngineStore handler`);
                console.log("You cannot patch MediaEngineStore actionHandler without starting a stream... Start a stream and close it to init the handler.");
                this.patchsetDesktopSource();
            }, 10000);
        else 
            BdApi.showToast(`Stream quality succesfully patched`);

    }

    setHwndAsSoundshareSource(hwnd) {
        if (this?.discord_utilsModule === undefined) {
            //BdApi.findModuleByProps("requireModule").requireModule("discord_utils").getPidFromWindowHandle("66646")
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                        if ((m.exports?.[elem]?.requireModule !== undefined)) {
                            this.discord_utilsModule = m.exports?.[elem]?.requireModule("discord_utils")
                        }
                    })
                }
            }])
        }
        this.setPidAsSoundshareSource(this.discord_utilsModule.getPidFromWindowHandle(hwnd));
    }

    setPidAsSoundshareSource(pid) {
        if (this?.mediaEngine === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                        if ((m.exports?.[elem]?.getMediaEngine !== undefined)) {
                            this.mediaEngine = m.exports?.[elem]?.getMediaEngine();
                        }
                    })
                }
            }])
        }
        if (this.discord_utilsModule === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                        if ((m.exports?.[elem]?.requireModule !== undefined)) {
                            this.discord_utilsModule = m.exports?.[elem]?.requireModule("discord_utils")
                        }
                    })
                }
            }])
        }
        //BdApi.findModuleByProps("getMediaEngine").getMediaEngine().setSoundshareSource(12812, true, "stream")
        this.mediaEngine.setSoundshareSource(this.discord_utilsModule.getAudioPid(pid), true, "stream");
    }


    getSettingsPanel(){
        let currentres = BdApi.Data.load(this.getName(),"resolution");
        let currentfps = BdApi.Data.load(this.getName(),"frameRate");
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
        </div>`;
    }

    stop() {
        console.log(`[CustomStreamSettings] Unpatching BdApi.findModuleByProps("dispatch")._actionHandlers._orderedActionHandlers?.MEDIA_ENGINE_SET_DESKTOP_SOURCE.find(x=>x?.["name"]=="MediaEngineStore")?.actionHandler()`);
        typeof this.cancelMoreSettings === "function" && this.cancelMoreSettings();

        console.log("[CustomStreamSettings] Stopped");
        BdApi.showToast("[CustomStreamSettings] Stopped");
    }
}


