import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { uploadFile } from "@/lib/config/upload";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { UserSex } from "@prisma/client";

export interface RegisterAccountInput {
    name: string;
    userName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    sex: UserSex;
    bloodType: string;
    schoolId: string;
    profilePicBuffer: Buffer;
    profilePicName: string;
}

export const registerAccountService = async (data: RegisterAccountInput) => {
    // 1. Upload Profile Pic
    const profilePicUpload = await uploadFile(data.profilePicBuffer, "profile_pics", "image", data.profilePicName);

    // 2. Passwords
    const tempPassword = randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Transaction
    const [user, account] = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                userName: data.userName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
                sex: data.sex,
                bloodType: data.bloodType,
                profilePic: profilePicUpload.url,
                password: hashedPassword,
                role: "account",
                schoolId: data.schoolId,
            },
        });

        const account = await tx.userAccount.create({
            data: {
                userId: user.id,
                schoolId: data.schoolId,
            },
        });

        return [user, account];
    });

    // 4. Send Email (Non-blocking usually, but await/catch here)
    try {
        const loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'http://localhost:3000/login';
        await renderAndSendEmail(
            "account-registration",
            {
                email: data.email,
                password: tempPassword,
                loginUrl,
            },
            "Account Registration Successful",
            data.email
        );
    } catch (e) {
        console.error("Account email failed", e);
    }

    return {
        user,
        account,
        tempPassword
    };
}
