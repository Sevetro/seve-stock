function isErrorMsg(msg: string) {
  return msg.startsWith('[ERROR]');
}
function isLogMsg(msg: string) {
  return msg.startsWith('[LOG]');
}

export function printMessages(messages: string[] | undefined) {
  if (messages === undefined) return;

  for (const msg of messages) {
    if (isLogMsg(msg)) console.log(msg);
    if (isErrorMsg(msg)) console.error(msg);
  }
}