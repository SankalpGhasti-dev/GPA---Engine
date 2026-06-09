export const LOCAL_USER = {
  uid: "local-user",
  email: "local@gpa-engine.app",
  displayName: "Local User",
  isLocal: true,
};

export function isLocalUser(user) {
  return Boolean(user?.isLocal);
}
