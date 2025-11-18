export function serializeMsg({ type, source, msg }: Message) {
  return `[${type.toUpperCase()}]:[${source}] ${msg}`;
}