import React from 'react';
import DPDPUserRightsPortal from '../../components/dpdp/DPDPUserRightsPortal';

export default function PrivacyRightsPanel({ studentData }) {
  const email = studentData?.email || '';

  return (
    <div className="space-y-6">
      <DPDPUserRightsPortal userEmail={email} />
    </div>
  );
}
