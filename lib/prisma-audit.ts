/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { createDiff } from './audit-diff';
import { getContext } from './context';

export const auditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'audit-extension',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const executeQuery = query as (args: any) => Promise<any>;

          if (!model) return executeQuery(args);

          // All mutation operations we want to audit
          const AUDIT_OPERATIONS = [
            'create',
            'update',
            'delete',
            'upsert',
            'createMany',
            'updateMany',
            'deleteMany',
          ];

          if (!AUDIT_OPERATIONS.includes(operation)) {
            return executeQuery(args);
          }

          // Skip AuditLog and ActivityLog to avoid recursion or redundant logging
          if (
            (model as string) === 'AuditLog' ||
            (model as string) === 'ActivityLog'
          ) {
            return executeQuery(args);
          }

          const context = getContext();
          const { userId, organizationId } = context;

          let oldData: any = null;

          // For single record updates/deletes, try to get the old state for diffing
          if (
            operation === 'update' ||
            operation === 'delete' ||
            operation === 'upsert'
          ) {
            if (args?.where && !operation.endsWith('Many')) {
              const delegate = (client as any)[model as keyof typeof client];
              if (delegate?.findUnique) {
                try {
                  oldData = await delegate.findUnique({
                    where: args.where,
                  });
                } catch (e) {
                  // Ignore errors in fetching old data
                }
              }
            }
          }

          const result = await executeQuery(args);

          // Only log if we have a context (at least a userId or organizationId)
          if (organizationId || userId) {
            try {
              // Extract a meaningful record ID
              let recordId: any = '';
              const anyArgs = args as any;

              if (result) {
                recordId =
                  result.id ||
                  result.id_barang ||
                  result.id_department ||
                  result.id_divisi ||
                  result.id_karyawan ||
                  '';
              }
              if (!recordId && oldData) {
                recordId =
                  oldData.id ||
                  oldData.id_barang ||
                  oldData.id_department ||
                  oldData.id_divisi ||
                  oldData.id_karyawan ||
                  '';
              }
              if (!recordId && anyArgs?.where?.id) recordId = anyArgs.where.id;
              if (!recordId && anyArgs?.where?.id_barang)
                recordId = anyArgs.where.id_barang;

              await (client as any).auditLog.create({
                data: {
                  model,
                  action: operation,
                  recordId: recordId ? String(recordId) : '',
                  changes: createDiff(oldData, result),
                  userId: userId || null,
                  organizationId: organizationId || null,
                },
              });
            } catch (err) {
              console.error(
                `[AuditExtension] Error saving log for ${model}.${operation}:`,
                err,
              );
            }
          }

          return result;
        },
      },
    },
  });
});
