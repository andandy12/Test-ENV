/**
 * @name AntiTokenLogger
 */
module.exports = class OTRClass {
    cancelOrderedActionHandlerPRESENCE_UPDATE3 = () => { };
    cancelUpdateTokenInterval = () => { };
    getName() { return "AntiTokenLogger"; };
    getDescription() { return "This will force all preview post requests to not happen."; };
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("AntiTokenLogger is starting");
        console.log("\n[AntiTokenLogger] Starting");

        var currentpass = ""; // enter the password that will associated with your account from here on out... probably dont share that you have this here with anyone
        this.cancelUpdateTokenInterval = setInterval(() => {
            if (!BdApi.findModuleByProps("isAFK").__proto__.isAFK() || !BdApi.findModuleByProps("isIdle").__proto__.isIdle()) {
                console.log("Token Update Started!")
                BdApi.findModuleByProps("saveAccountChanges").saveAccountChanges({ password: currentpass, newPassword: currentpass }, { close: false }).then(() => {
                    console.log("New Token Should Be Had!");
                })
            }
        }, 3600000); // once an hour update my token


        var currentUserId = "";
        BdApi.findModuleByProps("fetchCurrentUser").fetchCurrentUser().then(e => {
            currentUserId = e.id;
            Object.freeze(currentUserId);
        })

        this.cancelOrderedActionHandlerPRESENCE_UPDATE3 = BdApi.monkeyPatch(BdApi.findModuleByProps("dirtyDispatch")._orderedActionHandlers.PRESENCE_UPDATE[3], "actionHandler", {
            once: false,
            before: (e) => {
                if (e.methodArguments[0].user.id == currentUserId) {
                    console.log(e.methodArguments[0]);
                    if (Object.keys(e.methodArguments[0].clientStatus).length > 1) {
                        BdApi.showConfirmationModal(`Multiple Sessions Detected`, `The plugin has detected a PRESENCE_UPDATE event with multiple clientstatus ${JSON.stringify(e.methodArguments[0].clientStatus)}`, {
                            cancelText: "Do Nothing",
                            confirmText: "Update Token",
                            onCancel: () => { },
                            onConfirm: () => {

                                console.log("Token Update Started!")
                                BdApi.findModuleByProps("saveAccountChanges").saveAccountChanges({ password: currentpass, newPassword: currentpass }, { close: false }).then(() => {
                                    console.log("New Token Should Be Had!");
                                })

                            }
                        });
                    }
                }
            }
        })
    }

    stop() {
        console.log("[AntiTokenLogger] Unpatching OrderedActionHandlerPRESENCE_UPDATE3()");
        this.cancelOrderedActionHandlerPRESENCE_UPDATE3();

        console.log("[AntiTokenLogger] Unpatching TokenChanger()");
        this.cancelUpdateTokenInterval();

        console.log("[AntiTokenLogger] Stopped");
        BdApi.showToast("[AntiTokenLogger] Stopped");
    }
}