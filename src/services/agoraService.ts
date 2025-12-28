// Agora Web SDK Integration Service
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { checkAgoraConfig, logAgoraConfig } from "@/lib/agora/configCheck";

// Suppress Agora telemetry errors (non-critical, just analytics endpoints blocked by ad blockers)
const originalError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString?.() || "";
  if (
    message.includes("statscollector") ||
    message.includes("ERR_BLOCKED_BY_CLIENT")
  ) {
    return; // Silently suppress these non-critical errors
  }
  originalError.apply(console, args);
};

export interface AgoraServiceConfig {
  appId: string;
  region?: "sg" | "in" | "us" | "eu" | "cn" | "ap";
  codec?: "vp8" | "h264";
  mode?: "rtc" | "live";
}

interface StreamTrack {
  audioTrack: ILocalAudioTrack | null;
  videoTrack: ILocalVideoTrack | null;
}

export class AgoraService {
  private static instance: AgoraService;
  private client: IAgoraRTCClient | null = null;
  private localTracks: StreamTrack = {
    audioTrack: null,
    videoTrack: null,
  };
  private localUID: number = 0;
  private isInitialized: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of AgoraService
   */
  public static getInstance(): AgoraService {
    if (!AgoraService.instance) {
      AgoraService.instance = new AgoraService();
    }
    return AgoraService.instance;
  }

  /**
   * Initialize Agora SDK with app ID from environment
   */
  public async initialize(config?: Partial<AgoraServiceConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log("✅ Agora SDK already initialized");
      return;
    }

    try {
      // Check configuration
      const { isValid, issues } = checkAgoraConfig();
      if (!isValid) {
        throw new Error(
          `Agora configuration issues:\n${
            issues.map((i) => `- ${i.field}: ${i.message}`).join("\n")
          }`,
        );
      }

      logAgoraConfig();

      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) {
        throw new Error("VITE_AGORA_APP_ID is not configured in environment");
      }

      // Note: LOG_LEVEL is not available in version 4.24.2
      // AgoraRTC.setLogLevel(
      //   import.meta.env.MODE === "production"
      //     ? AgoraRTC.LOG_LEVEL.ERROR
      //     : AgoraRTC.LOG_LEVEL.WARNING,
      // );

      this.client = AgoraRTC.createClient({
        mode: config?.mode || "rtc",
        codec: config?.codec || "vp8",
      });

      this.isInitialized = true;
      console.log("✅ Agora SDK initialized with app ID:", appId);
    } catch (error) {
      console.error("❌ Agora initialization failed:", error);
      throw new Error(`Agora initialization failed: ${error}`);
    }
  }

  /**
   * Join a channel
   */
  public async joinChannel(
    channelName: string,
    token: string,
    uid: number,
  ): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      this.localUID = uid;

      // Setup event listeners before joining
      this.setupEventListeners();

      await this.client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        channelName,
        token,
        uid.toString(),
      );

      console.log(`✅ Joined channel: ${channelName} with UID: ${uid}`);
    } catch (error) {
      console.error("❌ Failed to join channel:", error);
      throw new Error(`Failed to join channel: ${error}`);
    }
  }

  /**
   * Leave the channel
   */
  public async leaveChannel(): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      await this.unpublishLocalVideo();
      await this.unpublishLocalAudio();
      await this.client.leave();
      console.log("✅ Left channel successfully");
    } catch (error) {
      console.error("❌ Failed to leave channel:", error);
      throw new Error(`Failed to leave channel: ${error}`);
    }
  }

  /**
   * Publish local video stream
   */
  public async publishLocalVideo(elementId: string): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 },
          bitrateMin: 400,
          bitrateMax: 2500,
        },
      });

      this.localTracks.videoTrack = videoTrack;

      // Play local video
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }
      await videoTrack.play(elementId);

      // Publish to channel
      await this.client.publish(videoTrack);

      console.log("✅ Local video published");
    } catch (error) {
      console.error("❌ Failed to publish local video:", error);
      throw new Error(`Failed to publish local video: ${error}`);
    }
  }

  /**
   * Publish local audio stream
   */
  public async publishLocalAudio(): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localTracks.audioTrack = audioTrack;

      await this.client.publish(audioTrack);
      console.log("✅ Local audio published");
    } catch (error) {
      console.error("❌ Failed to publish local audio:", error);
      throw new Error(`Failed to publish local audio: ${error}`);
    }
  }

  /**
   * Unpublish local video stream
   */
  public async unpublishLocalVideo(): Promise<void> {
    if (!this.client || !this.localTracks.videoTrack) {
      return;
    }

    try {
      await this.client.unpublish(this.localTracks.videoTrack);
      this.localTracks.videoTrack.stop();
      this.localTracks.videoTrack.close();
      this.localTracks.videoTrack = null;
      console.log("✅ Local video unpublished");
    } catch (error) {
      console.error("❌ Failed to unpublish local video:", error);
    }
  }

  /**
   * Unpublish local audio stream
   */
  public async unpublishLocalAudio(): Promise<void> {
    if (!this.client || !this.localTracks.audioTrack) {
      return;
    }

    try {
      await this.client.unpublish(this.localTracks.audioTrack);
      this.localTracks.audioTrack.stop();
      this.localTracks.audioTrack.close();
      this.localTracks.audioTrack = null;
      console.log("✅ Local audio unpublished");
    } catch (error) {
      console.error("❌ Failed to unpublish local audio:", error);
    }
  }

  /**
   * Mute local audio
   */
  public async muteLocalAudio(): Promise<void> {
    if (!this.localTracks.audioTrack) {
      throw new Error("Audio track not initialized");
    }

    try {
      await this.localTracks.audioTrack.setEnabled(false);
      console.log("🔇 Microphone muted");
    } catch (error) {
      console.error("❌ Failed to mute audio:", error);
      throw error;
    }
  }

  /**
   * Unmute local audio
   */
  public async unmuteLocalAudio(): Promise<void> {
    if (!this.localTracks.audioTrack) {
      throw new Error("Audio track not initialized");
    }

    try {
      await this.localTracks.audioTrack.setEnabled(true);
      console.log("🔊 Microphone unmuted");
    } catch (error) {
      console.error("❌ Failed to unmute audio:", error);
      throw error;
    }
  }

  /**
   * Disable local video
   */
  public async disableLocalVideo(): Promise<void> {
    if (!this.localTracks.videoTrack) {
      throw new Error("Video track not initialized");
    }

    try {
      await this.localTracks.videoTrack.setEnabled(false);
      console.log("📹 Camera disabled");
    } catch (error) {
      console.error("❌ Failed to disable video:", error);
      throw error;
    }
  }

  /**
   * Enable local video
   */
  public async enableLocalVideo(): Promise<void> {
    if (!this.localTracks.videoTrack) {
      throw new Error("Video track not initialized");
    }

    try {
      await this.localTracks.videoTrack.setEnabled(true);
      console.log("📹 Camera enabled");
    } catch (error) {
      console.error("❌ Failed to enable video:", error);
      throw error;
    }
  }

  /**
   * Subscribe to remote user's stream
   */
  public async subscribeToRemoteUser(
    user: IAgoraRTCRemoteUser,
    mediaType: "video" | "audio",
  ): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      await this.client.subscribe(user, mediaType);
      console.log(`✅ Subscribed to remote user ${user.uid} (${mediaType})`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to user ${user.uid}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from remote user
   */
  public async unsubscribeFromRemoteUser(
    user: IAgoraRTCRemoteUser,
  ): Promise<void> {
    if (!this.client) {
      throw new Error("Agora client not initialized");
    }

    try {
      await this.client.unsubscribe(user);
      console.log(`✅ Unsubscribed from remote user ${user.uid}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from user ${user.uid}:`, error);
      throw error;
    }
  }

  /**
   * Get remote video element for playing
   */
  public playRemoteVideo(user: IAgoraRTCRemoteUser, elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return;
    }

    if (user.videoTrack) {
      user.videoTrack.play(elementId);
      console.log(`▶️ Playing video for user ${user.uid}`);
    }
  }

  /**
   * Play remote audio
   */
  public playRemoteAudio(user: IAgoraRTCRemoteUser): void {
    if (user.audioTrack) {
      user.audioTrack.play();
      console.log(`🔊 Playing audio for user ${user.uid}`);
    }
  }

  /**
   * Get all remote users in channel
   */
  public getRemoteUsers(): IAgoraRTCRemoteUser[] {
    if (!this.client) {
      return [];
    }
    return this.client.remoteUsers;
  }

  /**
   * Get local UID
   */
  public getLocalUID(): number {
    return this.localUID;
  }

  /**
   * Get connection state
   */
  public getConnectionState(): string {
    if (!this.client) {
      return "DISCONNECTED";
    }
    return this.client.connectionState;
  }

  /**
   * Register event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    if (!this.client) {
      return;
    }

    // Setup Agora client event listener
    this.client.on(event as any, callback as any);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: Function): void {
    if (!this.client) {
      return;
    }
    this.client.off(event as any, callback as any);
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // User joined
    this.client.on("user-joined", (user) => {
      console.log("👤 User joined:", user.uid);
      this.emit("user-joined", user);
    });

    // User left
    this.client.on("user-left", (user) => {
      console.log("👤 User left:", user.uid);
      this.emit("user-left", user);
    });

    // User published
    this.client.on("user-published", (user, mediaType) => {
      console.log(`📡 User ${user.uid} published ${mediaType}`);
      this.emit("user-published", { user, mediaType });
    });

    // User unpublished
    this.client.on("user-unpublished", (user, mediaType) => {
      console.log(`🔌 User ${user.uid} unpublished ${mediaType}`);
      this.emit("user-unpublished", { user, mediaType });
    });

    // Connection state change
    this.client.on("connection-state-change", (curState, prevState, reason) => {
      console.log(
        `🔗 Connection state changed: ${prevState} -> ${curState}`,
        reason,
      );
      this.emit("connection-state-change", { curState, prevState, reason });
    });

    // Network quality
    this.client.on("network-quality", (quality) => {
      this.emit("network-quality", quality);
    });
  }

  /**
   * Emit custom event
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.eventListeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  /**
   * Cleanup resources
   */
  public async destroy(): Promise<void> {
    try {
      await this.unpublishLocalVideo();
      await this.unpublishLocalAudio();

      if (this.client) {
        await this.client.leave();
        this.client = null;
      }

      this.isInitialized = false;
      this.eventListeners.clear();
      console.log("✅ Agora service cleaned up");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  }
}

export default AgoraService.getInstance();
