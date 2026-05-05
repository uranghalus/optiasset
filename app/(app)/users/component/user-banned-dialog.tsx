'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BanUserInput } from '@/schema/user-schema';
import { banUserSchema } from '@/schema/user-schema';
import { useBanUser } from '@/hooks/crud/use-users';
import { User } from '@/generated/prisma';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: User;
};

export default function BanUserForm({ open, onOpenChange, currentRow }: Props) {
    // Ambil fungsi mutate dan status loading dari React Query
    const { mutate: banUser, isPending } = useBanUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BanUserInput>({
        resolver: zodResolver(banUserSchema),
        defaultValues: {
            banReason: '',
            banExpiresInDays: 7, // Default 7 hari
        },
    });

    const onSubmit = (data: BanUserInput) => {
        // Panggil mutate dari React Query. 
        // Sesuai dengan hook Anda, parameternya adalah { id, data }
        banUser({ id: currentRow?.id as string, data });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ban User</DialogTitle>
                    <DialogDescription>
                        Form untuk memban user
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="banReason" className="block text-sm font-medium">
                            Alasan Banned
                        </label>
                        <textarea
                            id="banReason"
                            {...register('banReason')}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Contoh: Melanggar aturan"
                            rows={3}
                            disabled={isPending}
                        />
                        {errors.banReason && (
                            <p className="text-red-500 text-xs">{errors.banReason.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="banExpiresInDays" className="block text-sm font-medium">
                            Durasi Ban (Hari)
                        </label>
                        <input
                            id="banExpiresInDays"
                            type="number"
                            {...register('banExpiresInDays', { valueAsNumber: true })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={isPending}
                        />
                        <p className="text-xs text-gray-500">
                            Biarkan kosong jika ingin ban permanen.
                        </p>
                        {errors.banExpiresInDays && (
                            <p className="text-red-500 text-xs">{errors.banExpiresInDays.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        {onOpenChange && (
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                        >
                            {isPending ? 'Memproses...' : 'Ban User'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}