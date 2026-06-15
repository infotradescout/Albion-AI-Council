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
