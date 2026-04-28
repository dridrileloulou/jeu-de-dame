export function useAuth() {
  const { loggedIn, user, clear } = useUserSession()
  return { loggedIn, user, clear }
}
