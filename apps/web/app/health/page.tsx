import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from '@crm-os/shared';

export default function HealthPage() {
  return (
    <main>
      <h1>Health / Status</h1>
      <div className="card">
        <p>
          Web status: <strong>ok</strong>
        </p>
        <p>
          Service: <strong>{CRM_OS_SERVICE_NAME}</strong>
        </p>
        <p>
          Version: <strong>{CRM_OS_VERSION}</strong>
        </p>
        <p>API health is served separately at the API app `/health` endpoint.</p>
      </div>
    </main>
  );
}
