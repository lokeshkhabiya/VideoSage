import { jwtVerify, JWTPayload } from "jose";

interface MyJWTPayload extends JWTPayload {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export async function verifyJwtToken(
  token: string,
  secret: string
): Promise<MyJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as MyJWTPayload;
  } catch (error) {
    console.error("Failed to verify JWT:", error);
    return null; // Return null if the token is invalid
  }
}
