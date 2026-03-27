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
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
