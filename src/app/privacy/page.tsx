import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Kebijakan Privasi (Privacy Policy) - IOnLearn",
  description:
    "Kebijakan Privasi resmi IOnLearn yang mengatur perlindungan data pengguna, integrasi Google Classroom, dan kepatuhan Google API Limited Use Policy.",
  alternates: {
    canonical: "https://www.ionlearn.my.id/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
