import React from 'react';
import DPDPUserRightsPortal from '../../components/dpdp/DPDPUserRightsPortal';

export default function PrivacyRightsPanel({ studentData, profile }) {
  const email = studentData?.email || profile?.email || '';

  return (
    <div className="w-full pb-16 animate-in fade-in duration-200">
      <DPDPUserRightsPortal userEmail={email} hideSubProcessors={true} />
    </div>
  );
}
