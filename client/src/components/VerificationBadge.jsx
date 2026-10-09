import React from 'react';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export const VerificationBadge = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="badge badge-verified" title="Identity & Skill Documents Verified by Admin">
        <ShieldCheck size={13} color="#15803d" /> Verified Provider
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="badge badge-pending" title="Verification under Admin Review">
        <Clock size={13} color="#b45309" /> Verification Pending
      </span>
    );
  }

  return (
    <span className="badge badge-unverified" title="Unverified Account">
      <AlertCircle size={13} color="#64748b" /> Unverified
    </span>
  );
};
