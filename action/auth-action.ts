/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/schema/auth-schema';
import { ActionState } from '@/types';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface AuthPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export async function loginAction(formData: AuthPayload): Promise<ActionState> {
  try {
    const parsed = LoginSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: {
          email: parsed.error.format().email?._errors[0] ?? '',
          password: parsed.error.format().password?._errors[0] ?? '',
        },
        message: 'Data login tidak valid',
      };
    }

    const { email, password, rememberMe } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return {
        status: 'error',
        fieldErrors: {
          email: 'Email belum terdaftar',
        },
        message: 'Email belum terdaftar',
      };
    }

    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: rememberMe ?? false,
      },
      headers: await headers(),
    });

    return {
      status: 'success',
      message: 'Login berhasil',
    };
  } catch (error: any) {
    console.error('LOGIN ERROR FULL:', error);

    // better-auth throws APIError with a message + status
    const message: string =
      error?.body?.message ?? error?.message ?? 'Terjadi kesalahan';

    // Map known better-auth error messages to user-friendly Indonesian messages
    if (
      message.toLowerCase().includes('invalid email or password') ||
      message.toLowerCase().includes('invalid credentials')
    ) {
      return { status: 'error', message: 'Email atau password salah' };
    }

    if (message.toLowerCase().includes('email is not verified')) {
      return {
        status: 'error',
        message: 'Email belum diverifikasi. Silakan cek inbox email Anda.',
      };
    }

    return {
      status: 'error',
      message,
    };
  }
}

// export async function validateNIKAction(nik: string) {
//   try {
//     const employee = await prisma.karyawan.findFirst({
//       where: { nik, deleted_at: null },
//       include: {
//         divisi_fk: {
//           include: {
//             department: true,
//           },
//         },
//       },
//     });

//     if (!employee) {
//       return {
//         status: 'error',
//         message:
//           'NIK tidak ditemukan. Silakan hubungi HR untuk mendaftarkan data karyawan Anda.',
//       };
//     }

//     if (employee.userId) {
//       return {
//         status: 'error',
//         message:
//           'Akun untuk NIK ini sudah terdaftar. Silakan login atau hubungi admin jika Anda lupa password.',
//       };
//     }

//     return {
//       status: 'success',
//       data: {
//         id_karyawan: employee.id_karyawan,
//         nama: employee.nama,
//         organization_id: employee.organization_id,
//         jabatan: employee.jabatan,
//       },
//     };
//   } catch (error) {
//     console.error('NIK validation error:', error);
//     return {
//       status: 'error',
//       message: 'Terjadi kesalahan saat memvalidasi NIK.',
//     };
//   }
// }

// export async function signupWithNIKAction(data: any) {
//   try {
//     const { nik, email, username, password, name } = data;

//     // 1. Double check NIK
//     const employee = await prisma.karyawan.findFirst({
//       where: { nik, deleted_at: null },
//     });

//     if (!employee) {
//       return { status: 'error', message: 'NIK tidak valid.' };
//     }

//     if (employee.userId) {
//       return {
//         status: 'error',
//         message: 'Akun untuk NIK ini sudah terdaftar.',
//       };
//     }

//     // 2. Create User
//     const newUser = await auth.api.createUser({
//       body: {
//         email,
//         password,
//         name,
//         role: 'user',
//         data: {
//           employeeId: employee.id_karyawan,
//           username,
//         },
//       },
//     });

//     if (!newUser) {
//       return { status: 'error', message: 'Gagal membuat akun user.' };
//     }

//     const userId = newUser.user.id;

//     // 3. Add to Organization
//     const organizationId = employee.organization_id;
//     let roleToAssign = 'member';

//     if (employee.jabatan) {
//       const roleExists = await prisma.organizationRole.findFirst({
//         where: {
//           organizationId,
//           role: employee.jabatan,
//         },
//       });
//       if (roleExists) {
//         roleToAssign = employee.jabatan;
//       }
//     }

//     await auth.api.addMember({
//       body: {
//         userId,
//         organizationId,
//         role: roleToAssign as any,
//       },
//       headers: await headers(),
//     });

//     // 4. Link back to Karyawan
//     await prisma.karyawan.update({
//       where: { id_karyawan: employee.id_karyawan },
//       data: { userId },
//     });

//     return {
//       status: 'success',
//       message: 'Registrasi berhasil. Silakan login.',
//     };
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     return {
//       status: 'error',
//       message: error.message || 'Terjadi kesalahan saat registrasi.',
//     };
//   }
// }
