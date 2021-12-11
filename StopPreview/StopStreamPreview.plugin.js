/**
 * @name StopPreview
 */
module.exports = class OTRClass {
    cancelMakeChunkRequestPatch = () => { };
    getName() { return "Stop Preview"; };
    getDescription() { return "This will force all preview post requests to be malformed."; };
    getVersion() { return "0.0.1"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("Stop Preview is starting");
        console.log("\n[Stop Preview] Starting");

        this.makeChunkRequest();
    }
    /**
     * Patches makeChunkRequest so we can force previews to be malformed.
     */
     makeChunkRequest() {
        console.log("[Stop Preview] Patching makeChunkRequest()");
        this.cancelMakeChunkRequestPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("makeChunkedRequest"), "makeChunkedRequest", {
            once: false, before: (e) => {
                if (e.methodArguments[0].includes("preview") && e.methodArguments[2].method == "POST") {
                    e.methodArguments[2].method = "GET"; // force the post to be a get as a failsafe
                    e.methodArguments[1].thumbnail == "";// change the thumbnail to be an empty image
                }
            }
        })
    }

    stop() {
        console.log("[Stop Preview] Unpatching makeChunkRequest()");
        this.cancelMakeChunkRequestPatch();

        console.log("[Stop Preview] Stopped");
        BdApi.showToast("[Stop Preview] Stopped");
    }
}
