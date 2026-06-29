interface AdminLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: Record<string, unknown>;
}

const adminLogs: AdminLog[] = [];

export function logAdminAction(
  adminEmail: string,
  action: string,
  details: Record<string, unknown>
): void {
  const log: AdminLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    adminEmail,
    action,
    details,
  };
  
  adminLogs.unshift(log);
  
  if (adminLogs.length > 1000) {
    adminLogs.pop();
  }
  
  console.log(`[ADMIN] ${adminEmail} - ${action}:`, JSON.stringify(details));
}

export function getAdminLogs(limit: number = 100): AdminLog[] {
  return adminLogs.slice(0, limit);
}
