import { CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { Badge } from "../ui/badge";
import type { MCPServer, ServerStatus } from "../../types/server";

// Warning threshold: 5 minutes in milliseconds
const WARNING_THRESHOLD_MS = 5 * 60 * 1000;

function getServerStatus(server: MCPServer): ServerStatus {
  if (!server.enabled) return "draft";
  if (!server.reachable) return "offline";

  // Warning: if last_seen is older than the threshold
  if (server.last_seen) {
    const lastSeenDate = new Date(server.last_seen);
    const thresholdDate = new Date(Date.now() - WARNING_THRESHOLD_MS);
    if (lastSeenDate < thresholdDate) return "warning";
  }

  return "active";
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: FileText,
    variant: "draft" as const,
  },
  active: {
    label: "Active",
    icon: CheckCircle2,
    variant: "success" as const,
  },
  offline: {
    label: "Offline",
    icon: XCircle,
    variant: "destructive" as const,
  },
  warning: {
    label: "Warning",
    icon: AlertCircle,
    variant: "warning" as const,
  },
};

interface ServerStatusBadgeProps {
  server: MCPServer;
}

export function ServerStatusBadge({ server }: ServerStatusBadgeProps) {
  const status = getServerStatus(server);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
