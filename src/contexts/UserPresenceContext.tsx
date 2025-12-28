import React, { createContext, useContext, useCallback, useState } from 'react';
import { UserPresenceContextType, VideoUser } from '../types/virtual-class';

/**
 * Context for managing user presence and hand raising
 * Tracks connected users and their states
 */
const UserPresenceContext = createContext<UserPresenceContextType | null>(null);

interface UserPresenceProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for user presence context
 */
export const UserPresenceProvider: React.FC<UserPresenceProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<VideoUser[]>([]);
  const [pinnedUser, setPinnedUser] = useState<number | null>(null);
  const [usersWithRaisedHand, setUsersWithRaisedHand] = useState<number[]>([]);

  /**
   * Add a user to the presence list
   */
  const addUser = useCallback((user: VideoUser) => {
    setUsers((prev) => {
      // Check if user already exists
      const existingIndex = prev.findIndex((u) => u.uid === user.uid);

      if (existingIndex >= 0) {
        // Update existing user
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...user };
        return updated;
      } else {
        // Add new user
        return [...prev, user];
      }
    });

    console.log(`✅ User added: ${user.username} (${user.uid})`);
  }, []);

  /**
   * Remove a user from the presence list
   */
  const removeUser = useCallback((uid: number) => {
    setUsers((prev) => prev.filter((u) => u.uid !== uid));

    // Remove from raised hands list
    setUsersWithRaisedHand((prev) => prev.filter((u) => u !== uid));

    // Unpin if this was the pinned user
    if (pinnedUser === uid) {
      setPinnedUser(null);
    }

    console.log(`✅ User removed: ${uid}`);
  }, [pinnedUser]);

  /**
   * Update user information
   */
  const updateUser = useCallback((uid: number, updates: Partial<VideoUser>) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.uid === uid
          ? {
              ...user,
              ...updates,
              lastActive: new Date(),
            }
          : user
      )
    );

    console.log(`✅ User updated: ${uid}`, updates);
  }, []);

  /**
   * Pin a user (keep their video large)
   */
  const handleSetPinnedUser = useCallback((uid: number | null) => {
    setPinnedUser(uid);
    console.log(`📌 User pinned: ${uid}`);
  }, []);

  /**
   * Raise hand (for students)
   */
  const raiseHand = useCallback(() => {
    // This would typically be called by the current user
    // In a real scenario, we'd emit an event or call an API
    setUsersWithRaisedHand((prev) => {
      // Add current user if not already in list
      // For now, we use a placeholder UID
      const currentUid = -1; // This should come from context
      if (!prev.includes(currentUid)) {
        return [...prev, currentUid];
      }
      return prev;
    });

    console.log('🖐️ Hand raised');
  }, []);

  /**
   * Lower hand
   */
  const lowerHand = useCallback(() => {
    setUsersWithRaisedHand((prev) => {
      const currentUid = -1; // This should come from context
      return prev.filter((u) => u !== currentUid);
    });

    console.log('✋ Hand lowered');
  }, []);

  /**
   * Dismiss a raised hand (teacher only)
   */
  const dismissRaisedHand = useCallback((uid: number) => {
    setUsersWithRaisedHand((prev) => prev.filter((u) => u !== uid));
    console.log(`✋ Dismissed hand: ${uid}`);
  }, []);

  /**
   * Get active speakers (users with both audio and video enabled)
   */
  const getActiveSpeakers = useCallback((): VideoUser[] => {
    return users.filter(
      (u) =>
        u.isAudioEnabled &&
        u.isVideoEnabled &&
        u.connectionState === 'connected'
    );
  }, [users]);

  /**
   * Get users by role
   */
  const getUsersByRole = useCallback(
    (role: 'teacher' | 'student'): VideoUser[] => {
      return users.filter((u) => u.role === role);
    },
    [users]
  );

  /**
   * Get user count
   */
  const getUserCount = useCallback((): number => {
    return users.length;
  }, [users]);

  /**
   * Get connected user count
   */
  const getConnectedUserCount = useCallback((): number => {
    return users.filter((u) => u.connectionState === 'connected').length;
  }, [users]);

  const value: UserPresenceContextType = {
    users,
    addUser,
    removeUser,
    updateUser,
    pinnedUser,
    setPinnedUser: handleSetPinnedUser,
    usersWithRaisedHand,
    raiseHand,
    lowerHand,
  };

  return (
    <UserPresenceContext.Provider value={value}>
      {children}
    </UserPresenceContext.Provider>
  );
};

/**
 * Hook to use user presence context
 */
export const useUserPresence = (): UserPresenceContextType => {
  const context = useContext(UserPresenceContext);

  if (!context) {
    throw new Error('useUserPresence must be used within UserPresenceProvider');
  }

  return context;
};

/**
 * Hook to get additional presence utilities
 */
export const usePresenceUtils = () => {
  const { users } = useUserPresence();

  const getActiveSpeakers = useCallback((): VideoUser[] => {
    return users.filter(
      (u) =>
        u.isAudioEnabled &&
        u.isVideoEnabled &&
        u.connectionState === 'connected'
    );
  }, [users]);

  const getUsersByRole = useCallback(
    (role: 'teacher' | 'student'): VideoUser[] => {
      return users.filter((u) => u.role === role);
    },
    [users]
  );

  const getUserCount = useCallback((): number => {
    return users.length;
  }, [users]);

  const getConnectedUserCount = useCallback((): number => {
    return users.filter((u) => u.connectionState === 'connected').length;
  }, [users]);

  return {
    getActiveSpeakers,
    getUsersByRole,
    getUserCount,
    getConnectedUserCount,
  };
};

export default UserPresenceContext;
