export interface ProfileStats {
  followers: string[]
  following: string[]
}

const PROFILE_STATS_KEY = 'unahur_profile_stats'
export const PROFILE_STATS_UPDATED = 'unahur:profile-stats-updated'

const defaultStats: ProfileStats = {
  followers: ['@lucas', '@salir', '@maria'],
  following: ['@sofia', '@nicolas', '@ana'],
}

function normalizeNickName(nickName: string): string {
  return nickName.trim().replace(/^@+/, '').toLowerCase()
}

export function getProfileStats(): ProfileStats {
  try {
    const storedStats = localStorage.getItem(PROFILE_STATS_KEY)
    if (!storedStats) return defaultStats

    const parsed = JSON.parse(storedStats) as Partial<ProfileStats>
    return {
      followers: Array.isArray(parsed.followers)
        ? parsed.followers.filter(
            (nickName): nickName is string => typeof nickName === 'string',
          )
        : defaultStats.followers,
      following: Array.isArray(parsed.following)
        ? parsed.following.filter(
            (nickName): nickName is string => typeof nickName === 'string',
          )
        : defaultStats.following,
    }
  } catch {
    return defaultStats
  }
}

export function isFollowingUser(nickName: string): boolean {
  const normalizedNickName = normalizeNickName(nickName)
  return getProfileStats().following.some(
    (following) => normalizeNickName(following) === normalizedNickName,
  )
}

export function updateFollowing(
  nickName: string,
  shouldFollow: boolean,
): ProfileStats {
  const normalizedNickName = normalizeNickName(nickName)
  if (!normalizedNickName) {
    throw new Error('No se pudo identificar al usuario para seguirlo.')
  }

  const stats = getProfileStats()
  const following = stats.following.filter(
    (entry) => normalizeNickName(entry) !== normalizedNickName,
  )

  if (shouldFollow) {
    following.push(`@${nickName.trim().replace(/^@+/, '')}`)
  }

  const updatedStats = { ...stats, following }
  localStorage.setItem(PROFILE_STATS_KEY, JSON.stringify(updatedStats))
  window.dispatchEvent(new Event(PROFILE_STATS_UPDATED))
  return updatedStats
}
