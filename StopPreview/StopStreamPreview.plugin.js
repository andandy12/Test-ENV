/**
 * @name StopMyPreview
 */
 module.exports = class OTRClass {
    cancelMakeChunkedRequestPatch = () => { };
    getName() { return "Stop My Preview"; };
    getDescription() { return "This will force all preview post requests to not happen."; };
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("Stop My Preview is starting");
        console.log("\n[Stop My Preview] Starting");

        this.patchmakeChunkedRequest();
    }
    /**
     * Patches makeChunkRequest so we can stop preview post request from happening
     */
    patchmakeChunkedRequest() {
        console.log("[Stop My Preview] Patching makeChunkedRequest()");
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
        console.log("[Stop My Preview] Unpatching makeChunkedRequest()");
        this.cancelMakeChunkedRequestPatch();

        console.log("[Stop My Preview] Stopped");
        BdApi.showToast("[Stop My Preview] Stopped");
    }
}
