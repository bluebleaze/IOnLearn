import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Ketentuan Layanan (Terms of Service) - IOnLearn",
  description:
    "Ketentuan Layanan resmi penggunaan platform IOnLearn, integrasi Google Classroom, dan asisten belajar berbasis kecerdasan buatan.",
  alternates: {
    canonical: "https://www.ionlearn.my.id/terms",
  },
};

export default function TermsOfServicePage() {
  return <TermsContent />;
}
