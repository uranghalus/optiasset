// import { FloatingThemeMenu } from "@/components/floating-theme-menu";
// import LoginForm from "@/components/login-form";
import LoginForm from "@/components/login-form";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Masuk",
    description: "Dashboard page",
};
export default function Home() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-start sm:px-4 px-4">
                <h2 className="text-lg font-semibold tracking-tight">Sign in</h2>
                <p className="text-muted-foreground text-sm">
                    Masukkan email dan kata sandi Anda di bawah ini <br /> untuk masuk ke
                    akun Anda
                </p>
            </div>

            <Suspense>
                <LoginForm />
            </Suspense>
            <div className="flex justify-center text-sm">
                <p className="text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link
                        href="/signup"
                        className="text-primary hover:underline font-semibold"
                    >
                        Daftar Sekarang
                    </Link>
                </p>
            </div>
            <p className="text-muted-foreground px-8 text-center text-sm">
                Dengan mengklik masuk, Anda menyetujui{" "}
                <a
                    href="/terms"
                    className="hover:text-primary underline underline-offset-4"
                >
                    Ketentuan Layanan
                </a>{" "}
                dan{" "}
                <a
                    href="/privacy"
                    className="hover:text-primary underline underline-offset-4 font-bold"
                >
                    Kebijakan Privasi
                </a>
                .
            </p>
            {/* <FloatingThemeMenu /> */}
        </>
    );
}
