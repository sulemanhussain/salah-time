const BASE_URL = '';

export const Gender = { Male: 0, Female: 1, Other: 2 } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export interface User {
  id?: string;
  emailId: string;
  passwordHash: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
}

export interface UserProfile {
  id?: string;
  fullName?: string | null;
  phone?: string | null;
  city?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isVolunteer?: boolean;
  volunteerSince?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  userId?: string;
  user?: User | null;
}

export async function getUserById(id: string): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/api/Users/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);
  return response.json();
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/Users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error(`Failed to update user profile: ${response.status}`);
}

export async function setVolunteerStatus(id: string, isVolunteer: boolean): Promise<void> {
  const params = new URLSearchParams({ id, isVolunteer: String(isVolunteer) });
  const response = await fetch(`${BASE_URL}/api/SetVolunteerStatus?${params}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to set volunteer status: ${response.status}`);
}

export async function registerUser(user: User): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/UserRegistration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error(`Failed to register user: ${response.status}`);
}

export interface LoginResult {
  success: boolean;
  userId?: string;
}

export async function loginUser(credentials: Pick<User, 'emailId' | 'passwordHash'>): Promise<LoginResult> {
  const response = await fetch(`${BASE_URL}/api/UserLogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (response.status === 401) return { success: false };
  if (!response.ok) throw new Error(`Login request failed: ${response.status}`);
  const data = await response.json();
  if (!data || data === false) return { success: false };
  if (typeof data === 'string') return { success: true, userId: data };
  return { success: true };
}
