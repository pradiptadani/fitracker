import { notFound } from 'next/navigation';
import { SettingsManager } from '@/components/settings/settings-manager';

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const validSections = ['preferences', 'export', 'account', 'security'];

  if (!validSections.includes(section)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold capitalize tracking-tight">{section} Settings</h2>
        <p className="text-muted-foreground">Configure your settings for this section.</p>
      </div>
      <SettingsManager />
    </div>
  );
}
