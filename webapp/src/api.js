const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to handle API responses and errors
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    let errorData = { error: `HTTP error! status: ${response.status}` };
    if (contentType && contentType.indexOf("application/json") !== -1) {
      errorData = await response.json().catch(() => ({ error: 'An unknown error occurred parsing the error response.' }));
    }
    throw new Error(errorData.error || 'An unknown error occurred');
  }
  // Handle cases where the response might be empty (e.g., for a 202 Accepted)
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  }
  return response.text(); // Or handle as needed
};

// --- Auth APIs ---
export const apiLogin = (email, password) => {
  return fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);
};

export const apiRegister = (email, password, name) => { // Added name
  return fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }), // Added name to body
  }).then(handleResponse);
};

export const apiChangePassword = (player_id, oldPassword, newPassword) => {
    return fetch(`${API_BASE_URL}/player/${player_id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
    }).then(handleResponse);
};

export const apiUpdatePlayerTimezone = (player_id, newTimezone) => {
  return fetch(`${API_BASE_URL}/player/${player_id}/timezone`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newTimezone }),
  }).then(handleResponse);
};

export const apiUpdatePlayerName = (player_id, newName) => {
  return fetch(`${API_BASE_URL}/player/${player_id}/name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  }).then(handleResponse);
};

export const apiUpdatePlayerSocials = (playerId, socials) => {
  return fetch(`${API_BASE_URL}/player/${playerId}/socials`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(socials),
  }).then(handleResponse);
};

export const apiUpdateNotificationPreferences = (playerId, preferences) => {
  return fetch(`${API_BASE_URL}/player/${playerId}/notification-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  }).then(handleResponse);
};

export const apiRedeemCoupon = (playerId, couponCode) => {
  return fetch(`${API_BASE_URL}/player/${playerId}/redeem-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupon_code: couponCode }),
  }).then(handleResponse);
};

export const apiCancelSubscription = (playerId) => {
  return fetch(`${API_BASE_URL}/player/${playerId}/subscription/cancel`, {
    method: 'POST',
    // No body is needed for this request, but headers are good practice
    headers: { 'Content-Type': 'application/json' },
  }).then(handleResponse);
};

// --- Data & Session APIs ---
export const apiGetPlayerData = (playerId) => fetch(`${API_BASE_URL}/player/${playerId}/data`).then(handleResponse);

export const apiGetCareerStats = (playerId) => fetch(`${API_BASE_URL}/player/${playerId}/career-stats`).then(handleResponse);

export const apiGetPlayerSessions = (playerId, page = 1, limit = 25) => fetch(`${API_BASE_URL}/player/${playerId}/sessions?page=${page}&limit=${limit}`).then(handleResponse);

export const apiStartSession = (playerId, duelId = null, leagueRoundId = null) => {
    const body = { player_id: playerId };
    if (duelId) {
        body.duel_id = duelId;
    }
    if (leagueRoundId) {
        body.league_round_id = leagueRoundId;
    }
    return fetch(`${API_BASE_URL}/start-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(handleResponse);
};

export const apiStartCalibration = (playerId) => { // Accept playerId
  return fetch(`${API_BASE_URL}/start-calibration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Add Content-Type header
    body: JSON.stringify({ player_id: playerId }), // Send player_id in JSON body
  }).then(handleResponse);
};

// --- Player Search API ---
export const apiSearchPlayers = (searchTerm) => {
  return fetch(`${API_BASE_URL}/players/search?search_term=${encodeURIComponent(searchTerm)}`).then(handleResponse);
};

// --- Duels APIs ---
export const apiListDuels = (playerId) => {
  return fetch(`${API_BASE_URL}/duels/list/${playerId}`).then(handleResponse);
};

export const apiCreateDuel = (creatorId, invitedPlayerId, invitationExpiryMinutes, sessionDurationLimitMinutes) => {
  return fetch(`${API_BASE_URL}/duels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creator_id: creatorId,
      invited_player_id: invitedPlayerId,
      invitation_expiry_minutes: invitationExpiryMinutes,
      session_duration_limit_minutes: sessionDurationLimitMinutes
    }),
  }).then(handleResponse);
};

export const apiAcceptDuel = (duelId, playerId) => {
  return fetch(`${API_BASE_URL}/duels/${duelId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};

export const apiRejectDuel = (duelId, playerId) => {
  return fetch(`${API_BASE_URL}/duels/${duelId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};

export const apiSubmitDuelSession = (duelId, sessionId, playerId, score, duration) => {
  return fetch(`${API_BASE_URL}/duels/${duelId}/submit-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, player_id: playerId, score: score, duration: duration }),
  }).then(handleResponse);
};

// --- Leagues APIs ---
export const apiCreateLeague = async (creatorId, name, description, privacyType, settings) => {
  const response = await fetch(`${API_BASE_URL}/leagues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creator_id: creatorId,
      name,
      description,
      privacy_type: privacyType,
      settings,
    }),
  });
  if (!response.ok) throw new Error('Failed to create league.');
  return response.json();
};

export const apiListLeagues = async (playerId) => {
  const response = await fetch(`${API_BASE_URL}/leagues?player_id=${playerId}`);
  if (!response.ok) throw new Error('Failed to fetch leagues.');
  return response.json();
};

export const apiGetLeagueDetails = async (leagueId) => {
  const response = await fetch(`${API_BASE_URL}/leagues/${leagueId}`);
  if (!response.ok) throw new Error('Failed to fetch league details.');
  return response.json();
};

export const apiJoinLeague = async (leagueId, playerId) => {
  const response = await fetch(`${API_BASE_URL}/leagues/${leagueId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to join league.');
  }
  return response.json();
};

export const apiInviteToLeague = async (leagueId, inviterId, inviteeId) => {
  const response = await fetch(`${API_BASE_URL}/leagues/${leagueId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviter_id: inviterId, invitee_id: inviteeId }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to send invitation.');
  }
  return response.json();
};

export const apiRespondToLeagueInvite = async (leagueId, playerId, action) => {
  return fetch(`${API_BASE_URL}/leagues/invites/${leagueId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, action }),
  }).then(handleResponse);
};

export const apiUpdateLeagueSettings = async (leagueId, editorId, settings) => {
  return fetch(`${API_BASE_URL}/leagues/${leagueId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editor_id: editorId, settings }),
  }).then(handleResponse);
};

export const apiDeleteLeague = (leagueId, playerId) => {
  return fetch(`${API_BASE_URL}/leagues/${leagueId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};

// --- Fundraising APIs ---

export const apiListFundraisers = async () => {
  const response = await fetch(`${API_BASE_URL}/fundraisers`);
  if (!response.ok) throw new Error('Failed to fetch fundraisers.');
  return response.json();
};

export const apiGetFundraiserDetails = async (fundraiserId) => {
  const response = await fetch(`${API_BASE_URL}/fundraisers/${fundraiserId}`);
  if (!response.ok) throw new Error('Failed to fetch fundraiser details.');
  return response.json();
};

export const apiCreateFundraiser = async (fundraiserData) => {
  const response = await fetch(`${API_BASE_URL}/fundraisers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fundraiserData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create fundraiser.');
  }
  return response.json();
};

export const apiCreatePledge = async (fundraiserId, pledgeData) => {
  const response = await fetch(`${API_BASE_URL}/fundraisers/${fundraiserId}/pledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pledgeData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create pledge.');
  }
  return response.json();
};

export const apiGetPlayerPledges = async (playerId) => {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/pledges`);
  if (!response.ok) throw new Error('Failed to fetch player pledges.');
  return response.json();
};

// --- Notifications API ---
export const apiGetNotifications = (playerId, limit, offset, status) => {
  let url = `${API_BASE_URL}/notifications/${playerId}?limit=${limit}&offset=${offset}`;
  if (status) {
    url += `&status=${status}`;
  }
  return fetch(url).then(handleResponse);
};

export const apiGetUnreadNotificationsCount = (playerId) => {
  return fetch(`${API_BASE_URL}/notifications/${playerId}/unread_count`).then(handleResponse);
};

export const apiMarkNotificationAsRead = (notificationId, playerId) => {
  return fetch(`${API_BASE_URL}/notifications/${notificationId}/mark_read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};

export const apiMarkAllNotificationsAsRead = (playerId) => {
  return fetch(`${API_BASE_URL}/notifications/${playerId}/mark_all_read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};

export const apiDeleteNotification = (notificationId, playerId) => {
  return fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId }),
  }).then(handleResponse);
};


// --- AI Coach APIs ---
export const apiCoachChat = (payload) => {
  return fetch(`${API_BASE_URL}/coach/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);
};

export const apiListConversations = (playerId) => {
  return fetch(`${API_BASE_URL}/coach/conversations?player_id=${playerId}`).then(handleResponse);
};

export const apiGetConversationHistory = (conversationId) => {
  return fetch(`${API_BASE_URL}/coach/conversations/${conversationId}`).then(handleResponse);
};
