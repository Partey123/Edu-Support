// Mock implementation - database tables will be created after migration is executed
// This service will handle top-up code generation, validation, and management

export interface CodeRecord {
  id: number;
  code: string;
  code_type: "TOP" | "PROMO" | "INV" | "ACC";
  status: "active" | "used" | "expired";
  used_by_school?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GenerateCodeOptions {
  quantity: number;
  durationDays: number;
  type: "TOP" | "PROMO" | "INV" | "ACC";
}

// Mock storage for codes (use actual Supabase after migration)
const mockCodes: CodeRecord[] = [];
let mockIdCounter = 1;

// Generate a single code with timestamp + random string
function generateSingleCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}${random}`.substring(0, 12);
}

// Generate batch of top-up codes
export async function generateTopUpCodes(
  options: GenerateCodeOptions,
): Promise<{ success: boolean; codes?: CodeRecord[]; message: string }> {
  try {
    const { quantity, durationDays, type } = options;

    if (quantity <= 0 || durationDays <= 0) {
      return {
        success: false,
        message: "Quantity and duration must be greater than 0",
      };
    }

    const generatedCodes: CodeRecord[] = [];

    // Generate unique codes
    for (let i = 0; i < quantity; i++) {
      const newCode: CodeRecord = {
        id: mockIdCounter++,
        code: generateSingleCode(),
        code_type: type,
        status: "active",
        metadata: {
          duration_days: durationDays,
          generated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };
      generatedCodes.push(newCode);
      mockCodes.push(newCode);
    }

    // TODO: After migration, replace with Supabase insert:
    // const { data, error } = await supabase
    //   .from("codes")
    //   .insert(codesToInsert)
    //   .select();

    return {
      success: true,
      codes: generatedCodes,
      message: `Generated ${quantity} ${type} code(s) successfully`,
    };
  } catch (error) {
    console.error("Error generating codes:", error);
    return {
      success: false,
      message: `Failed to generate codes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Get all codes with optional filtering
export async function getAllTopUpCodes(
  codeType?: "TOP" | "PROMO" | "INV" | "ACC",
): Promise<CodeRecord[]> {
  try {
    // TODO: After migration, replace with Supabase query:
    // let query = supabase
    //   .from("codes")
    //   .select("*")
    //   .order("created_at", { ascending: false });
    //
    // if (codeType) {
    //   query = query.eq("code_type", codeType);
    // }
    //
    // const { data, error } = await query;

    if (codeType) {
      return mockCodes.filter((c) => c.code_type === codeType);
    }
    return mockCodes.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } catch (error) {
    console.error("Error fetching codes:", error);
    return [];
  }
}

// Validate and use a code
export async function validateAndUseCode(
  code: string,
  schoolId: string,
): Promise<{ success: boolean; message: string; durationDays?: number }> {
  try {
    const codeRecord = mockCodes.find((c) => c.code === code);

    if (!codeRecord) {
      return { success: false, message: "Code not found" };
    }

    // Check if already used
    if (codeRecord.status === "used") {
      return { success: false, message: "Code has already been used" };
    }

    // Check if expired (assuming codes expire after 30 days if not used)
    const createdDate = new Date(codeRecord.created_at);
    const now = new Date();
    const daysOld = (now.getTime() - createdDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysOld > 30) {
      return { success: false, message: "Code has expired" };
    }

    // Mark code as used
    codeRecord.status = "used";
    codeRecord.used_by_school = schoolId;

    const durationDays = (codeRecord.metadata?.duration_days as number) || 30;

    return {
      success: true,
      message: "Code redeemed successfully",
      durationDays,
    };
  } catch (error) {
    console.error("Error validating code:", error);
    return {
      success: false,
      message: `Failed to validate code: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Get code statistics
export async function getCodeStatistics(): Promise<{
  total: number;
  active: number;
  used: number;
  expired: number;
  byType: Record<string, number>;
}> {
  try {
    const codes = mockCodes;
    const stats = {
      total: codes.length,
      active: 0,
      used: 0,
      expired: 0,
      byType: {
        TOP: 0,
        PROMO: 0,
        INV: 0,
        ACC: 0,
      },
    };

    codes.forEach((code) => {
      // Count by status
      if (code.status === "active") stats.active++;
      else if (code.status === "used") stats.used++;
      else if (code.status === "expired") stats.expired++;

      // Count by type
      stats.byType[code.code_type]++;
    });

    return stats;
  } catch (error) {
    console.error("Error getting code statistics:", error);
    return {
      total: 0,
      active: 0,
      used: 0,
      expired: 0,
      byType: { TOP: 0, PROMO: 0, INV: 0, ACC: 0 },
    };
  }
}

// Generate activation codes in the database
export async function generateActivationCodes(
  quantity: number,
  planId: string,
  expirationDays: number = 30,
): Promise<{ success: boolean; codes?: string[]; message: string }> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");

    const generatedCodes: string[] = [];
    const codesToInsert = [];

    // Generate unique codes
    for (let i = 0; i < quantity; i++) {
      const code = generateSingleCode();
      generatedCodes.push(code);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      codesToInsert.push({
        code,
        plan_id: planId,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });
    }

    // Insert into school_activation_codes table
    const { error } = await supabase
      .from("school_activation_codes")
      .insert(codesToInsert);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      codes: generatedCodes,
      message: `Generated ${quantity} activation code(s) successfully`,
    };
  } catch (error) {
    console.error("Error generating activation codes:", error);
    return {
      success: false,
      message: `Failed to generate activation codes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
