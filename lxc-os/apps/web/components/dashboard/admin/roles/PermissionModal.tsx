import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/feedback/modal";
import { Button } from "@/components/ui/button";
import { getAllModuleMetadata } from "@/lib/module-metadata";
import { IPermissionObj } from "@/lib/types";

import { toast } from "react-toastify";
import client from "@/lib/api/client";

interface PermissionModalProps {
    open: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export function PermissionModal({ open, onClose, user, onSuccess }: PermissionModalProps) {
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, IPermissionObj>>({});

    const modules = getAllModuleMetadata();

    useEffect(() => {
        if (user && user.userPermissions) {
            const initialPermissions: Record<string, IPermissionObj> = {};

            // Initialize with false for all
            modules.forEach(m => {
                initialPermissions[m.moduleKey] = {
                    create: 0,
                    read: 0,
                    update: 0,
                    delete: 0,
                    managePermissions: 0
                };
            });

            // Overlay with existing permissions
            user.userPermissions.forEach((p: any) => {
                const moduleKey = modules.find(m => m.moduleName.toLowerCase().replace('module', '') === p.moduleName.toLowerCase())?.moduleKey || `${p.moduleName}Module`;
                const bits = p.modulePermission.split("").map((v: string) => parseInt(v));
                initialPermissions[moduleKey] = {
                    create: bits[0] || 0,
                    read: bits[1] || 0,
                    update: bits[2] || 0,
                    delete: bits[3] || 0,
                    managePermissions: bits[4] || 0
                };
            });

            setPermissions(initialPermissions);
        }
    }, [user, open]);

    const handleToggle = (moduleKey: string, field: keyof IPermissionObj) => {
        setPermissions(prev => ({
            ...prev,
            [moduleKey]: {
                ...prev[moduleKey],
                [field]: prev[moduleKey][field] === 1 ? 0 : 1
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = Object.entries(permissions).map(([moduleKey, p]) => {
                const moduleName = modules.find(m => m.moduleKey === moduleKey)?.moduleName.toLowerCase() || moduleKey.replace('Module', '').toLowerCase();
                const modulePermission = `${p.create}${p.read}${p.update}${p.delete}${p.managePermissions}`;
                return { moduleName, modulePermission };
            }).filter(p => p.modulePermission !== "00000"); // Only send if at least one permission is set

            await client.post("/v1/dashboard/admin/roles/permissions", {
                userId: user.id,
                permissions: payload
            });

            toast.success("Permissions updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Save Permissions Error:", error);
            toast.error(error.response?.data?.error || "Failed to update permissions");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Manage Permissions for ${user?.name}`}
            description={`Assign module-level access for ${user?.role}`}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} loading={loading}>Save Permissions</Button>
                </>
            }
        >
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                <div className="grid grid-cols-6 gap-4 font-bold text-xs uppercase text-gray-400 dark:text-slate-400 border-b border-gray-100 dark:border-white/5 pb-2">
                    <div className="col-span-2">Module</div>
                    <div className="text-center">C</div>
                    <div className="text-center">R</div>
                    <div className="text-center">U</div>
                    <div className="text-center">D</div>
                    <div className="text-center">M</div>
                </div>

                {modules.map((m) => {
                    const p = permissions[m.moduleKey] || { create: 0, read: 0, update: 0, delete: 0, managePermissions: 0 };
                    return (
                        <div key={m.moduleKey} className="grid grid-cols-6 gap-4 items-center py-2 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 transition-colors">
                            <div className="col-span-2 flex items-center gap-2">
                                <i className={m.icon + " text-indigo-500 dark:text-indigo-400"}></i>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{m.moduleName}</span>
                            </div>
                            <div className="flex justify-center">
                                <input type="checkbox" checked={p.create === 1} onChange={() => handleToggle(m.moduleKey, "create")} className="accent-indigo-500 rounded" />
                            </div>
                            <div className="flex justify-center">
                                <input type="checkbox" checked={p.read === 1} onChange={() => handleToggle(m.moduleKey, "read")} className="accent-indigo-500 rounded" />
                            </div>
                            <div className="flex justify-center">
                                <input type="checkbox" checked={p.update === 1} onChange={() => handleToggle(m.moduleKey, "update")} className="accent-indigo-500 rounded" />
                            </div>
                            <div className="flex justify-center">
                                <input type="checkbox" checked={p.delete === 1} onChange={() => handleToggle(m.moduleKey, "delete")} className="accent-indigo-500 rounded" />
                            </div>
                            <div className="flex justify-center">
                                <input type="checkbox" checked={p.managePermissions === 1} onChange={() => handleToggle(m.moduleKey, "managePermissions")} className="accent-indigo-500 rounded" />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-300">
                    <span className="font-bold">Legend:</span> C (Create), R (Read), U (Update), D (Delete), M (Manage Permissions)
                </p>
            </div>
        </Modal>
    );
}
