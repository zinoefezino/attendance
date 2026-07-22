export function getExpectedAdminToken() {
  return process.env.ADMIN_SESSION_SECRET as string;
}
