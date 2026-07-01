import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from '@crm-os/shared';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="public-page">
      <div className="public-page__card">
        <p className="login-page__brand">CRM OS</p>
        <h1>Akıllı CRM İşletim Sistemi</h1>
        <p className="login-page__panel-sub">Yerel geliştirme giriş noktası</p>
        <div className="public-page__links">
          <p>
            Servis: <strong>{CRM_OS_SERVICE_NAME}</strong> · v{CRM_OS_VERSION}
          </p>
          <Link href="/login" className="btn-primary btn-primary--full">
            Giriş Yap →
          </Link>
          <Link href="/dashboard">Gösterge Paneli (oturum gerekir)</Link>
          <Link href="/customers">Müşteriler (oturum gerekir)</Link>
          <Link href="/health">Sistem durumu</Link>
        </div>
      </div>
    </main>
  );
}
