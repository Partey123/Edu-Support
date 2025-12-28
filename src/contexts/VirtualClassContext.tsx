import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { VirtualClassContextType, VideoSession, LocalUser, VideoUser, NetworkQuality, AgoraServiceConfig } from '../types/virtual-class';
import { useAgoraSession } from '../hooks/useAgoraSession';
import { useNetworkQuality } from '../hooks/useNetworkQuality';

/**
 * Context for managing virtual classroom session state
 * Provides session management, user tracking, and media control
 */
const VirtualClassContext = createContext<VirtualClassContextType | null>(null);

interface VirtualClassProviderProps {
  children: React.ReactNode;
  classId: string;
  role: 'teacher' | 'student';
  userId: string;
  username: string;
}

/**
 * Provider component for virtual classroom context
 */
export const VirtualClassProvider: React.FC<VirtualClassProviderProps> = ({
  children,
  classId,
  role,
  userId,
  username,
}) => {
  const [session, setSession] = useState<VideoSession | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<VideoUser[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use the session hook
  const {
    joinChannel,
    leaveChannel,
    sessionId,
    isJoined,
    isLoading,
    error,
    remoteUsers: hookRemoteUsers,
    activeParticipants,
    connectionQuality,
  } = useAgoraSession(sessionId); // Session ID from state

  // Sync hook state with context state
  useEffect(() => {
    if (hookRemoteUsers) {
      // Convert Agora remote users to VideoUser format
      setRemoteUsers(hookRemoteUsers.map((user) => ({
        uid: String(user.uid),
        username: `User ${user.uid}`,
        email: '',
        role: 'student',
        isAudioEnabled: !user.audioTrack?.muted,
        isVideoEnabled: !user.videoTrack?.muted,
        screen: null,
      })));
    }
  }, [hookRemoteUsers]);

  /**
   * Join session
   */
  const joinSession = useCallback(
    async (config: AgoraServiceConfig) => {
      try {
        setConnectionError(null);

        // Create session record
        const newSession: VideoSession = {
          id: `session-${Date.now()}`,
          classId,
          teacherId: role === 'teacher' ? userId : 'unknown',
          channelName: config.channelName || classId,
          startTime: new Date(),
          isActive: true,
          status: 'live',
          participantCount: 1,
        };

        setSession(newSession);

        // Join via hook
        const success = await hookJoinSession(config);

        if (!success) {
          throw new Error('Failed to join session');
        }

        console.log('✅ Joined virtual classroom session');
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setConnectionError(errorMessage);
        console.error('❌ Failed to join session:', error);
        return false;
      }
    },
    [classId, role, userId, hookJoinSession]
  );

  /**
   * Leave session
   */
  const leaveSession = useCallback(async () => {
    try {
      setConnectionError(null);

      // End session
      if (session) {
        setSession({
          ...session,
          endTime: new Date(),
          isActive: false,
          status: 'ended',
          duration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000),
        });
      }

      // Leave via hook
      const success = await hookLeaveSession();

      if (!success) {
        throw new Error('Failed to leave session');
      }

      setSession(null);
      setRemoteUsers([]);
      console.log('✅ Left virtual classroom session');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConnectionError(errorMessage);
      console.error('❌ Failed to leave session:', error);
      return false;
    }
  }, [session, hookLeaveSession]);

  /**
   * Mute audio
   */
  const muteAudio = useCallback(async () => {
    try {
      if (!agoraService) {
        throw new Error('Agora service not initialized');
      }

      await agoraService.muteAudio();

      if (localUser) {
        setLocalUser({
          ...localUser,
          isAudioEnabled: false,
        });
      }

      console.log('✅ Audio muted');
      return true;
    } catch (error) {
      console.error('❌ Failed to mute audio:', error);
      return false;
    }
  }, [agoraService, localUser]);

  /**
   * Unmute audio
   */
  const unmuteAudio = useCallback(async () => {
    try {
      if (!agoraService) {
        throw new Error('Agora service not initialized');
      }

      await agoraService.unmuteAudio();

      if (localUser) {
        setLocalUser({
          ...localUser,
          isAudioEnabled: true,
        });
      }

      console.log('✅ Audio unmuted');
      return true;
    } catch (error) {
      console.error('❌ Failed to unmute audio:', error);
      return false;
    }
  }, [agoraService, localUser]);

  /**
   * Mute video
   */
  const muteVideo = useCallback(async () => {
    try {
      if (!agoraService) {
        throw new Error('Agora service not initialized');
      }

      await agoraService.muteVideo();

      if (localUser) {
        setLocalUser({
          ...localUser,
          isVideoEnabled: false,
        });
      }

      console.log('✅ Video muted');
      return true;
    } catch (error) {
      console.error('❌ Failed to mute video:', error);
      return false;
    }
  }, [agoraService, localUser]);

  /**
   * Unmute video
   */
  const unmuteVideo = useCallback(async () => {
    try {
      if (!agoraService) {
        throw new Error('Agora service not initialized');
      }

      await agoraService.unmuteVideo();

      if (localUser) {
        setLocalUser({
          ...localUser,
          isVideoEnabled: true,
        });
      }

      console.log('✅ Video unmuted');
      return true;
    } catch (error) {
      console.error('❌ Failed to unmute video:', error);
      return false;
    }
  }, [agoraService, localUser]);

  const value: VirtualClassContextType = {
    session,
    localUser,
    remoteUsers,
    joinSession,
    leaveSession,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    networkQuality,
    connectionError,
  };

  return <VirtualClassContext.Provider value={value}>{children}</VirtualClassContext.Provider>;
};

/**
 * Hook to use virtual classroom context
 */
export const useVirtualClass = (): VirtualClassContextType => {
  const context = useContext(VirtualClassContext);

  if (!context) {
    throw new Error('useVirtualClass must be used within VirtualClassProvider');
  }

  return context;
};

export default VirtualClassContext;
