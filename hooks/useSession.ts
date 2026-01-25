"use client";

import { useEffect, useState } from "react";

const USER_ID_KEY = "trip-os-user-id";

export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user ID in localStorage
    let storedId = localStorage.getItem(USER_ID_KEY);
    
    // Check cookies as backup or primary source if we want server-side compat later
    // For now, localStorage is sufficient for a "DIY" approach and easier to work with client-only
    // But let's also sync with a cookie for potential middleware use
    const match = document.cookie.match(new RegExp('(^| )' + USER_ID_KEY + '=([^;]+)'));
    if (match) {
        storedId = match[2];
    }

    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, storedId);
      // Set cookie for 1 year
      document.cookie = `${USER_ID_KEY}=${storedId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    if (storedId !== userId) {
        setUserId(storedId);
    }
  }, [userId]);

  return userId;
}
