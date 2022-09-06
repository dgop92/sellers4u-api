export function addUUIdToEmail(email: string, uuid: string) {
  return email.replace("@", `+${uuid}@`);
}

export function stripUUIdFromEmail(email: string) {
  return email.replace(/\+.*@/, "@");
}
