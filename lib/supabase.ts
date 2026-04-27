import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** 사용자 역할 */
export type UserRole = 'admin' | 'user'

/** profiles 테이블 행 타입 */
export interface Profile {
  id: string          // auth.users.id 와 동일
  email: string
  role: UserRole
  display_name: string | null
  created_at: string
}

// ─────────────────────────────────────────────
// Auth 헬퍼 함수
// ─────────────────────────────────────────────

/** 현재 로그인된 세션 가져오기 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) console.error('세션 조회 오류:', error.message)
  return data.session
}

/** 현재 로그인 유저의 프로필(role 포함) 가져오기 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('프로필 조회 오류:', error.message)
    return null
  }
  return data as Profile
}

/** 이메일 + 비밀번호 로그인 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

/** 로그아웃 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/** 회원가입 (관리자 초대 시 사용) */
export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  })
  if (error) throw new Error(error.message)
  return data
}
