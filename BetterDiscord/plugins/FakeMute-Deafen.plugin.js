/**
 * @name FalseMute
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/FakeMute-Deafen.plugin.js
 * @description Allows you to fake mute and deafen.
 * @version 0.0.5
 */
module.exports = class FalseMute {

    getName() { return "Fake Mute and Deafen"; };
    getDescription() { return "Allows you to fake mute and deafen."; };
    getVersion() { return "0.0.5"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast(`${this.getName()} is starting`);
        console.log(`\n${this.getName()} Starting`);

        this.doFakeMuteDeafPatch();
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

    doFakeMuteDeafPatch() {

        if (this.socket === undefined) {
            this.moduleDepth1((e)=>{return e[1]?.__proto__?.getSocket !== undefined && (this.socket = e[1]?.__proto__?.getSocket())});
            if (typeof this.socket?.send != "function")
                throw new Error("Failed to get websocket");
        }

        let prompt = async (text, args) => {
            return await new Promise((resolve, reject) => {
                console.log("prompting for ", text);
                BdApi.showConfirmationModal(this.getName(), `Do you want to do a fake ${text}?`, {
                    cancelText: "No",
                    confirmText: "Yes",
                    onConfirm: () => {
                        if (text !== "Video")
                            BdApi.findModuleByProps("toggleSelfDeaf")[`toggleSelf${text}`]();
                        setTimeout(() => {
                            this.socket.send(4, {
                                guild_id: args.guildId,
                                channel_id: args.channelId,
                                self_mute: args.selfMute,
                                self_deaf: args.selfDeaf,
                                self_video: args.selfVideo
                            })
                        }, 250); 
                        resolve(true);
                    },
                    onCancel: () => { resolve(false); }
                });
            })
        }

        BdApi.Patcher.before(this.getName(), this.socket, "voiceStateUpdate", async (_, args, ret) => {
            if (args[0].selfDeaf === true) {
                args[0].selfDeaf = await prompt("Deaf", args[0]);
            } else if (args[0].selfMute === true) {
                args[0].selfMute = await prompt("Mute", args[0]);
            }
        })
    }

    stop() {
        BdApi.Patcher.unpatchAll(this.getName());
        console.log(`[${this.getName()}] Stopped`);
        BdApi.showToast(`[${this.getName()}] Stopped`);
    }
}

// !function(e) {
//     e[e.DISPATCH = 0] = "DISPATCH";
//     e[e.HEARTBEAT = 1] = "HEARTBEAT";
//     e[e.IDENTIFY = 2] = "IDENTIFY";
//     e[e.PRESENCE_UPDATE = 3] = "PRESENCE_UPDATE";
//     e[e.VOICE_STATE_UPDATE = 4] = "VOICE_STATE_UPDATE";
//     e[e.VOICE_SERVER_PING = 5] = "VOICE_SERVER_PING";
//     e[e.RESUME = 6] = "RESUME";
//     e[e.RECONNECT = 7] = "RECONNECT";
//     e[e.REQUEST_GUILD_MEMBERS = 8] = "REQUEST_GUILD_MEMBERS";
//     e[e.INVALID_SESSION = 9] = "INVALID_SESSION";
//     e[e.HELLO = 10] = "HELLO";
//     e[e.HEARTBEAT_ACK = 11] = "HEARTBEAT_ACK";
//     e[e.CALL_CONNECT = 13] = "CALL_CONNECT";
//     e[e.GUILD_SUBSCRIPTIONS = 14] = "GUILD_SUBSCRIPTIONS";
//     e[e.LOBBY_CONNECT = 15] = "LOBBY_CONNECT";
//     e[e.LOBBY_DISCONNECT = 16] = "LOBBY_DISCONNECT";
//     e[e.LOBBY_VOICE_STATES_UPDATE = 17] = "LOBBY_VOICE_STATES_UPDATE";
//     e[e.STREAM_CREATE = 18] = "STREAM_CREATE";
//     e[e.STREAM_DELETE = 19] = "STREAM_DELETE";
//     e[e.STREAM_WATCH = 20] = "STREAM_WATCH";
//     e[e.STREAM_PING = 21] = "STREAM_PING";
//     e[e.STREAM_SET_PAUSED = 22] = "STREAM_SET_PAUSED";
//     e[e.REQUEST_GUILD_APPLICATION_COMMANDS = 24] = "REQUEST_GUILD_APPLICATION_COMMANDS";
//     e[e.EMBEDDED_ACTIVITY_LAUNCH = 25] = "EMBEDDED_ACTIVITY_LAUNCH";
//     e[e.EMBEDDED_ACTIVITY_CLOSE = 26] = "EMBEDDED_ACTIVITY_CLOSE";
//     e[e.EMBEDDED_ACTIVITY_UPDATE = 27] = "EMBEDDED_ACTIVITY_UPDATE";
//     e[e.REQUEST_FORUM_UNREADS = 28] = "REQUEST_FORUM_UNREADS";
//     e[e.REMOTE_COMMAND = 29] = "REMOTE_COMMAND";
//     e[e.GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH = 30] = "GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH"
// }
