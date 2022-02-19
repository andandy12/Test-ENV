/**
 * @name AntiTracking
 */
 module.exports = class OTRClass {
    cancelhandleTrackPatch = () => { };
    cancelhandleFingerprintPatch = () => { };
    cancelgeneratePatch = () => { };
    cancelgetFingerprintPatch = () => { };
    cancelhandleConnectionClosed = () => {};
    cancelhandleConnectionOpen = () =>{};
    getName() { return "AntiTracking"; };
    getDescription() { return "Stop discord from tracking you... not really"; };
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("AntiTracking is starting");
        console.log("\n[AntiTracking] Starting");

        
        console.log("Patching handleConnectionOpen"); // One call will happen before patch is successful... meaning one request will get through
        this.cancelhandleConnectionOpen = BdApi.monkeyPatch(BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers,"handleConnectionOpen", {
            instead: (e) => {
                console.log("Stopped handleConnectionOpen",e.methodArguments);
            }
        })

        console.log("Patching handleConnectionClosed");
        this.cancelhandleConnectionClosed = BdApi.monkeyPatch(BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers,"handleConnectionClosed", {
            instead: (e) => {
                console.log("Stopped handleConnectionClosed",e.methodArguments);
            }
        })

        console.log("Patching getFingerprint"); // most of the time this returns undefined... this should be the source of your fingerprints
        this.cancelgetFingerprintPatch = BdApi.monkeyPatch(BdApi.findAllModules((e)=>{if(e.getFingerprint != undefined){return true}})[1],"getFingerprint",{
            instead: ()=>{return undefined}
        });

        // this stops BdApi.findModuleByProps("track","isThrottled").track() tracking
        console.log("Patching handleTrack"); // this stops most of the tracking but some persists
        this.cancelhandleTrackPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers,"handleTrack", {
            instead: (e) => {
                console.log("Stopped track",e.methodArguments);
            }
        })

        console.log("Patching handleFingerprint"); // never saw this called but also never had a fingerprint
        this.cancelhandleFingerprintPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers,"handleFingerprint", {
            instead: (e) => {
                console.log("Stopped fingerprint",e.methodArguments);
            }
        })
        
        
        console.log("Patching generate"); // this will change what shows as your client_uuid in some science posts...
        this.cancelgeneratePatch = BdApi.monkeyPatch(BdApi.findModuleByPrototypes("generate").prototype,"generate",{
            /*// the below generates what should be a valid client_uuid but is not completely generic as there is non modified inputs
            before: (e)=>{
                e.methodArguments[0] = (Math.random().toString()+Math.random()).replaceAll(/[0\.]/g,"").substr(0,18);
            }*/
            // the below one returns a completely random but malformed client_uuid
            instead: (e)=>{
                return btoa((Math.random().toString()+Math.random()).replaceAll(/[0\.]/g,"").substr(0,24));
            }
        })
        //BdApi.findModuleByProps("AnalyticEventConfigs").expandEventProperties = ()=>{}

    }

    stop() {
        console.log("[AntiTracking] Unpatching handleTrack()");
        this.cancelhandleTrackPatch();
        console.log("[AntiTracking] Unpatching generate()");
        this.cancelgeneratePatch();
        console.log("[AntiTracking] Unpatching getFingerprint()");
        this.cancelgetFingerprintPatch();
        console.log("[AntiTracking] Unpatching handleFingerprint()");
        this.cancelhandleFingerprintPatch();
        console.log("[AntiTracking] Unpatching handleConnectionOpen()");
        this.cancelhandleConnectionOpen();
        console.log("[AntiTracking] Unpatching handleConnectionClosed()");
        this.cancelhandleConnectionClosed();
        console.log("[AntiTracking] Stopped");
        BdApi.showToast("[AntiTracking] Stopped");
    }
}
