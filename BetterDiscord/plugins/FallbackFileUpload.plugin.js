/**
 * @name Fallback File Uploader
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/LargerFileUpload.plugin.js
 * @description When a file upload fails you can upload the file to gofile.
 * @version 0.0.3
 */
module.exports = class LargerFileUpload {
    originalRequirements = [];
    originalBoostedGuildFeatures = [];
    cancelFakeDeafen = () => { };
    cancelAquiringPatch = () => { };

    getName() { return "Fallback File Uploader"; };
    getDescription() { return "When a file upload fails you can upload the file to gofile."; };
    getVersion() { return "0.0.3"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast(`${this.getName()} is starting`);
        console.log(`\n${this.getName()} Starting`);

        // BdApi.findModuleByProps("getSocket").__proto__.getSocket

        //Pretty self explainatory... this took long really long to find, but its worth as I didn't want to mod the websocket directly
        this.setupUploadFallback();
    }

    setupUploadFallback = () => {
        if (this.removeAttachment === undefined) {
            window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                    try { // sometime the module has exports from a different frame so this is a lazy fix
                        m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                            if (m.exports?.[elem]?.setUploads !== undefined && m.exports?.[elem]?.popFirstFile !== undefined)
                                this.removeAttachment = m.exports[elem].remove;
                            //console.log(m.exports[elem].remove())
                        })
                    } catch (e) { console.error(this.getName(), e) }
                }
            }]);

            if (typeof this.removeAttachment != "function")
                throw new Error("Failed to get removeAttachment");
        }

        // arbitary upload limit of 25gb 
        BdApi.Patcher.instead("LargerFiles", BdApi.findModuleByProps("getUserMaxFileSize"), "getUserMaxFileSize", () => { return 26843545600; });

        window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
            for (const m of Object.keys(req.c).map((id) => req.c[id]).filter((id) => id)) {
                try { // sometime the module has exports from a different frame so this is a lazy fix
                    m?.exports && Object.keys(m.exports).forEach((elem, index, array) => {
                        if (m.exports?.[elem]?.prototype?.upload !== undefined && m.exports?.[elem]?.prototype?.uploadFileToCloud !== undefined) {
                            BdApi.Patcher.after("LargerFiles", m.exports[elem].prototype, "handleError", (_, args, ret) => {
                                console.log("File upload failed", _.item.file, args);
                                //channel,id,draftType
                                this.removeAttachment(_.channelId, _.id, 0);//draftType is 0 always maybe?
                                BdApi.showConfirmationModal(`${_.item.file.name} failed to upload`, "Do you want to upload the file to gofile and send the link when done?", {
                                    cancelText: "No",
                                    confirmText: "Yes",
                                    onConfirm: () => {
                                        BdApi.showToast(`Uploading ${_.item.file.name} it will send when done`);
                                        this.UploadFile(_.item.file)
                                            .then(respData => {
                                                BdApi.showToast(`${_.item.file.name} was sent!`);
                                                this.forceSendMessage(_.channelId, respData.directdownload);
                                            });
                                    },
                                });
                            })
                        }
                    });
                } catch (e) { console.error(this.getName(), e) }
            }
        }]);
    }

    /**
     * Calls the function that sendMessage() originally calls with some predefined args.
     */
    forceSendMessage = function (channel, message) {
        BdApi.findModuleByProps("sendMessage")._sendMessage(channel, { "content": message, "tts": false, "invalidEmojis": [], "validNonShortcutEmojis": [] }, {});
    }

    UploadFile = (file) => {
        return file.text()
            .then(textcontent => {
                return fetch('https://api.gofile.io/getServer', {
                    method: 'GET',
                    headers: {
                        Accept: '*/*',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate, br',
                        Origin: 'https://gofile.io',
                        Connection: 'keep-alive',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-site',
                        TE: 'trailers'
                    }
                })
                    .then(response => response.json())
                    .then(response => {
                        let server = response.data.server;
                        let filename = encodeURIComponent(file.name);
                        let filecontents = textcontent;
                        return fetch(`https://${server}.gofile.io/uploadFile`, {
                            "credentials": "omit",
                            "headers": {
                                "Accept": "*/*",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Content-Type": "multipart/form-data; boundary=---------------------------361065604217163950863665502474",
                                "Sec-Fetch-Dest": "empty",
                                "Sec-Fetch-Mode": "cors",
                                "Sec-Fetch-Site": "same-site"
                            },
                            "body": `-----------------------------361065604217163950863665502474\r\nContent-Disposition: form-data; name=\"file\"; filename=\"${filename}\"\r\n\r\n${filecontents}\r\n-----------------------------361065604217163950863665502474--\r\n`,
                            "method": "POST",
                            "mode": "cors"
                        })
                            .then(response => response.json())
                            .then(response => {
                                let filedata = {};
                                if (response.status === "ok") {
                                    filedata["directdownload"] = `https://${server}.gofile.io/download/${response.data.fileId}/${filename}`;
                                    filedata["downloadpage"] = response.data.downloadPage;
                                }
                                return filedata;
                            })
                            .catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));
            })
    }

    stop() {
        BdApi.Patcher.unpatchAll("LargerFiles");

        console.log(`[${this.getName()}] Stopped`);
        BdApi.showToast(`[${this.getName()}] Stopped`);
    }
}