// Comprehensive API endpoints for RoomieRadar
// Spring Boot REST API endpoints

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// --- Auth token helpers ---
function getAuthToken() {
  try {
    return localStorage.getItem('userToken') || undefined;
  } catch {
    return undefined;
  }
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = getAuthToken();

  const mergedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  if (token) {
    (mergedHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${API_BASE_URL}${input}`
      : input;

  const response = await fetch(url, { ...init, headers: mergedHeaders });

  if (response.status === 401) {
    try {
      localStorage.removeItem('userToken');
    } catch { }
  }

  return response;
}

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

// ===== ROOM MANAGEMENT =====
export async function fetchRoomDetails(roomId: number) {
  // GET /api/rooms/{id}
  return authFetch(`/api/rooms/${roomId}`).then(res => res.json());
}

export async function searchRooms(filters: {
  location?: string;
  budget?: string;
  roomType?: string;
  bedrooms?: number;
  bathrooms?: number;
}) {
  // GET /api/rooms/search?location=...&budget=...&type=...
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  return authFetch(`/api/rooms/search?${params}`).then(res => res.json());
}

export async function getAllRooms() {
  // GET /api/rooms
  return authFetch('/api/rooms').then(res => res.json());
}

export async function createRoomListing(roomData: {
  title: string;
  location: string;
  price: number; // Backend expects int, not string
  area: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  tags: string[];
  type: "Private" | "Shared" | "Studio" | "Hostel";
  description?: string;
  amenities?: string[];
  availaibleFrom?: string;
  deposit?: string;
  maintenance?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;
}) {
  // POST /api/rooms
  return authFetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
  }).then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });
}
export interface Room {
  id: number;
  title: string;
  location: string;
  price: number;
  area: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  tags: string[];
  type: "Private" | "Shared" | "Studio" | "Hostel";
  description?: string;
  amenities?: string[];
  availaibleFrom?: string;
  deposit?: string;
  maintenance?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;
  postedBy?: {
    id: number;
    name: string;
    email: string;
    // other user fields...
  };
}

export async function updateRoomListing(roomId: number, roomData: any) {
  // PUT /api/rooms/{id}
  return authFetch(`/api/rooms/${roomId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
  }).then(res => res.json());
}

export async function deleteRoomListing(roomId: number) {
  // DELETE /api/rooms/{id}
  const res = await authFetch(`/api/rooms/${roomId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    throw new Error(`Failed to delete room: ${res.status}`);
  }

  return true; // Success
}

export async function fetchUserListings() {
  // GET /api/rooms/my-listings
  const response = await authFetch('/api/rooms/my-listings');
  if (!response.ok) {
    throw new Error('Failed to fetch user listings');
  }
  return response.json();
}

// ===== ROOMMATE MANAGEMENT =====
export async function searchRoommates(filters?: {
  ageRange?: string;
  lifestyle?: string;
  budget?: string;
  location?: string;
  occupation?: string;
}) {
  // GET /api/roommates/search?ageRange=...&lifestyle=...&budget=...&location=...
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
  }
  return authFetch(`/api/roommates/search?${params}`).then(res => res.json());
}

export async function getAllRoommates() {
  // GET /api/roommates
  return authFetch('/api/roommates').then(res => res.json());
}
export async function getUserProfile() {
  // GET /api/roommates/me
  return authFetch('/api/roommates/me').then(res => res.json());
}

export async function createRoommateProfile(profileData: {
  name: string;
  age: number;
  occupation: string;
  lifestyle: string[];
  budget: string;
  location: string;
  bio: string;
  interests: string[];
  avatar?: string;
}) {
  const response = await authFetch('/api/roommates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create profile';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const text = await response.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}


export async function updateRoommateProfile(profileId: number, profileData: any) {
  // PUT /api/roommates/{id}
  return authFetch(`/api/roommates/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  }).then(res => res.json());
}

export async function deleteRoommateProfile(profileId: number) {
  // DELETE /api/roommates/{id}
  return authFetch(`/api/roommates/${profileId}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

// ===== USER AUTHENTICATION =====
export async function userLogin(credentials: { username: string; password: string }) {
  // POST /api/auth/login
  console.log('Logging in with credentials:', credentials);
  console.log('Sending request to:', `${API_BASE_URL}/api/auth/login`);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  console.log('Login response status:', response.status);
  const result = await response.json();
  console.log('Login response data:', result);

  return result;
}

export async function userRegister(userData: {

  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}) {
  // POST /api/auth/register
  console.log('Registering user with data:', userData);
  console.log('Sending request to:', `${API_BASE_URL}/api/auth/register`);

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  console.log('Registration response status:', response.status);
  console.log('Registration response headers:', response.headers);

  const result = await response.json();
  console.log('Registration response data:', result);

  return result;
}

export async function userLogout() {
  // POST /api/auth/logout
  return authFetch('/api/auth/logout', {
    method: 'POST'
  }).then(res => res.json());
}

export async function getCurrentUser() {
  // GET /api/auth/me
  return authFetch('/api/auth/me').then(res => res.json());
}

export async function updateUserProfile(userData: any) {
  // PUT /api/auth/profile
  // Accepts username as part of userData
  return authFetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }).then(res => res.json());
}

// ===== FAVORITES & WISHLIST =====
export async function addToFavorites(roomId: number) {
  // POST /api/favorites
  return authFetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId })
  }).then(res => res.json());
}

export async function removeFromFavorites(roomId: number) {
  // DELETE /api/favorites/{roomId}
  return authFetch(`/api/favorites/${roomId}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

export async function getUserFavorites() {
  // GET /api/favorites
  return authFetch('/api/favorites').then(res => res.json());
}

export async function checkIfFavorited(roomId: number) {
  // GET /api/favorites/{roomId}/check
  return authFetch(`/api/favorites/${roomId}/check`).then(res => res.json());
}

// ===== BOOKINGS & RESERVATIONS =====
export async function bookRoom(roomId: number, bookingData: {
  checkInDate: string;
  message?: string;
  phone?: string;
}) {
  // POST /api/bookings
  return authFetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, ...bookingData })
  }).then(res => res.json());
}

export async function getUserBookings() {
  // GET /api/bookings
  return authFetch('/api/bookings').then(res => res.json());
}

export async function cancelBooking(bookingId: number) {
  // DELETE /api/bookings/{id}
  return authFetch(`/api/bookings/${bookingId}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

export async function updateBooking(bookingId: number, bookingData: any) {
  // PUT /api/bookings/{id}
  return authFetch(`/api/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  }).then(res => res.json());
}

// ===== ROOMMATE CONNECTIONS =====
export async function sendConnectionRequest(roommateId: number, message?: string) {
  // POST /api/connections
  return authFetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roommateId, message })
  }).then(res => res.json());
}

export async function acceptConnectionRequest(connectionId: number) {
  // PUT /api/connections/{id}/accept
  return authFetch(`/api/connections/${connectionId}/accept`, {
    method: 'PUT'
  }).then(res => res.json());
}

export async function rejectConnectionRequest(connectionId: number) {
  // PUT /api/connections/{id}/reject
  return authFetch(`/api/connections/${connectionId}/reject`, {
    method: 'PUT'
  }).then(res => res.json());
}

export async function getUserConnections() {
  // GET /api/connections
  return authFetch('/api/connections').then(res => res.json());
}

export async function getPendingConnections() {
  // GET /api/connections/pending
  return authFetch('/api/connections/pending').then(res => res.json());
}

// ===== MESSAGING =====
export async function sendMessage(recipientId: number, message: string, type: 'room' | 'roommate') {
  // POST /api/messages
  return authFetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId, message, type })
  }).then(res => res.json());
}

export async function getConversations() {
  // GET /api/messages/conversations
  return authFetch('/api/messages/conversations').then(res => res.json());
}

export async function getMessages(conversationId: number) {
  // GET /api/messages/conversations/{id}
  return authFetch(`/api/messages/conversations/${conversationId}`).then(res => res.json());
}

// ===== IMAGE UPLOAD =====
export async function uploadImage(imageFile: File) {
  // POST /api/upload/image
  const formData = new FormData();
  formData.append('image', imageFile);

  return authFetch('/api/upload/image', {
    method: 'POST',
    body: formData
  }).then(res => res.json());
}

export async function deleteImage(imageId: string) {
  // DELETE /api/upload/images/{id}
  return authFetch(`/api/upload/images/${imageId}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

// ===== NOTIFICATIONS =====
export async function getUserNotifications() {
  // GET /api/notifications
  return authFetch('/api/notifications').then(res => res.json());
}

export async function markNotificationAsRead(notificationId: number) {
  // PUT /api/notifications/{id}/read
  return authFetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT'
  }).then(res => res.json());
}

export async function markAllNotificationsAsRead() {
  // PUT /api/notifications/read-all
  return authFetch('/api/notifications/read-all', {
    method: 'PUT'
  }).then(res => res.json());
}

// ===== ANALYTICS & STATS =====
export async function getRoomStats() {
  // GET /api/stats/rooms
  return authFetch('/api/stats/rooms').then(res => res.json());
}

export async function getUserStats() {
  // GET /api/stats/user
  return authFetch('/api/stats/user').then(res => res.json());
}

export async function getSearchAnalytics() {
  // GET /api/stats/searches
  return authFetch('/api/stats/searches').then(res => res.json());
}
