import {
  createPrivateCommandSurfaceState,
  renderPrivateCommandSurface,
} from "./albion/privateCommandSurface";
import "./styles.css";

export function currentRunIdFromLocation(input: {
  hash: string;
  pathname: string;
}): string | undefined {
  const hashMatch = input.hash.match(/^#\/runs\/([^/]+)$/);

  if (hashMatch?.[1]) {
    return decodeURIComponent(hashMatch[1]);
  }

  const pathMatch = input.pathname.match(/^\/runs\/([^/]+)$/);

  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : undefined;
}

const root = typeof document === "undefined"
  ? undefined
  : document.querySelector<HTMLDivElement>("#app");

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
