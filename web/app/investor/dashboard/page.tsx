import { redirect } from 'next/navigation';

/**
 * The investor and inventor dashboards were unified into a single /dashboard
 * (Portfolio is now a tab there). This route stays as a redirect so existing
 * bookmarks and links keep working.
 */
export default function InvestorDashboardRedirect() {
  redirect('/dashboard');
}
