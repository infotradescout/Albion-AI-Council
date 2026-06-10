import {
  createPrivateCommandSurfaceState,
  renderPrivateCommandSurface,
} from "./albion/privateCommandSurface";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

function currentRunIdFromHash(): string | undefined {
  const match = window.location.hash.match(/^#\/runs\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function render(): void {
  if (!root) {
    return;
  }

  const state = createPrivateCommandSurfaceState({
    appBaseUrl: window.location.origin,
    activeRunId: currentRunIdFromHash(),
  });

  root.innerHTML = renderPrivateCommandSurface(state);
}

window.addEventListener("hashchange", render);
render();
