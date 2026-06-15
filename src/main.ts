import {
  createPrivateCommandSurfaceState,
  renderPrivateCommandSurface,
} from "./albion/privateCommandSurface";
import { currentRunIdFromLocation } from "./albion/shared/currentRunIdFromLocation";
import "./styles.css";

const root = typeof document === "undefined"
  ? undefined
  : document.querySelector<HTMLDivElement>("#app");

export { currentRunIdFromLocation };

function render(): void {
  if (!root) {
    return;
  }

  const state = createPrivateCommandSurfaceState({
    appBaseUrl: window.location.origin,
    activeRunId: currentRunIdFromLocation(window.location),
  });

  root.innerHTML = renderPrivateCommandSurface(state);
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
  render();
}
