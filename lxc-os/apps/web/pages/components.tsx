import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

type UserRow = {
  name: string;
  role: string;
  status: string;
};

const sampleUsers: UserRow[] = [
  { name: "Alice Johnson", role: "Admin", status: "Active" },
  { name: "Bob Smith", role: "Teacher", status: "Invited" },
  { name: "Charlie Lee", role: "Student", status: "Suspended" },
];

const userColumns: ColumnDef<UserRow>[] = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "role",
    header: "Role",
  },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      const tone =
        value === "Active"
          ? "success"
          : value === "Invited"
          ? "info"
          : "warning";
      return <Badge tone={tone as any}>{value}</Badge>;
    },
  },
];

export default function ComponentsShowcasePage() {
  return (
    <>
      <Head>
        <title>UI Components – LearnXChain</title>
      </Head>
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              UI Components
            </h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Browse live examples of the core UI components used across
              LearnXChain. Use this page as a quick reference while building new
              screens.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-lg font-medium tracking-tight">Buttons</h2>
            <Card>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Default button</Button>
                <Button variant="ghost">Ghost button</Button>
                <Button disabled>Disabled</Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium tracking-tight">Badges</h2>
            <Card>
              <CardContent className="flex flex-wrap gap-3">
                <Badge>Accent</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="warning">Warning</Badge>
                <Badge tone="danger">Danger</Badge>
                <Badge tone="info">Info</Badge>
                <Badge tone="neutral">Neutral</Badge>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium tracking-tight">Cards</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card accent="indigo">
                <CardHeader>
                  <CardTitle>Soft card</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Default soft variant with indigo accent.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card variant="solid" accent="emerald">
                <CardHeader>
                  <CardTitle>Solid card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs opacity-90">
                    High emphasis card with gradient background.
                  </p>
                </CardContent>
              </Card>
              <Card variant="outline" accent="rose">
                <CardHeader>
                  <CardTitle>Outline card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300">
                    Subtle outline card for low-emphasis content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium tracking-tight">Form fields</h2>
            <Card>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="Enter first name"
                  description="Basic text input"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error="This field is required"
                />
                <Select
                  label="Role"
                  description="Simple select with options"
                  options={[
                    { label: "Select role", value: "" },
                    { label: "Admin", value: "admin" },
                    { label: "Teacher", value: "teacher" },
                    { label: "Student", value: "student" },
                  ]}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium tracking-tight">Data table</h2>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Users table</CardTitle>
                  <CardDescription>
                    Example usage of the generic `DataTable` component.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable<UserRow>
                  columns={userColumns}
                  data={sampleUsers}
                  dense
                  striped
                  clickableRows
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}


