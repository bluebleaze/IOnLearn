"use client";

import React from "react";
import { UserPreferences } from "../types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { OnboardingFlow } from "./OnboardingFlow";

interface OnboardingModalProps {
  isOpen: boolean;
  onSave: (prefs: UserPreferences) => void;
  onSkip: () => void;
  isSettingsMode?: boolean;
}

export function OnboardingModal({
  isOpen,
  onSave,
  onSkip,
  isSettingsMode = false,
}: OnboardingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent
        className="max-w-2xl w-[95vw] p-0 overflow-hidden border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#121214] text-slate-900 dark:text-[#f5f5f5] shadow-2xl rounded-3xl"
        hideCloseButton={true}
      >
        <DialogTitle className="sr-only">Personalisasi IOnLearn</DialogTitle>
        <DialogDescription className="sr-only">
          Atur gaya belajar dan preferensi AI Tutor Anda
        </DialogDescription>
        <OnboardingFlow
          isModal={true}
          onComplete={(prefs) => {
            onSave(prefs);
          }}
          onSkip={onSkip}
        />
      </DialogContent>
    </Dialog>
  );
}
