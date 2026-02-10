export const useAuth = () => {
  const user = useState<any>('auth_user', () => null)
  const token = useCookie('auth_session')

  const fetchUser = async () => {
    if (token.value && !user.value) {
      try {
        const data = await $fetch('/api/auth/me')
        user.value = data
      } catch (err: any) {
        console.error("Fetch User Error:", err.status)
        if (err.status === 401) {
          user.value = null
        }
      }
    }
  }

  const roles = computed(() => {
    if (!user.value?.USER_ROLE) return []
    return user.value.USER_ROLE.map((ur: any) => ur.ROLE?.nama)
  })

  const hasRole = (roleName: string) => {
    if (!user.value?.USER_ROLE) return false
    return user.value.USER_ROLE.some((ur: any) => ur.ROLE?.nama === roleName)
  }

  return {
    user,
    token,
    isLoggedIn: computed(() => !!token.value),
    fetchUser,
    hasRole,
    roles,
    isAdmin: computed(() => hasRole('Admin')),
  }
}