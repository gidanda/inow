import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";

import { parseBody } from "../../common/validation";
import { AuthService } from "./auth.service";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

const verificationConfirmSchema = z.object({
  signup_session_id: z.string().min(1),
  code: z.string().min(1)
});

const onboardingSchema = z.object({
  signup_session_id: z.string().min(1),
  last_name: z.string().min(1).max(50),
  first_name: z.string().min(1).max(50),
  birth_date: z.string().min(1),
  user_id: z.string().min(3).max(50),
  display_name: z.string().min(1).max(30),
  profile_image_url: z.string().optional()
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signUp(@Body() body: Record<string, unknown>) {
    const input = parseBody(signUpSchema, body);
    return this.authService.signUp(input.email, input.password);
  }

  @Post("verification/confirm")
  confirmVerification(@Body() body: Record<string, unknown>) {
    const input = parseBody(verificationConfirmSchema, body);
    return this.authService.confirmVerification(input.signup_session_id, input.code);
  }

  @Post("verification/resend")
  resendVerification(@Body() body: Record<string, unknown>) {
    const input = parseBody(z.object({ signup_session_id: z.string().min(1) }), body);
    return this.authService.resendVerification(input.signup_session_id);
  }

  @Post("onboarding")
  onboarding(@Body() body: Record<string, unknown>) {
    const input = parseBody(onboardingSchema, body);
    return this.authService.onboarding(input);
  }

  @Post("login")
  login(@Body() body: Record<string, unknown>) {
    const input = parseBody(loginSchema, body);
    return this.authService.login(input.email, input.password);
  }

  @Post("logout")
  logout() {
    return this.authService.logout();
  }
}
