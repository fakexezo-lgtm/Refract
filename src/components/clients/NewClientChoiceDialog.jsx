// @ts-nocheck
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon, Upload02Icon } from "@hugeicons/core-free-icons";

export default function NewClientChoiceDialog({ open, onOpenChange, onChooseManual, onChooseImport }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add new client</DialogTitle>
          <DialogDescription className="text-soft mt-1">
            How would you like to add your clients?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 pt-4">
          <button
            onClick={() => {
              onOpenChange(false);
              onChooseManual();
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-hair bg-white hover:bg-whisper transition group text-left"
          >
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-charcoal group-hover:scale-110 transition">
              <HugeiconsIcon icon={UserAdd01Icon} className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-ink">Manual</div>
              <div className="text-sm text-soft">Add a single client manually</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenChange(false);
              onChooseImport();
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-hair bg-white hover:bg-whisper transition group text-left"
          >
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-charcoal group-hover:scale-110 transition">
              <HugeiconsIcon icon={Upload02Icon} className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-ink">Import</div>
              <div className="text-sm text-soft">Upload CSV, Excel, or TXT file</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
