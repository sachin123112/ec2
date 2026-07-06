import React from 'react';

export default function SettingsPanel({ title, description, badge, actions, children }) {
  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3>{title}</h3>
          {description && <p className="card-note">{description}</p>}
        </div>
        {badge && <span className="section-badge">{badge}</span>}
      </div>
      {children}
      {actions && <div className="settings-panel-actions">{actions}</div>}
    </div>
  );
}
