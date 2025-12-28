interface TokenResponse {
  token: string | null;
  expiresIn: number;
  expiresAt: Date;
}

interface TokenRequest {
  channelName: string;
  uid: number;
  role: "publisher" | "subscriber";
  expirationTimeInSeconds?: number;
}

export class TokenService {
  private static tokenCache: Map<
    string,
    { token: string | null; expiresAt: Date }
  > = new Map();
  private static readonly TOKEN_REFRESH_BUFFER = 300; // 5 minutes before expiry

  /**
   * Generate Agora token for use when Primary Certificate is DISABLED in Agora Console
   * ⚠️ This only works with certificate disabled - no actual token validation
   * For production: Re-enable certificate and use backend token generation
   */
  static async generateToken(request: TokenRequest): Promise<TokenResponse> {
    const cacheKey = `${request.channelName}-${request.uid}-${request.role}`;

    // Check if token is cached and still valid
    const cached = this.tokenCache.get(cacheKey);
    if (
      cached &&
      cached.expiresAt.getTime() > Date.now() + this.TOKEN_REFRESH_BUFFER * 1000
    ) {
      console.log("♻️ Using cached token");
      return {
        token: cached.token,
        expiresIn: Math.floor(
          (cached.expiresAt.getTime() - Date.now()) / 1000,
        ),
        expiresAt: cached.expiresAt,
      };
    }

    try {
      console.log(
        `🔄 Generating token for channel: ${request.channelName}, uid: ${request.uid}, role: ${
          request.role === "publisher" ? "publisher" : "subscriber"
        }`,
      );

      // When certificate is disabled in Agora Console, we can use null token
      const token = null;
      const expirationTime = request.expirationTimeInSeconds || 86400; // 24 hours
      const expiresAt = new Date(Date.now() + expirationTime * 1000);

      // Cache the null token
      this.tokenCache.set(cacheKey, {
        token,
        expiresAt,
      });

      console.log(
        `✅ Token request created for channel: ${request.channelName} (certificate disabled mode)`,
      );

      return {
        token,
        expiresIn: expirationTime,
        expiresAt,
      };
    } catch (error) {
      console.error("❌ Error generating token:", error);
      throw error;
    }
  }

  /**
   * Refresh token before expiry
   */
  static async refreshToken(
    channelName: string,
    uid: number,
    role: "publisher" | "subscriber" = "subscriber",
  ): Promise<string | null> {
    const response = await this.generateToken({
      channelName,
      uid,
      role,
    });
    return response.token;
  }

  /**
   * Clear token cache
   */
  static clearCache(channelName?: string, uid?: number): void {
    if (!channelName || !uid) {
      this.tokenCache.clear();
      console.log("🧹 Token cache cleared");
      return;
    }

    // Clear specific token
    const keysToDelete: string[] = [];
    this.tokenCache.forEach((_, key) => {
      if (key.startsWith(`${channelName}-${uid}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.tokenCache.delete(key));
    console.log(`🧹 Token cache cleared for ${channelName}-${uid}`);
  }

  /**
   * Check if token is about to expire
   */
  static isTokenExpiringSoon(
    channelName: string,
    uid: number,
  ): boolean {
    const cacheKey = `${channelName}-${uid}-subscriber`;
    const cached = this.tokenCache.get(cacheKey);

    if (!cached) {
      return true; // Token not cached, treat as expired
    }

    const timeUntilExpiry = cached.expiresAt.getTime() - Date.now();
    return timeUntilExpiry < this.TOKEN_REFRESH_BUFFER * 1000;
  }
}

export default TokenService;
