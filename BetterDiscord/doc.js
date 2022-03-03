// This is very interesting...
BdApi.findModuleByProps("analyticsTrackingStoreMaker")

BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack // Will need to test patching and to see if science stops or if anything breaks
  //2/17/22 - appears to be what is called when we send science requests will block most likely
    BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack = ()=>{}; // Works to block science/tracking requests no adverse affects seen so far
BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleFingerprint // This seems crucial to verifying phone as well as other things

BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport(/*discord token*/) // returns 500| {message: "500: Internal Server Error", code: 0}
BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport("asd")  // returns 400 | {token: ["Invalid token"]} 

// 2/18/22 Remove your phone number from your account without needing to add another!
BdApi.findModuleByProps("addPhoneWithoutPassword").removePhone(/*current password*/,"")

/*// Unverify Email... This can be done by accessing a restricted endpoint https://discord.com/developers/docs/topics/gateway#privileged-intents
https://discord.com/api/v9/channels/0/thread-members   https://discord.com/developers/docs/resources/channel#list-thread-members
https://discord.com/api/v9/guilds/0/members            https://discord.com/developers/docs/resources/guild#list-guild-members
*/

// 2/19/22 force enable the developer tabs can be useful for when you wanna stop analytics
Object.defineProperty(BdApi.findModuleByProps("isDeveloper").__proto__,"isDeveloper",{get:()=>true})
// when hasFlag is called return true if STAFF or VerifiedDeveloper else do original
BdApi.findAllModules((e)=>{if(e.hasFlag != undefined){return true}})[1].hasFlag = (e,t) => {if(e == 1 || e == 131072){return true}else{return (e & t) === t}}
BdApi.findModuleByPrototypes("hasFreePremium").prototype.hasFlag = ()=>true //2/20/22 this makes isStaff true // this also gives you disabled nitro?

// report a server for cheating/hacks
fetch("https://discord.com/api/v9/reporting/guild", {"method": "POST","headers": {"authorization": "Not Gonna Leave This Here","content-type": "application/json"},"body": "{\"id\":\"0\",\"version\":\"1.0\",\"variant\":\"1\",\"language\":\"en\",\"breadcrumbs\":[3,16,57],\"elements\":{},\"name\":\"guild\",\"guild_id\":\"serverID\"}"})
// ReportNames object... these are the endpoints that you can report to 
{"GUILD": "guild","GUILD_DISCOVERY": "guild_discovery","GUILD_DIRECTORY_ENTRY": "guild_directory_entry","MESSAGE": "message","STAGE_CHANNEL": "stage_channel","GUILD_SCHEDULED_EVENT": "guild_scheduled_event","FIRST_DM": "first_dm"}

// 2/20/22 // will test with nitro to see if it gives all the games
BdApi.findModuleByProps("shouldShowGameInLibrary").shouldShowGameInLibrary = ()=>true

// 3/2/22 - .send OpCodes
// _doResume - this.send( 6, { token: this.token, session_id: this.sessionId, seq: this.seq }, !1 );
// _doIdentify - this.send(2, o, !1);
// presenceUpdate   - this.send(3, { status: e, since: t, activities: n, afk: r });
// voiceStateUpdate - this.send(4, s);
// voiceServerPing  - this.send(5, null);
// embeddedActivityLaunch - this.send(25, { guild_id: e, channel_id: t, embedded_activity: n });
// embeddedActivityClose  - this.send(26, { guild_id: e, channel_id: t, application_id: n });
// embeddedActivityUpdate - this.send(27, { guild_id: e, channel_id: t, embedded_activity: n });
// requestGuildMembers - this.send(8, {guild_id: e, query: n, limit: r, user_ids: i, presences: a, });
// updateGuildSubscriptions - this.send(14, y({ guild_id: e }, t));
// callConnect - this.send(13, { channel_id: e });
// lobbyConnect - this.send(15, { lobby_id: e, lobby_secret: t });
// lobbyDisconnect - this.send(16, { lobby_id: e });
// lobbyVoiceStatesUpdate - this.send( 17, e.map(function (e) { return { lobby_id: e.lobbyId, self_mute: e.selfMute, self_deaf: e.selfDeaf, }; }) );
// streamCreate - this.send(18, { type: e, guild_id: t, channel_id: n, preferred_region: r, });
// streamWatch - this.send(20, { stream_key: e });
// streamPing - this.send(21, { stream_key: e });
// streamDelete - this.send(19, { stream_key: e });
// streamSetPaused - this.send(22, { stream_key: e, paused: t });
// queryApplicationCommands - this.send(24, c);
// Below Might Be Wrong - Should only be true for call related sends
/*{
        e[(e.IDENTIFY = 0)] = "IDENTIFY";
        e[(e.SELECT_PROTOCOL = 1)] = "SELECT_PROTOCOL";
        e[(e.READY = 2)] = "READY";
        e[(e.HEARTBEAT = 3)] = "HEARTBEAT";
        e[(e.SELECT_PROTOCOL_ACK = 4)] = "SELECT_PROTOCOL_ACK";
        e[(e.SPEAKING = 5)] = "SPEAKING";
        e[(e.HEARTBEAT_ACK = 6)] = "HEARTBEAT_ACK";
        e[(e.RESUME = 7)] = "RESUME";
        e[(e.HELLO = 8)] = "HELLO";
        e[(e.RESUMED = 9)] = "RESUMED";
        e[(e.VIDEO = 12)] = "VIDEO";
        e[(e.CLIENT_DISCONNECT = 13)] = "CLIENT_DISCONNECT";
        e[(e.SESSION_UPDATE = 14)] = "SESSION_UPDATE";
        e[(e.MEDIA_SINK_WANTS = 15)] = "MEDIA_SINK_WANTS";
        e[(e.VOICE_BACKEND_VERSION = 16)] = "VOICE_BACKEND_VERSION";
}*/
// doResume - this.send(_.RESUME, { token: this.token, session_id: this.sessionId, server_id: this.serverId, });
//    _.RESUME - 9
// handleReady - this.send(_.VOICE_BACKEND_VERSION, {});
//    _.VOICE_BACKEND_VERSION - 16
// sendHeartbeat - this.send(_.HEARTBEAT, Date.now());
//    _.HEARTBEAT - 3
// identify - this.send(_.IDENTIFY, { server_id: e, user_id: t, session_id: n, token: r, video: i, streams: m(a), });
//    _.IDENTIFY - 0
// selectProtocol - this.send(_.SELECT_PROTOCOL, d({ protocol: e, data: i }, a));
//    _.SELECT_PROTOCOL - 1
// speaking - this.send(_.SPEAKING, { speaking: this.serverVersion <= 3 ? Boolean(e) : e, delay: t, ssrc: n, });
//    _.SPEAKING - 5
// video - this.send(_.VIDEO, { audio_ssrc: e, video_ssrc: t, rtx_ssrc: n, streams: m(r), });
//    _.VIDEO - 12
// mediaSinkWants - this.send(_.MEDIA_SINK_WANTS, e);
//    _.MEDIA_SINK_WANTS - 15
/*
