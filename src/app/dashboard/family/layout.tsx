import { FamilySidebar } from '@/components/domain/family/FamilySidebar';

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <FamilySidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}