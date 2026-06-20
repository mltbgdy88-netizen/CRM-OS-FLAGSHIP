import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from '@crm-os/shared';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>CRM OS</h1>
      <p>Sprint-01 repository bootstrap web skeleton.</p>
      <div className="card">
        <p>
          Service: <strong>{CRM_OS_SERVICE_NAME}</strong>
        </p>
        <p>
          Version: <strong>{CRM_OS_VERSION}</strong>
        </p>
        <p>
          <Link href="/health">View health/status placeholder</Link>
        </p>
      </div>
    </main>
  );
}
