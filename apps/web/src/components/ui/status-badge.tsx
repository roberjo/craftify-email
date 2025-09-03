import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TemplateStatus } from "@/types";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        draft: "bg-muted text-muted-foreground",
        pending_approval: "bg-warning/10 text-warning border border-warning/20",
        approved: "bg-success/10 text-success border border-success/20",
        archived: "bg-status-archived/10 text-status-archived border border-status-archived/20",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: TemplateStatus;
}

const statusLabels: Record<TemplateStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  archived: "Archived",
};

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {statusLabels[status]}
    </div>
  );
}