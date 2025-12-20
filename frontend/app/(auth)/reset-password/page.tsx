"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { ResetPasswordInput, resetPasswordSchema } from "@/schemas/auth.schema";
import { logger } from "@/services/logger.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPassword();

  const [formData, setFormData] = useState<ResetPasswordInput>({
    token: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordInput | "confirmPassword", string>>
  >({});
  const [isTokenFromUrl, setIsTokenFromUrl] = useState(false);

  // Get token from URL if present and auto-fill
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setFormData((prev) => ({ ...prev, token: tokenFromUrl }));
      setIsTokenFromUrl(true);
    }
  }, [searchParams]);

  const handleOTPChange = (value: string) => {
    setFormData((prev) => ({ ...prev, token: value }));
    if (errors.token) {
      setErrors((prev) => ({ ...prev, token: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setFormData((prev) => ({ ...prev, newPassword: value }));
      if (errors.newPassword) {
        setErrors((prev) => ({ ...prev, newPassword: undefined }));
      }
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check password confirmation
    if (formData.newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    // Validate with Zod
    const validation = resetPasswordSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordInput, string>> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ResetPasswordInput] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(formData);
      toast.success("Password reset successful! You can now sign in.");
      router.push("/login");
    } catch (error: any) {
      logger.error("Reset password error:", "Reset Password Page", error);
      const errorMessage = error?.message || "Invalid or expired reset code.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reset Password
        </h1>
        <p className="text-muted-foreground">
          {isTokenFromUrl
            ? "Enter your new password below"
            : "Enter the code from your email and your new password"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="token">Reset Code</Label>
          <div className="flex flex-col items-center gap-2">
            <InputOTP
              maxLength={12}
              value={formData.token}
              onChange={handleOTPChange}
              disabled={resetPasswordMutation.isPending || isTokenFromUrl}
            >
              <InputOTPGroup className="gap-1">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPGroup className="gap-1">
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
              <InputOTPGroup className="gap-1">
                <InputOTPSlot index={8} />
                <InputOTPSlot index={9} />
                <InputOTPSlot index={10} />
                <InputOTPSlot index={11} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errors.token && (
            <p className="text-sm text-destructive text-center">
              {errors.token}
            </p>
          )}
          {isTokenFromUrl ? (
            <p className="text-xs text-success text-center">
              ✓ Reset code loaded from email link
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Enter the 12-character reset code sent to your email
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handlePasswordChange}
            disabled={resetPasswordMutation.isPending}
            className={errors.newPassword ? "border-destructive" : ""}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, number, and
            special character
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handlePasswordChange}
            disabled={resetPasswordMutation.isPending}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Resend
          </Link>
        </p>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline block"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
