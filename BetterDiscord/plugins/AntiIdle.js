/**
 * @name StopIdle
 */
module.exports = class StopIdlePlugin {
  getName() {
    return "StopIdle";
  }
  getDescription() {
    return "Stop discord from tracking you... not really";
  }
  getVersion() {
    return "0.0.1";
  }
  getAuthor() {
    return "andandy12";
  }

  start() {
    instance = new stopIdle();
  }

  stop() {
    instance.uninitStopIdle();
  }
};

class stopIdle {
    module = [];
    togglebtnStopIdle;
  
    getIdleSinceModule = () => {
      if (typeof BdApi == "undefined") return this.module;
      else return BdApi.findModuleByProps("getIdleSince");
    };
  
    initStopIdle = () => {
      if (typeof this.togglebtnStopIdle != "undefined") return;
      let div = document.createElement("div");
      let button = document.createElement("button");
      button.setAttribute("aria-label", "Toggle idle updates");
      button.setAttribute("aria-checked", "false");
      button.addEventListener("click", this.toggleIdlePause);
  
      button.style.height = "30px";
      button.style.width = "30px";
      button.style.margin = "2px";
      button.style.color = "transparent";
      button.style.background = "transparent";
  
      button.innerHTML = `
            <svg style="position: absolute;" width="20" height="20" fill="currentColor" class="bi bi-hourglass" viewBox="0 0 16 16">
                <path fill="var(--interactive-normal)" d="M2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1-.5-.5zm2.5.5v1a3.5 3.5 0 0 0 1.989 3.158c.533.256 1.011.791 1.011 1.491v.702c0 .7-.478 1.235-1.011 1.491A3.5 3.5 0 0 0 4.5 13v1h7v-1a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351v-.702c0-.7.478-1.235 1.011-1.491A3.5 3.5 0 0 0 11.5 3V2h-7z"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentcolor" d="M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z" >
                </path>
            </svg>`;
  
      div.appendChild(button);
      let parent = document.querySelector(
        "button[role=switch][aria-label=Mute]"
      ).parentElement;
      parent.appendChild(div);
      parent.style.overflowX = "auto";
  
      this.togglebtnStopIdle = document.querySelector(
        `button[aria-label='Toggle idle updates']`
      );
    };
    uninitStopIdle = () => {
      this.revertStopIdle();
      this.togglebtnStopIdle?.remove();
      this.togglebtnStopIdle = undefined;
    };
  
    revertStopIdle = () => {
      this.getIdleSinceModule().getIdleSince =
        this.getIdleSinceModule().__proto__.getIdleSince;
      this.togglebtnStopIdle.setAttribute("aria-checked", "false");
      this.togglebtnStopIdle.style.color = "transparent";
    };
  
    stopIdle = () => {
      // to test you can change null to 0 and you will see you go idle shortly after clicking toggle
      this.getIdleSinceModule().getIdleSince = () => null;
      this.togglebtnStopIdle.setAttribute("aria-checked", "true");
      this.togglebtnStopIdle.style.color = "var(--status-danger)";
    };
  
    toggleIdlePause = () => {
      if (this.togglebtnStopIdle?.attributes["aria-checked"].value == "false") {
        this.stopIdle();
      } else {
        this.revertStopIdle();
      }
    };
  
    constructor() {
      webpackChunkdiscord_app.push([
        [""],
        {},
        (e) => {
          for (let c in e.c) this.module.push(e.c[c]);
        },
      ]),
        this.module;
      this.module = this.module.find(
        (m) => m?.exports?.default?.getIdleSince !== void 0
      ).exports.default;
      this.initStopIdle();
    }
  }
  