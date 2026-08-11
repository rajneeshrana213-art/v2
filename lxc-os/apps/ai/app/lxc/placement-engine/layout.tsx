import './style.css';

export const metadata = {
  title: 'SDE Masterclass Hub & Placement Launchpad',
  description: 'Consolidated SDE Masterclass Hub Launcher and Handbook Reading Viewer.',
};

export default function PlacementEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
