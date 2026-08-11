import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "./emailService";

/**
 * Request password reset - generates token and sends email
 */
export const requestPasswordResetService = async (email: string) => {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate a password reset token
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  // Save the token in the PasswordResetToken table
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Send the password reset email with the token
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetLink);

  return {
    message: "Password reset link has been sent to your email.",
  };
};

/**
 * Reset password using token
 */
export const resetPasswordService = async (token: string, newPassword: string) => {
  // Find the password reset token in the database
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error("Invalid or expired token");
  }

  // Check if the token has expired
  if (resetToken.expiresAt < new Date()) {
    throw new Error("Token has expired");
  }

  // Check if the token has already been used
  if (resetToken.usedAt) {
    throw new Error("Token has already been used");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // Mark the token as used
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return {
    message: "Password has been reset successfully.",
  };
};

/**
 * Change password for authenticated user
 */
export const changePasswordService = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  // Find the user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has a password set
  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  // Compare the old password with the stored password hash
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw new Error("Old password is incorrect");
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return {
    message: "Password has been updated successfully.",
  };
};
