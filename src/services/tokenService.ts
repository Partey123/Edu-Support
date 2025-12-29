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
   * Generate Agora token - NOW WITH PRODUCTION SECURITY!
   * ✅ FIXED: Uses actual token generation via backend API
   * ⚠️ Requires: /api/agora-token backend endpoint
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

      // ✅ FIXED: Call backend API to generate secure token
      const response = await fetch("/api/agora-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: request.channelName,
          uid: request.uid,
          role: request.role,
          expirationTimeInSeconds: request.expirationTimeInSeconds || 86400, // 24 hours
        }),
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const token = data.token; // ✅ Real token from backend
      const expirationTime = request.expirationTimeInSeconds || 86400;
      const expiresAt = new Date(Date.now() + expirationTime * 1000);

      // Cache the token
      this.tokenCache.set(cacheKey, {
        token,
        expiresAt,
      });

      console.log(
        `✅ Token generated for channel: ${request.channelName}`,
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

    const cacheKey = `${channelName}-${uid}`;
    this.tokenCache.delete(cacheKey);
    console.log(`🧹 Cleared cache for ${cacheKey}`);
  }
}

export default TokenService;
