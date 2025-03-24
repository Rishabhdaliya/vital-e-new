import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const roles = [
  {
    value: "DEALER",
    label: "Dealer",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "RETAILER",
    label: "Retailer",
    icon: CircleIcon,
  },
  {
    value: "CUSTOMER",
    label: "Customer",
    icon: StopwatchIcon,
  },
  {
    value: "ADMIN",
    label: "Admin",
    icon: CheckCircledIcon,
  },
];
