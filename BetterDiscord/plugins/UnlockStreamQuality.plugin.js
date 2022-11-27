/**
 * @name UnlockStreamQuality
 * @author andandy12
 * @updateUrl https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/UnlockStreamQuality.plugin.js
 * @description This will unlock stream settings removing their requirments.
 * @version 0.0.2
 */
 module.exports = class OTRClass {
    originalRequirements = [];
    originalBoostedGuildFeatures = [];
    cancelFakeDeafen = ()=>{};

    getName() { return "Stream Settings Unlocked"; };
    getDescription() { return "This will unlock stream settings removing their requirments."; };
    getVersion() { return "0.0.2"; };
    getAuthor() { return "andandy12"; };

    start() {
        BdApi.showToast("Stream Settings Unlocked is starting");
        console.log("\n[Stream Settings Unlocked] Starting");

        BdApi.showToast("[Stream Settings Unlocked] is deprecated use CustomStreamSettings the url is in the console", {type:"error"});
        console.log("[Stream Settings Unlocked] is deprecated use https://raw.githubusercontent.com/andandy12/Test-ENV/main/BetterDiscord/plugins/CustomStreamSettings.plugin.js");
        

        Object.defineProperty(BdApi.findModuleByProps("isDeveloper").__proto__,"isDeveloper",{get:()=>true})
        //BdApi.findAllModules((e)=>{if(e.hasFlag != undefined){return true}})[1].hasFlag = (e,t) => {if(e == 1 || e == 131072){return true}else{return (e & t) === t}}

        //deletes userPremiumType and guildPremiumTier from the requirments array.
        this.originalRequirements = BdApi.findModuleByProps("ApplicationStreamPresets").ApplicationStreamSettingRequirements;
        for(let i =0; i<BdApi.findModuleByProps("ApplicationStreamPresets").ApplicationStreamSettingRequirements.length;i++){
            delete BdApi.findModuleByProps("ApplicationStreamPresets").ApplicationStreamSettingRequirements[i].userPremiumType;
            delete BdApi.findModuleByProps("ApplicationStreamPresets").ApplicationStreamSettingRequirements[i].guildPremiumTier;
        }
        /* // discord updated
        // (sometimes when in bulk) allows you to upload more emojis than allowed... they cant be used until you have the proper level
        let a = BdApi.findModuleByProps("AppliedGuildBoostsRequiredForBoostedGuildTier").BoostedGuildFeatures[3];
        this.originalBoostedGuildFeatures = BdApi.findModuleByProps("AppliedGuildBoostsRequiredForBoostedGuildTier").BoostedGuildFeatures;
        let temp = [];temp[0] = a;temp[1] = a;temp[2] = a;temp[3] = a;
        BdApi.findModuleByProps("AppliedGuildBoostsRequiredForBoostedGuildTier").BoostedGuildFeatures = temp;
        */
        // lets you talk in vcs before 10 minutes has big potential to break in future
        BdApi.findModuleByProps("AppliedGuildBoostsRequiredForBoostedGuildTier").VerificationCriteria = {ACCOUNT_AGE: 0, MEMBER_AGE: 0};
        
        //Pretty self explainatory... this took long really long to find, but its worth as I didn't want to mod the websocket directly
        this.cancelFakeDeafen = BdApi.monkeyPatch(BdApi.findModuleByPrototypes("voiceStateUpdate").prototype, "voiceStateUpdate", {
            after: (e) => {
                console.log('cancelFakeDeafen',e);
                if (e.methodArguments[0].selfMute == true && e.methodArguments[0].selfDeaf != true) { // if muting and not false
                    BdApi.showConfirmationModal(`plugin`, "Do you want to do a fake mute?", {
                        cancelText: "No",
                        confirmText: "Yes",
                        onConfirm: () => {
                            BdApi.findModuleByProps("toggleSelfDeaf").toggleSelfMute();
                            setTimeout(() => {
                                e.thisObject.send(4, {
                                    guild_id: e.methodArguments[0].guildId,
                                    channel_id: e.methodArguments[0].channelId,
                                    self_mute: true,
                                    self_deaf: false,
                                    self_video: e.methodArguments[0].selfVideo
                                })
                            }, 250);
                        }
                    });
                }
                else if (e.methodArguments[0].selfDeaf == true) {
                    BdApi.showConfirmationModal(`plugin`, "Do you want to do a fake deafen?", {
                        cancelText: "No",
                        confirmText: "Yes",
                        onConfirm: () => {
                            BdApi.findModuleByProps("toggleSelfDeaf").toggleSelfDeaf();
                            setTimeout(() => {
                                e.thisObject.send(4, {
                                    guild_id: e.methodArguments[0].guildId,
                                    channel_id: e.methodArguments[0].channelId,
                                    self_mute: true,
                                    self_deaf: true,
                                    self_video: e.methodArguments[0].selfVideo
                                })
                            }, 250);
                        }
                    });
                }
            }
        });


        console.log("[Stop My Preview] Patching getGuildPermissions()");
        this.cancelMoreSettings = BdApi.monkeyPatch(BdApi.findModuleByProps("getGuildPermissions").__proto__,"getGuildPermissionProps",{
            instead: (e)=>{
                return { // invites only appear after your client caches them... so no you can not load invites not normally visible
                    "canManageGuild": true,
                    "canManageChannels": true,
                    "canManageRoles": true,
                    "canManageBans": false,
                    "canManageNicknames": false,
                    "canManageEmojisAndStickers": false, // they still wont network them...
                    "canViewAuditLog": false, // again no networking them
                    "canManageWebhooks": true,
                    "canViewGuildAnalytics": true,
                    "isGuildAdmin": true,
                    "isOwnerWithRequiredMfaLevel": true,
                    "guild": e.methodArguments[0]
                        
                };
            }
        })
        
        console.log("[Stop My Preview] Patching canAccessGuildSettings()");
        this.cancelSettings = BdApi.monkeyPatch(BdApi.findModuleByProps("canAccessGuildSettings"),"canAccessGuildSettings",{
            instead: (e)=>{
                return true;
            }
        })
    }

    stop() {
        Object.defineProperty(BdApi.findModuleByProps("isDeveloper").__proto__,"isDeveloper",{get:()=>{return 0}})

        console.log("[Stop My Preview] Unpatching getGuildPermissions()");
        this.cancelMoreSettings();

        console.log("[Stop My Preview] Unpatching canAccessGuildSettings()");
        this.cancelSettings();

        BdApi.findModuleByProps("ApplicationStreamPresets").ApplicationStreamSettingRequirements = this.originalRequirements;
        this.cancelFakeDeafen();

        BdApi.findModuleByProps("ApplicationStreamPresets").VerificationCriteria = {ACCOUNT_AGE: 5, MEMBER_AGE: 10}
        //BdApi.findModuleByProps("AppliedGuildBoostsRequiredForBoostedGuildTier").BoostedGuildFeatures = this.originalBoostedGuildFeatures;
        console.log("[Stream Settings Unlocked] Stopped");
        BdApi.showToast("[Stream Settings Unlocked] Stopped");
    }
}

// things attempted that did not work 
//  patching getUserMaxFileSize so it returns 85899345920;
//      discord would get mad at end of upload...
