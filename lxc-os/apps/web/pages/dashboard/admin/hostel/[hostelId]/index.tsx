import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Loader } from "@/components/ui/feedback/Loader";
import {
    Building, ChevronRight, LayoutGrid, Plus,
    Settings, Users, DoorOpen, Bed
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function ManageHostelPage() {
    const router = useRouter();
    const { hostelId } = router.query;
    const [hostel, setHostel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Stats
    const [stats, setStats] = useState({
        totalRooms: 0,
        totalBeds: 0,
        availableBeds: 0
    });

    const fetchHostelDetails = async () => {
        if (!hostelId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/hostel/${hostelId}?includeHierarchy=true`);
            const data = await res.json();
            if (data && !data.error) {
                setHostel(data);
                // Calculate real-time stats from hierarchy if needed, or use aggregated counts
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostelDetails();
    }, [hostelId]);

    if (loading) return <DashboardLayout role="admin"><div className="flex items-center justify-center min-h-[400px]"><Loader size="lg" /></div></DashboardLayout>;
    if (!hostel) return <DashboardLayout role="admin"><div>Hostel not found</div></DashboardLayout>;

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/dashboard/admin/hostel/infrastructure')}>Infrastructure</span>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <span>{hostel.name}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{hostel.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge>{hostel.type}</Badge>
                            <span className="text-sm text-gray-500 flex items-center">
                                <Users className="w-4 h-4 mr-1" /> Warden: {hostel.warden?.name || "Unassigned"}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                        <AddBlockDialog hostelId={hostelId as string} onSuccess={fetchHostelDetails} />
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="blocks">Blocks & Rooms</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Blocks</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{hostel._count?.blocks || 0}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Rooms</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{hostel._count?.rooms || 0}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Active Allocations</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-green-600">{hostel._count?.allocation || 0}</div></CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="blocks" className="space-y-6 mt-4">
                        {hostel.blocks?.map((block: any) => (
                            <BlockCard key={block.id} block={block} hostelId={hostelId as string} onUpdate={fetchHostelDetails} />
                        ))}
                        {(!hostel.blocks || hostel.blocks.length === 0) && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                                No blocks found. Add a block to get started.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

function AddBlockDialog({ hostelId, onSuccess }: { hostelId: string, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await fetch(`/api/v1/hostel/${hostelId}/infrastructure?type=block`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            toast.success("Block added");
            setOpen(false);
            onSuccess();
        } catch (e) {
            toast.error("Failed to add block");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Block
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Block</DialogTitle>
                    <DialogDescription>Define a new building block for this hostel</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Block Name</Label>
                        <Input placeholder="e.g. Block A" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? <Loader size="sm" variant="white" /> : "Add Block"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function BlockCard({ block, hostelId, onUpdate }: any) {
    return (
        <Card>
            <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <CardTitle className="text-lg">{block.name}</CardTitle>
                </div>
                <AddFloorDialog blockId={block.id} hostelId={hostelId} onSuccess={onUpdate} />
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {block.floors?.map((floor: any) => (
                        <FloorRow key={floor.id} floor={floor} hostelId={hostelId} onUpdate={onUpdate} />
                    ))}
                    {(!block.floors || block.floors.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No floors added.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function AddFloorDialog({ blockId, hostelId, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [number, setNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await fetch(`/api/v1/hostel/${hostelId}/infrastructure?type=floor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blockId, floorNumber: Number(number) })
            });
            toast.success("Floor added");
            setOpen(false);
            onSuccess();
        } catch (e) {
            toast.error("Failed to add floor");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600">
                    <Plus className="w-4 h-4 mr-1" /> Add Floor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Floor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Floor Number</Label>
                        <Input type="number" placeholder="e.g. 1" value={number} onChange={e => setNumber(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? <Loader size="sm" variant="white" /> : "Add"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function FloorRow({ floor, hostelId, onUpdate }: any) {
    return (
        <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-gray-400" />
                    Floor {floor.floorNumber}
                </h4>
                <AddRoomDialog floorId={floor.id} hostelId={hostelId} onSuccess={onUpdate} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {floor.rooms?.map((room: any) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
            {(!floor.rooms || floor.rooms.length === 0) && (
                <p className="text-xs text-gray-400">No rooms configured.</p>
            )}
        </div>
    )
}

function RoomCard({ room }: any) {
    return (
        <div className="border rounded bg-white p-2 text-center hover:border-blue-400 cursor-pointer">
            <div className="font-bold text-gray-800">{room.roomNumber}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Bed className="w-3 h-3" />
                {room.beds?.length || 0} Beds
            </div>
            <Badge variant="outline" className="mt-2 text-[10px] h-5">{room.type}</Badge>
        </div>
    )
}

function AddRoomDialog({ floorId, hostelId, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: "",
        type: "STANDARD",
        capacity: 4,
        baseRent: 2000
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await fetch(`/api/v1/hostel/${hostelId}/infrastructure?type=room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    floorId,
                    ...formData,
                    capacity: Number(formData.capacity),
                    baseRent: Number(formData.baseRent)
                })
            });
            toast.success("Room added");
            setOpen(false);
            onSuccess();
        } catch (e) {
            toast.error("Failed to add room");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                    <Plus className="w-3 h-3 mr-1" /> Add Room
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Room</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Room No</Label>
                        <Input value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STANDARD">Standard</SelectItem>
                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                <SelectItem value="LUXURY">Luxury</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Rent (₹)</Label>
                        <Input type="number" value={formData.baseRent} onChange={e => setFormData({ ...formData, baseRent: Number(e.target.value) })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? <Loader size="sm" variant="white" /> : "Create Room"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
