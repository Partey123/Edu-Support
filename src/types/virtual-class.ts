// Virtual Classroom Types and Interfaces
// Complete type definitions for Agora-based virtual classroom system

// ====== User Types ======
export interface VideoUser {
  uid: number;
  username: string;
  email: string;
  role: "teacher" | "student";
  avatar?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionState: "connected" | "disconnected" | "reconnecting";
  isPinned?: boolean;
  hasRaisedHand?: boolean;
  lastActive?: Date;
}

export interface LocalUser extends VideoUser {
  localTracks: {
    audio?: ILocalAudioTrack;
    video?: ILocalVideoTrack;
    screen?: ILocalVideoTrack;
  };
}

// ====== Session Types ======
export interface VideoSession {
  id: string;
  classId: string;
  teacherId: string;
  channelName: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  duration?: number; // in seconds
  recordingId?: string;
  recordingUrl?: string;
  participantCount: number;
  status: "scheduled" | "live" | "ended" | "paused";
}

export interface VideoSessionState {
  session: VideoSession | null;
  localUser: LocalUser | null;
  remoteUsers: VideoUser[];
  isJoined: boolean;
  joinError: string | null;
  connectionState: "idle" | "joining" | "joined" | "leaving" | "reconnecting";
}

// ====== Media Types ======
export interface MediaDeviceInfo {
  deviceId: string;
  kind: "audioinput" | "videoinput" | "audiooutput";
  label: string;
  groupId: string;
}

export interface MediaStreamConfig {
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
}

// ====== Network Types ======
export interface NetworkStats {
  rtt: number; // Round trip time in ms
  videoSendBitrate: number; // Kbps
  videoRecvBitrate: number; // Kbps
  audioSendBitrate: number; // Kbps
  audioRecvBitrate: number; // Kbps
  videoSendFrameRate: number;
  videoRecvFrameRate: number;
  videoResolutionSend: string;
  videoResolutionRecv: string;
  connectionState: "connected" | "disconnected" | "reconnecting" | "unknown";
  audioLevel: number;
  videoDegradation: "none" | "minor" | "severe";
}

export type NetworkQuality =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "veryPoor"
  | "unknown";

// ====== Layout Types ======
export interface VideoLayout {
  columns: number;
  rows: number;
  videoWidth: number;
  videoHeight: number;
  containerHeight: number;
  orientation: "portrait" | "landscape";
  videoFit: "contain" | "cover";
}

export interface VideoPosition {
  uid: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isPinned?: boolean;
}

// ====== Agora Types ======
export interface AgoraServiceConfig {
  appId: string;
  channelName: string;
  token?: string;
  uid: number;
  role: "host" | "audience";
}

export interface AgoraConnectionState {
  isConnected: boolean;
  isJoined: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: NetworkQuality;
  error?: string;
}

// ====== Recording Types ======
export interface RecordingConfig {
  resolution?: string;
  bitrate?: number; // Kbps
  frameRate?: number;
  audioOnly?: boolean;
  fileFormat?: "mp4" | "webm";
}

export interface Recording {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileSize?: number; // in bytes
  url?: string;
  status: "recording" | "processing" | "completed" | "failed";
  error?: string;
}

// ====== Token Types ======
export interface TokenPayload {
  channelName: string;
  uid: number;
  role: 0 | 1; // 0 = subscriber, 1 = publisher
  expireTime: number;
  iat: number;
}

export interface TokenResponse {
  token: string;
  expiresIn: number;
  generatedAt: number;
}

// ====== Activity Types ======
export interface UserActivity {
  id: string;
  userId: string;
  sessionId: string;
  action:
    | "joined"
    | "left"
    | "audioOn"
    | "audioOff"
    | "videoOn"
    | "videoOff"
    | "screenShare"
    | "questionAsked"
    | "answerSubmitted";
  timestamp: Date;
  duration?: number; // for session, in seconds
  metadata?: Record<string, any>;
}

// ====== Stream Content Types ======
export interface StreamContent {
  id: string;
  sessionId: string;
  type: "document" | "presentation" | "whiteboard" | "link";
  title: string;
  url?: string;
  uploadedAt: Date;
  sharedBy: string;
}

// ====== Chat Types ======
export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

// ====== Exam Types ======
export interface ExamQuestion {
  id: string;
  examId: string;
  question: string;
  type: "multipleChoice" | "shortAnswer" | "essay";
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
}

export interface StudentExamResponse {
  id: string;
  studentId: string;
  examId: string;
  responses: {
    questionId: string;
    answer: string;
    timestamp: Date;
  }[];
  submittedAt: Date;
  score?: number;
}

// ====== Assignment Types ======
export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: Date;
  createdBy: string;
  createdAt: Date;
  attachments?: string[]; // file URLs
  rubric?: {
    criteria: string;
    points: number;
  }[];
}

export interface StudentAssignmentSubmission {
  id: string;
  studentId: string;
  assignmentId: string;
  content: string;
  attachments?: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  feedbackAt?: Date;
}

// ====== Context Types ======
export interface VirtualClassContextType {
  session: VideoSession | null;
  localUser: LocalUser | null;
  remoteUsers: VideoUser[];
  joinSession: (config: AgoraServiceConfig) => Promise<boolean>;
  leaveSession: () => Promise<boolean>;
  muteAudio: () => Promise<boolean>;
  unmuteAudio: () => Promise<boolean>;
  muteVideo: () => Promise<boolean>;
  unmuteVideo: () => Promise<boolean>;
  networkQuality: NetworkQuality;
  connectionError: string | null;
}

export interface VideoStreamContextType {
  localStream: MediaStream | null;
  remoteStreams: Map<number, MediaStream>;
  selectedDevice: {
    audioInput?: string;
    videoInput?: string;
    audioOutput?: string;
  };
  setAudioInput: (deviceId: string) => void;
  setVideoInput: (deviceId: string) => void;
  setAudioOutput: (deviceId: string) => void;
  getAvailableDevices: () => MediaDeviceInfo[];
}

export interface UserPresenceContextType {
  users: VideoUser[];
  addUser: (user: VideoUser) => void;
  removeUser: (uid: number) => void;
  updateUser: (uid: number, updates: Partial<VideoUser>) => void;
  pinnedUser: number | null;
  setPinnedUser: (uid: number | null) => void;
  usersWithRaisedHand: number[];
  raiseHand: () => void;
  lowerHand: () => void;
}

// ====== Agora SDK Types (for TypeScript compatibility) ======
export interface ILocalAudioTrack {
  setEnabled(enabled: boolean): void;
  close(): void;
}

export interface ILocalVideoTrack {
  setEnabled(enabled: boolean): void;
  play(element: string | HTMLElement): void;
  stop(): void;
  close(): void;
}

export interface IRemoteAudioTrack {
  play(): void;
  stop(): void;
}

export interface IRemoteVideoTrack {
  play(element: string | HTMLElement): void;
  stop(): void;
}

export interface IRemoteUser {
  uid: number;
  audioTrack?: IRemoteAudioTrack;
  videoTrack?: IRemoteVideoTrack;
  hasAudio: boolean;
  hasVideo: boolean;
  videoStreamType?: 0 | 1; // 0 = high, 1 = low
}

export interface AgoraRTCClient {
  join(
    appId: string,
    channel: string,
    token: string | null,
    uid?: number | null,
  ): Promise<void>;
  leave(): Promise<void>;
  publish(tracks: ILocalAudioTrack[] | ILocalVideoTrack[]): Promise<void>;
  unpublish(tracks?: ILocalAudioTrack[] | ILocalVideoTrack[]): Promise<void>;
  subscribe(user: IRemoteUser, mediaType: "audio" | "video"): Promise<void>;
  unsubscribe(user: IRemoteUser, mediaType?: "audio" | "video"): Promise<void>;
  getLocalTracks(): (ILocalAudioTrack | ILocalVideoTrack)[];
  getRemoteUsers(): IRemoteUser[];
  getConnectionState():
    | "DISCONNECTED"
    | "CONNECTING"
    | "CONNECTED"
    | "RECONNECTING"
    | "DISCONNECTING";
  setClientRole(role: "host" | "audience"): Promise<void>;
  on(eventName: string, callback: (...args: any[]) => void): void;
  off(eventName: string, callback: (...args: any[]) => void): void;
  getNetworkStats(): Promise<NetworkStats>;
}

export interface AgoraRTC {
  createClient(config: { mode: "rtc"; codec: "vp8" | "h264" }): AgoraRTCClient;
  createMicrophoneAudioTrack(): Promise<ILocalAudioTrack>;
  createCameraVideoTrack(): Promise<ILocalVideoTrack>;
  createScreenVideoTrack(
    screenSourceId?: string,
    withAudio?: boolean,
  ): Promise<ILocalVideoTrack>;
  getScreenSources(): Promise<any[]>;
  getCameras(): Promise<MediaDeviceInfo[]>;
  getMicrophones(): Promise<MediaDeviceInfo[]>;
  getSpeakers(): Promise<MediaDeviceInfo[]>;
}
