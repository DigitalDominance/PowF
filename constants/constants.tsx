import { FileText, Lock, Users, CheckCircle } from "lucide-react";

export const instructionSteps = [
  {
    icon: <FileText className="h-8 w-8 text-accent" />,
    title: "Create Your Listing",
    description:
      "Define job requirements, payment terms, and duration. All terms are locked in smart contracts.",
  },
  {
    icon: <Lock className="h-8 w-8 text-accent" />,
    title: "Lock Funds",
    description:
      "Deposit KAS tokens into the job contract. Funds are held securely until work completion.",
  },
  {
    icon: <Users className="h-8 w-8 text-accent" />,
    title: "Review Applicants",
    description:
      "Browse worker profiles, check on-chain reputation scores, and select the best candidates.",
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-accent" />,
    title: "Automatic Payments",
    description:
      "Workers get paid automatically based on your predefined schedule. No manual intervention needed.",
  },
];