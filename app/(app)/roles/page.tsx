import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Roles",
    description: "Role management",
};

export default function RolesPage() {
    return (
        <DialogProvider>
            <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
                        <p className="text-muted-foreground">
                            Manage roles for your application.
                        </p>
                    </div>
                </div>
                {/* <RolesTable /> */}
            </div>
            {/* <RolesDialog /> */}
        </DialogProvider>
    );
}
