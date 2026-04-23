// @ts-nocheck
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload02Icon, Delete02Icon, InformationCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/services/apiRoutes";
import { pickAvatarColor } from "@/constants";
import { logActivity } from "@/services/activity";
import { cn } from "@/utils";

export default function ImportClientsDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const [clients, setClients] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStep(1);
    setClients([]);
    setError(null);
    setBusy(false);
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    setIsDragging(false);
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls", "txt"].includes(ext)) {
      setError("Unsupported file type. Please use CSV, Excel, or TXT.");
      return;
    }

    setBusy(true);
    setError(null);

    const reader = new FileReader();

    if (ext === "xlsx" || ext === "xls") {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          processRawData(data);
        } catch (err) {
          setError("Failed to parse Excel file.");
          setBusy(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // CSV or TXT
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          processRawData(results.data);
        },
        error: (err) => {
          setError("Failed to parse file.");
          setBusy(false);
        }
      });
    }
  };

  const processRawData = (data) => {
    if (data.length < 1) {
      setError("File is empty.");
      setBusy(false);
      return;
    }

    // Attempt to map columns
    // We expect: Client Name, Email, Company, Phone Number
    // If headers exist, we use them. Otherwise we assume order.
    let headers = data[0];
    let startIndex = 1;

    // Simple heuristic: if the first row has "name" or "email", it's probably a header
    const hasHeader = headers.some(h => 
      typeof h === "string" && (h.toLowerCase().includes("name") || h.toLowerCase().includes("email") || h.toLowerCase().includes("company"))
    );

    if (!hasHeader) {
      headers = ["name", "email", "company", "phone"];
      startIndex = 0;
    }

    const nameIdx = headers.findIndex(h => typeof h === "string" && h.toLowerCase().includes("name"));
    const emailIdx = headers.findIndex(h => typeof h === "string" && h.toLowerCase().includes("email"));
    const companyIdx = headers.findIndex(h => typeof h === "string" && h.toLowerCase().includes("company"));
    const phoneIdx = headers.findIndex(h => typeof h === "string" && (h.toLowerCase().includes("phone") || h.toLowerCase().includes("tel")));

    const parsedClients = data.slice(startIndex).map((row, idx) => {
      return {
        id: Math.random().toString(36).substr(2, 9), // Local ID for deletion
        name: (nameIdx !== -1 ? row[nameIdx] : row[0]) || "",
        email: (emailIdx !== -1 ? row[emailIdx] : row[1]) || "",
        company: (companyIdx !== -1 ? row[companyIdx] : row[2]) || "",
        phone: (phoneIdx !== -1 ? row[phoneIdx] : row[3]) || "",
      };
    }).filter(c => c.name.toString().trim() !== "");

    setClients(parsedClients);
    setStep(2);
    setBusy(false);
  };

  const removeRow = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleImport = async () => {
    if (clients.length === 0) return;
    setBusy(true);

    try {
      const dataToImport = clients.map(({ id, ...rest }) => ({
        ...rest,
        status: "lead",
        avatar_color: pickAvatarColor(rest.name),
        last_contacted_at: new Date().toISOString(),
      }));

      await apiRoutes.createClients(dataToImport);
      
      // Log activity for the import
      await logActivity({ 
        type: "import_completed", 
        content: `Imported ${clients.length} clients`, 
        metadata: { count: clients.length } 
      });

      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      
      onOpenChange(false);
      reset();
    } catch (err) {
      setError("Failed to import clients. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className={cn("rounded-2xl border-hair bg-white transition-all duration-300 w-[95vw] sm:w-full", step === 2 ? "max-w-4xl" : "max-w-md")}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl sm:text-2xl">
            {step === 1 ? "Import clients" : `Preview (${clients.length} clients)`}
          </DialogTitle>
          <DialogDescription className="text-soft mt-1 text-sm">
            {step === 1 
              ? "Upload a CSV, Excel, or TXT file with client information." 
              : "Review and verify the data before importing. You can remove rows that shouldn't be imported."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="pt-4 sm:pt-6 space-y-4">
            <div 
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                handleFileChange(e);
              }}
              className={cn(
                "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 sm:p-12 transition cursor-pointer",
                isDragging ? "border-charcoal bg-whisper scale-[0.99]" : "border-hair hover:border-charcoal/50 hover:bg-whisper"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv,.xlsx,.xls,.txt" 
                className="hidden" 
              />
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cream flex items-center justify-center text-charcoal mb-4 group-hover:scale-110 transition">
                <HugeiconsIcon icon={Upload02Icon} className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-ink font-medium text-sm sm:text-base">Click to upload or drag and drop</div>
              <div className="text-xs sm:text-sm text-soft mt-1">CSV, Excel, or TXT (Max 5MB)</div>
            </div>

            <div className="p-4 rounded-xl bg-cream/50 border border-hair flex gap-3">
              <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-soft shrink-0 mt-0.5" />
              <div className="text-xs text-soft leading-relaxed">
                <span className="font-semibold block mb-1">Expected columns:</span>
                Name, Email, Company, Phone Number. <br/>
                Don't worry about the order, we'll try to find them automatically!
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 sm:pt-4 space-y-4">
            <div className="max-h-[350px] sm:max-h-[400px] overflow-auto border border-hair rounded-xl bg-white">
              <table className="w-full text-left text-sm border-collapse min-w-[500px] sm:min-w-0">
                <thead className="bg-whisper sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-medium text-soft border-b border-hair">Name</th>
                    <th className="p-3 font-medium text-soft border-b border-hair">Email</th>
                    <th className="p-3 font-medium text-soft border-b border-hair hidden sm:table-cell">Company</th>
                    <th className="p-3 font-medium text-soft border-b border-hair hidden md:table-cell">Phone</th>
                    <th className="p-3 font-medium text-soft border-b border-hair w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair">
                  {clients.map((c) => (
                    <tr key={c.id} className="group hover:bg-whisper/50 transition">
                      <td className="p-3 text-ink font-medium whitespace-nowrap">{c.name}</td>
                      <td className="p-3 text-soft whitespace-nowrap max-w-[150px] sm:max-w-none truncate">{c.email || "—"}</td>
                      <td className="p-3 text-soft whitespace-nowrap hidden sm:table-cell">{c.company || "—"}</td>
                      <td className="p-3 text-soft whitespace-nowrap hidden md:table-cell">{c.phone || "—"}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => removeRow(c.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-soft hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center bg-whisper/50 p-4 rounded-xl border border-hair gap-4">
              <div className="text-sm text-soft">
                Ready to import <span className="font-semibold text-ink">{clients.length}</span> clients
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  disabled={busy}
                  className="rounded-full flex-1 sm:flex-none"
                >
                  Change file
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={busy || clients.length === 0}
                  className="rounded-full bg-charcoal hover:bg-black text-white px-6 relative overflow-hidden flex-1 sm:flex-none"
                >
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                      Confirm Import
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

