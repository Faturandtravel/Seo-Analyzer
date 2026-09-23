import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

type CheckStatus = 'passed' | 'warning' | 'critical' | 'info';

interface CheckItemProps {
  label: string;
  value?: string | number | React.ReactNode;
  status: CheckStatus;
  detail?: string;
}

const icons: Record<CheckStatus, React.ReactNode> = {
  passed: <CheckCircle2 size={13} className="check-icon passed" />,
  warning: <AlertTriangle size={13} className="check-icon warning" />,
  critical: <XCircle size={13} className="check-icon critical" />,
  info: <Info size={13} className="check-icon info" />,
};

export const CheckItem: React.FC<CheckItemProps> = ({ label, value, status, detail }) => {
  return (
    <div className={`check-item check-item--${status}`}>
      <div className="check-item-left">
        {icons[status]}
        <div className="check-item-text">
          <span className="check-item-label">{label}</span>
          {detail && <span className="check-item-detail">{detail}</span>}
        </div>
      </div>
      {value !== undefined && (
        <span className={`check-item-value check-item-value--${status}`}>{value}</span>
      )}
    </div>
  );
};
