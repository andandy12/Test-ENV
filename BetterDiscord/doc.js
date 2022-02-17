// This is very interesting...
BdApi.findModuleByProps("analyticsTrackingStoreMaker")

BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack // Will need to test patching and to see if science stops or if anything breaks
  //2/17/21 - appears to be what is called when we send science requests will block most likely
    BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleTrack = ()=>{}; // Works to block science/tracking requests no adverse affects seen so far
BdApi.findModuleByProps("analyticsTrackingStoreMaker").AnalyticsActionHandlers.handleFingerprint // This seems crucial to verifying phone as well as other things

BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport(/*discord token*/) // returns 400 | {token: ["Invalid token"]} 
BdApi.findModuleByProps("addPhoneWithoutPassword").validatePhoneForSupport("asd") // returns 500| {message: "500: Internal Server Error", code: 0}

BdApi.findModuleByProps("analyticsTrackingStoreMaker")
