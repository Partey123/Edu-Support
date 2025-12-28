/**
 * Agora Configuration Validator
 * Checks if all required environment variables are set
 */

export interface AgoraConfigIssue {
  severity: "error" | "warning";
  message: string;
  field: string;
}

export function checkAgoraConfig(): {
  isValid: boolean;
  issues: AgoraConfigIssue[];
} {
  const issues: AgoraConfigIssue[] = [];

  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE;

  // Check Agora App ID
  if (!appId) {
    issues.push({
      severity: "error",
      message:
        "Agora App ID is not configured. Add VITE_AGORA_APP_ID to .env.local",
      field: "VITE_AGORA_APP_ID",
    });
  } else if (appId.length < 10) {
    issues.push({
      severity: "error",
      message:
        "Agora App ID seems invalid (too short). Check your configuration.",
      field: "VITE_AGORA_APP_ID",
    });
  }

  // Check Agora App Certificate (optional if certificate is disabled in Agora Console)
  if (!appCertificate) {
    issues.push({
      severity: "warning",
      message:
        "Agora App Certificate is not configured. This is only needed if Primary Certificate is enabled in Agora Console.",
      field: "VITE_AGORA_APP_CERTIFICATE",
    });
  }

  const isValid = issues.filter((i) => i.severity === "error").length === 0;

  if (!isValid) {
    console.error("🚨 Agora Configuration Issues:");
    issues.forEach((issue) => {
      if (issue.severity === "error") {
        console.error(`  ${issue.field}: ${issue.message}`);
      } else {
        console.warn(`  ${issue.field}: ${issue.message}`);
      }
    });
  } else {
    console.log("✅ Agora configuration is valid");
  }

  return { isValid, issues };
}

/**
 * Log detailed configuration info for debugging
 */
export function logAgoraConfig(): void {
  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE;

  console.group("🔧 Agora Configuration");
  console.log(
    "App ID:",
    appId ? `${appId.substring(0, 8)}...` : "NOT SET",
  );
  console.log(
    "App Certificate:",
    appCertificate ? `${appCertificate.substring(0, 8)}...` : "NOT SET",
  );
  console.log("Mode:", import.meta.env.MODE);
  console.groupEnd();
}