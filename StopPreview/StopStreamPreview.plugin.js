/**
 * @name StopPreview
 */
 module.exports = class OTRClass {
    cancelMakeChunkedRequestPatch = () => { };
    getName() { return "Stop Preview"; };
    getDescription() { return "This will force all preview post requests to not happen."; };
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("Stop Preview is starting");
        console.log("\n[Stop Preview] Starting");

        this.patchmakeChunkedRequest();
    }
    /**
     * Patches makeChunkRequest so we can stop preview post request from happening
     */
    patchmakeChunkedRequest() {
        console.log("[Stop Preview] Patching makeChunkedRequest()");
        this.cancelMakeChunkedRequestPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("makeChunkedRequest"), "makeChunkedRequest", {
            once: false, 
            /*before: (e) => { // this one fails but we waste bandwidth as it will retry every so often
                if (e.methodArguments[0].includes("preview") && e.methodArguments[2].method == "POST") {
                    e.methodArguments[2].method = "GET"; // force the post to be a get as a failsafe
                    return e.methodArguments[1].thumbnail == "";// change the thumbnail to be an empty image
                }
            }*/
            instead: (e) => {//if its a preview post req we do nothing
                if (!e.methodArguments[0].includes("preview") && !e.methodArguments[2].method == "POST") {
                    e.callOriginalMethod();
                }
            }
        })
    }


    stop() {
        console.log("[Stop Preview] Unpatching makeChunkedRequest()");
        this.cancelMakeChunkedRequestPatch();

        console.log("[Stop Preview] Stopped");
        BdApi.showToast("[Stop Preview] Stopped");
    }
}
