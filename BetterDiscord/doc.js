// This is very interesting...
BdApi.findModuleByProps("analyticsTrackingStoreMaker")

BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack // Will need to test patching and to see if science stops or if anything breaks
  //2/17/21 - appears to be what is called when we send science requests will block most likely
    BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack = ()=>{}; // Works to block science/tracking requests no adverse affects seen so far
BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleFingerprint // This seems crucial to verifying phone as well as other things

BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport(/*discord token*/) // returns 500| {message: "500: Internal Server Error", code: 0}
BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport("asd")  // returns 400 | {token: ["Invalid token"]} 

BdApi.findModuleByProps("analyticsTrackingStoreMaker")

// 2/18/21 Remove your phone number from your account without needing to add another!
BdApi.findModuleByProps("addPhoneWithoutPassword").removePhone(/*current password*/,"")

/*// Unverify Email... This can be done by accessing a restricted endpoint https://discord.com/developers/docs/topics/gateway#privileged-intents
https://discord.com/api/v9/channels/0/thread-members   https://discord.com/developers/docs/resources/channel#list-thread-members
https://discord.com/api/v9/guilds/0/members            https://discord.com/developers/docs/resources/guild#list-guild-members
*/
