// src/App.jsx
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

// ---------- CONTRACT TEMPLATES (DIFFERENT PROFESSIONS) ----------
const contractTemplates = [
  {
    id: "service_agreement_webdev",
    profession: "Web Developer",
    name: "Freelance Web Development Agreement",
    description: "Project-based website or web app development for clients.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client / Company Name", type: "text", required: true },
      { name: "provider_name", label: "Developer Name", type: "text", required: true },
      {
        name: "project_scope",
        label: "Project Scope (what you are building)",
        type: "textarea",
        required: true
      },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "Estimated Completion Date", type: "date", required: true },
      { name: "payment_amount", label: "Total Project Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true },
      {
        name: "payment_schedule",
        label: "Payment Schedule (e.g. 50% upfront, 50% on delivery)",
        type: "text",
        required: true
      },
      { name: "late_fee", label: "Late Fee Percentage (0 if none)", type: "number", required: true }
    ],
    body: [
      {
        text: `This Freelance Web Development Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Developer").`
      },
      {
        text: `The Developer agrees to design, build and deliver the following project: {{project_scope}} (the "Project"). The Project will commence on {{start_date}} with an estimated completion date of {{end_date}}.`
      },
      {
        text: `The Client agrees to pay a total fee of {{payment_amount}} {{currency}} for the Project. The agreed payment schedule is as follows: {{payment_schedule}}.`
      },
      {
        showIf: data => Number(data.late_fee) > 0,
        text: `If payment is not made on time, a late fee of {{late_fee}}% may be charged on any overdue amount at the Developer's discretion.`
      },
      {
        text: `All intellectual property in the Project will remain with the Developer until full payment is received. Upon full payment, the Client will receive a license to use the deliverables for its business purposes.`
      },
      {
        text: `This Agreement is governed by the laws of Nigeria, and both parties agree to resolve disputes in good faith before considering legal action.`
      }
    ]
  },
  {
    id: "service_agreement_photography",
    profession: "Photographer",
    name: "Photography Service Agreement",
    description: "Events, portraits, product shoots for clients.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "provider_name", label: "Photographer Name / Studio", type: "text", required: true },
      {
        name: "event_description",
        label: "Event / Shoot Description",
        type: "textarea",
        required: true
      },
      { name: "event_date", label: "Event / Shoot Date", type: "date", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "hours", label: "Number of Hours", type: "number", required: true },
      { name: "payment_amount", label: "Total Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true },
      {
        name: "deliverables",
        label: "Deliverables (e.g. 50 edited photos, online gallery)",
        type: "textarea",
        required: true
      }
    ],
    body: [
      {
        text: `This Photography Service Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Photographer").`
      },
      {
        text: `The Photographer agrees to provide photography services for the following: {{event_description}}, to take place on {{event_date}} at {{location}} for an estimated duration of {{hours}} hours.`
      },
      {
        text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services. Unless otherwise agreed in writing, payment is due on or before the event date.`
      },
      {
        text: `The Photographer will deliver the following after the event: {{deliverables}}. Delivery timelines will be communicated to the Client and may vary depending on workload and editing requirements.`
      },
      {
        text: `The Photographer retains copyright to all images created under this Agreement but grants the Client a personal, non-exclusive license to use the delivered images for personal or business promotion, unless otherwise restricted in writing.`
      },
      {
        text: `This Agreement is governed by the laws of Nigeria. Both parties agree to act in good faith and communicate promptly regarding any changes or issues.`
      }
    ]
  },
  {
    id: "service_agreement_consultant",
    profession: "Business Consultant",
    name: "Consulting Services Agreement",
    description: "Strategy, business, or technical consulting for clients.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client / Company Name", type: "text", required: true },
      { name: "provider_name", label: "Consultant Name", type: "text", required: true },
      {
        name: "service_description",
        label: "Description of Consulting Services",
        type: "textarea",
        required: true
      },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      {
        name: "end_date",
        label: "End Date (or leave blank if ongoing)",
        type: "date",
        required: false
      },
      { name: "rate", label: "Rate (e.g. per month, per session)", type: "text", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      {
        text: `This Consulting Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Consultant").`
      },
      {
        text: `The Consultant agrees to provide the following services to the Client: {{service_description}}. Services will commence on {{start_date}}{{end_date_clause}}.`
      },
      {
        text: `The Client agrees to pay the Consultant at the rate of {{rate}} in {{currency}}. Payment terms and invoicing frequency will be agreed between the parties in writing.`
      },
      {
        text: `Any confidential information shared between the parties will be kept confidential and used only for the purpose of this Agreement.`
      },
      {
        text: `This Agreement is governed by the laws of Nigeria, and any disputes will first be addressed through good faith negotiation.`
      }
    ],
    transformData: data => {
      const end = data.end_date
        ? ` and continue until ${data.end_date}`
        : ` and continue until terminated by either party`;
      return { ...data, end_date_clause: end };
    }
  }
];

// ---------- TEMPLATE RENDER HELPERS ----------
function replacePlaceholders(text, data) {
  return text.replace(/{{(\w+)}}/g, (_, key) =>
    data[key] !== undefined && data[key] !== null ? String(data[key]) : ""
  );
}

function renderContract(template, rawData) {
  if (!template) return "";

  const data = template.transformData ? template.transformData(rawData) : rawData;

  const paragraphs = template.body
    .filter(block => {
      if (typeof block.showIf === "function") return block.showIf(data);
      return true;
    })
    .map(block => replacePlaceholders(block.text, data));

  return paragraphs.join("\n\n");
}

// ---------- SIGNATURE + DOWNLOAD HELPERS ----------
function buildSignatureBlock() {
  return [
    "",
    "Signatures",
    "----------",
    "",
    "Client:",
    "Name: _________________________________",
    "Signature: ____________________________",
    "Date: _________________________________",
    "",
    "Service Provider:",
    "Name: _________________________________",
    "Signature: ____________________________",
    "Date: _________________________________"
  ].join("\n");
}

function slugify(str) {
  return (str || "contract")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function downloadTxt(title, body, signatureBlock) {
  const headerLine = "=".repeat(title.length || 10);
  const fullText = `${title}\n${headerLine}\n\n${body}\n\n${signatureBlock}`;
  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${slugify(title)}.txt`);
}

async function downloadDocx(title, body, signatureBlock) {
  const headerLine = "=".repeat(title.length || 10);
  const paragraphs = [
    new Paragraph({ text: title, heading: "HEADING_1" }),
    new Paragraph(headerLine),
    new Paragraph(""),
    ...body.split("\n\n").map(p => new Paragraph(p)),
    new Paragraph(""),
    ...signatureBlock.split("\n").map(p => new Paragraph(p))
  ];

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(title)}.docx`);
}

function downloadPdf(title, body, signatureBlock) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 55;
  const lineHeight = 14;

  // Header
  doc.setFont("Times", "Bold");
  doc.setFontSize(16);
  doc.text(title || "Contract", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("Times", "Italic");
  doc.text(
    "Generated by your contract tool (to be reviewed by legal counsel).",
    pageWidth / 2,
    65,
    { align: "center" }
  );

  // Body
  doc.setFont("Times", "Normal");
  doc.setFontSize(11);

  const maxWidth = pageWidth - marginX * 2;
  const bodyLines = doc.splitTextToSize(body, maxWidth);
  let cursorY = 95;

  const writeLines = lines => {
    for (const line of lines) {
      if (cursorY > pageHeight - 80) {
        doc.addPage();
        cursorY = 55;
      }
      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    }
  };

  writeLines(bodyLines);

  // Signature section
  const sigLines = signatureBlock.split("\n");

  if (cursorY > pageHeight - 150) {
    doc.addPage();
    cursorY = 55;
  }

  cursorY += 20;
  doc.setFont("Times", "Bold");
  doc.setFontSize(12);
  doc.text("Signatures", marginX, cursorY);
  cursorY += 16;

  doc.setFont("Times", "Normal");
  doc.setFontSize(11);
  writeLines(sigLines);

  doc.save(`${slugify(title)}.pdf`);
}

// ---------- SMALL UI COMPONENT ----------
function StepIndicator({ label, active, done }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <div
        className={[
          "flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
          done
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : active
            ? "border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.4)]"
            : "border-slate-600"
        ].join(" ")}
      >
        {done ? "✓" : ""}
      </div>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

// ---------- MAIN APP ----------
function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    contractTemplates[0]?.id || ""
  );
  const [formData, setFormData] = useState({});
  const [step, setStep] = useState(1); // 1 = choose template, 2 = fill form, 3 = preview & download

  const selectedTemplate = useMemo(
    () => contractTemplates.find(t => t.id === selectedTemplateId),
    [selectedTemplateId]
  );

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step === 1 && selectedTemplate) {
      const initialValues = {};
      selectedTemplate.inputs.forEach(input => {
        initialValues[input.name] = "";
      });
      setFormData(initialValues);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const finalText = useMemo(
    () => renderContract(selectedTemplate, formData),
    [selectedTemplate, formData]
  );

  const title = selectedTemplate?.name || "Contract";
  const signatureBlock = buildSignatureBlock();

  const handleDownloadTxt = () => {
    if (!finalText) return;
    downloadTxt(title, finalText, signatureBlock);
  };

  const handleDownloadDocx = () => {
    if (!finalText) return;
    downloadDocx(title, finalText, signatureBlock);
  };

  const handleDownloadPdf = () => {
    if (!finalText) return;
    downloadPdf(title, finalText, signatureBlock);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <header className="mx-auto mb-6 max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Contract Generator
        </h1>
        <p className="mt-2 text-xs text-slate-400 sm:text-sm">
          Generate profession-specific contracts and download as PDF, DOCX, or TXT.
        </p>
      </header>

      <main className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl shadow-black/60 sm:p-6">
        {/* Steps */}
        <div className="mb-4 flex flex-wrap gap-4">
          <StepIndicator label="1. Choose template" active={step === 1} done={step > 1} />
          <StepIndicator label="2. Fill details" active={step === 2} done={step > 2} />
          <StepIndicator
            label="3. Preview & download"
            active={step === 3}
            done={false}
          />
        </div>

        {/* Content grid */}
        <div className="grid gap-4 md:grid-cols-[1.1fr_minmax(0,1fr)]">
          {/* Left side */}
          <div className="rounded-xl bg-slate-950/60 p-3 sm:p-4">
            {step === 1 && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">
                  Select a contract
                </h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">
                  Pick a template based on the profession and type of work.
                </p>

                <div className="flex flex-col gap-2">
                  {contractTemplates.map(template => {
                    const isActive = template.id === selectedTemplateId;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={[
                          "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                          "bg-slate-950/80 hover:border-slate-500 hover:bg-slate-900",
                          isActive
                            ? "border-blue-400 bg-slate-900/80 shadow-[0_0_0_1px_rgba(96,165,250,0.35)]"
                            : "border-slate-800"
                        ].join(" ")}
                      >
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-300">
                            {template.profession}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Jurisdiction: {template.jurisdiction}
                          </span>
                        </div>
                        <div className="mb-1 text-sm font-semibold text-slate-100">
                          {template.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {template.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {step === 2 && selectedTemplate && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">
                  {selectedTemplate.name}
                </h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">
                  Fill in the details below to generate your contract.
                </p>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="space-y-3"
                >
                  {selectedTemplate.inputs.map(input => (
                    <div key={input.name} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-200 sm:text-sm">
                        {input.label}
                        {input.required && (
                          <span className="ml-1 text-[11px] text-orange-400">*</span>
                        )}
                      </label>
                      {input.type === "textarea" ? (
                        <textarea
                          className="block w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 sm:text-sm"
                          value={formData[input.name] || ""}
                          required={input.required}
                          onChange={e => handleInputChange(input.name, e.target.value)}
                        />
                      ) : (
                        <input
                          className="block w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 sm:text-sm"
                          type={input.type}
                          value={formData[input.name] || ""}
                          required={input.required}
                          onChange={e => handleInputChange(input.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center rounded-full border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 sm:text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-xs font-semibold text-slate-50 shadow-md hover:from-blue-500 hover:to-violet-500 sm:text-sm"
                    >
                      Generate Preview
                    </button>
                  </div>
                </form>
              </section>
            )}

            {step === 3 && selectedTemplate && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">
                  Preview & download
                </h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">
                  Review the contract on the right, then download it in your preferred format.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!finalText}
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    disabled={!finalText}
                    onClick={handleDownloadDocx}
                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    Download DOCX
                  </button>
                  <button
                    type="button"
                    disabled={!finalText}
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    Download TXT
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center rounded-full border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 sm:text-sm"
                  >
                    Back
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right side – preview */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <h3 className="mb-2 text-xs font-medium text-slate-200 sm:text-sm">
              Contract Preview
            </h3>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs sm:text-sm">
              {finalText ? (
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed sm:text-xs">
                  {finalText}
                </pre>
              ) : (
                <p className="text-xs text-slate-500 sm:text-sm">
                  The generated contract text will appear here once you fill the form.
                </p>
              )}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
              <span className="font-semibold text-slate-300">Disclaimer:</span> This tool
              provides general document templates and does not constitute legal advice.
              A qualified lawyer should review and adapt each contract for your specific
              situation and jurisdiction.
            </p>
          </div>
        </div>

        {/* Footer action on step 1 */}
        {step === 1 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={!selectedTemplate}
              onClick={handleNext}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-semibold text-slate-50 shadow-md hover:from-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              Continue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
