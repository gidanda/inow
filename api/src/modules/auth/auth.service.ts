import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class AuthService {
  constructor(private readonly repository: InowRepository) {}

  async signUp(email: string, password: string) {
    if (await this.repository.findUserByEmail(email)) {
      return {
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already registered"
        }
      };
    }

    const session = await this.repository.createSignupSession({
      email,
      passwordDigest: password,
      verificationCode: "123456",
      isVerified: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString()
    });

    return {
      signup_session_id: session.id,
      email,
      verification_required: true
    };
  }

  async confirmVerification(signupSessionId: string, code: string) {
    const session = await this.repository.findSignupSessionById(signupSessionId);

    if (!session || session.verificationCode !== code) {
      return {
        error: {
          code: "INVALID_VERIFICATION_CODE",
          message: "Verification failed"
        }
      };
    }

    await this.repository.verifySignupSession(signupSessionId);

    return {
      signup_session_id: session.id,
      verified: true,
      onboarding_required: true
    };
  }

  async resendVerification(signupSessionId: string) {
    const session = await this.repository.findSignupSessionById(signupSessionId);

    return {
      signup_session_id: session?.id ?? signupSessionId,
      resent: Boolean(session)
    };
  }

  async onboarding(input: {
    signup_session_id: string;
    last_name: string;
    first_name: string;
    birth_date: string;
    user_id: string;
    display_name: string;
    profile_image_url?: string;
  }) {
    const session = await this.repository.findSignupSessionById(input.signup_session_id);

    if (!session || !session.isVerified) {
      return {
        error: {
          code: "SIGNUP_SESSION_INVALID",
          message: "Signup session is invalid"
        }
      };
    }

    if (await this.repository.hasUserId(input.user_id)) {
      return {
        error: {
          code: "USER_ID_ALREADY_EXISTS",
          message: "User ID already exists"
        }
      };
    }

    const createdAt = new Date().toISOString();
    const user = await this.repository.createUser({
      userId: input.user_id,
      email: session.email,
      passwordDigest: session.passwordDigest,
      lastName: input.last_name,
      firstName: input.first_name,
      birthDate: input.birth_date,
      displayName: input.display_name,
      profileImageUrl: input.profile_image_url,
      createdAt
    });

    const defaultMaps = await this.repository.createDefaultMapsForUser(user.id, createdAt);

    return {
      access_token: user.id,
      refresh_token: `${user.id}_refresh`,
      user: {
        id: user.id,
        user_id: input.user_id,
        display_name: input.display_name
      },
      default_maps: defaultMaps.map((map) => ({ id: map.id, title: map.title }))
    };
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email);

    if (!user || password !== user.passwordDigest) {
      return {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is invalid"
        }
      };
    }

    return {
      access_token: user.id,
      refresh_token: `${user.id}_refresh`,
      user: {
        id: user.id,
        user_id: user.userId,
        display_name: user.displayName
      }
    };
  }

  logout() {
    return { success: true };
  }
}
