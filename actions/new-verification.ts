"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/lib/db";
import { User } from "@prisma/client";

export const newVerification = async (token: string) => {
  console.log(token, "token");
  const existingToken = await getVerificationTokenByToken(token);
  console.log(existingToken, "existign token");
  if (!existingToken) {
    return { error: "Token does not exist!" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = (await getUserByEmail(existingToken.email)) as User;

  if (!existingUser) return { error: "Email does not exist!" };
  await db.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingToken.email },
  });

  await db.verificationToken.delete({ where: { id: existingToken.id } });
  return { success: "Email verified!" };
};
