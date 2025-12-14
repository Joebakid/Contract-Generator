// src/App.jsx
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
// import logo from "./assets/logo.png";
import { Analytics } from "@vercel/analytics/react"


// ---------- CONTRACT TEMPLATES (DIFFERENT PROFESSIONS) ----------
const contractTemplates = [
    {
  id: "service_agreement_short_term",
  profession: "Short-Term / One-Time",
  name: "Short-Term Services Agreement",
  description: "One-day, few-days, or bi-weekly service contract.",
  jurisdiction: "Nigeria",
  inputs: [
    { name: "client_name", label: "Client Name", type: "text", required: true },
    { name: "provider_name", label: "Service Provider Name", type: "text", required: true },
    { name: "service_description", label: "Service Description", type: "textarea", required: true },

    {
      name: "contract_type",
      label: "Contract Duration Type (one-day, date-range, bi-weekly)",
      type: "text",
      required: true
    },

    { name: "start_date", label: "Start Date", type: "date", required: true },
    { name: "end_date", label: "End Date (if applicable)", type: "date", required: false },

    {
      name: "biweekly_periods",
      label: "Number of Bi-Weekly Periods (if bi-weekly)",
      type: "number",
      required: false
    },

    { name: "payment_amount", label: "Total Payment", type: "number", required: true },
    { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
  ],

  body: [
    {
      text: `This Short-Term Services Agreement  is entered into between {{client_name}} ("Client") and {{provider_name}} ("Service Provider").`
    },
    {
      text: `The Service Provider agrees to provide the following services: {{service_description}}.`
    },
    {
      text: `This Agreement shall commence on {{start_date}}{{duration_clause}}.`
    },
    {
      text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services provided under this Agreement. Payment is due upon completion unless otherwise agreed in writing.`
    },
    {
      text: `This Agreement automatically terminates upon completion of the agreed services without further notice.`
    },
    {
      text: `This Agreement is governed by the laws of Nigeria.`
    }
  ],

  transformData: data => {
    let duration = "";

    if (data.contract_type?.toLowerCase().includes("one")) {
      duration = " and shall be valid for a single day only";
    } 
    else if (data.contract_type?.toLowerCase().includes("bi")) {
      duration = ` and shall run on a bi-weekly basis for ${data.biweekly_periods || "an agreed number of"} periods`;
    } 
    else if (data.end_date) {
      duration = ` and shall continue until ${data.end_date}`;
    } 
    else {
      duration = " and shall continue until completion of the services";
    }

    return {
      ...data,
      duration_clause: duration
    };
  }
},
{
  id: "service_agreement_uiux",
  profession: "UI / UX Designer",
  name: "UI / UX Design Services Agreement",
  description: "User interface and user experience design for digital products.",
  jurisdiction: "Nigeria",
  inputs: [
    { name: "client_name", label: "Client / Company Name", type: "text", required: true },
    { name: "designer_name", label: "UI/UX Designer Name", type: "text", required: true },
    { name: "project_description", label: "Project Description", type: "textarea", required: true },
    { name: "deliverables", label: "Deliverables (e.g. wireframes, Figma files)", type: "textarea", required: true },
    { name: "revisions", label: "Number of Included Revisions", type: "number", required: true },
    { name: "deadline", label: "Project Deadline", type: "date", required: true },
    { name: "payment_amount", label: "Total Project Fee", type: "number", required: true },
    { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
  ],

  body: [
    {
      text: `This UI/UX Design Services Agreement ("Agreement") is entered into between {{client_name}} ("Client") and {{designer_name}} ("Designer").`
    },
    {
      text: `The Designer agrees to provide UI/UX design services for the following project: {{project_description}}.`
    },
    {
      text: `The agreed deliverables include: {{deliverables}}.`
    },
    {
      text: `The Client is entitled to {{revisions}} revision(s). Additional revisions or changes outside the agreed scope may attract extra charges.`
    },
    {
      text: `The project shall be completed on or before {{deadline}}, subject to timely feedback and approvals from the Client.`
    },
    {
      text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services rendered.`
    },
    {
      text: `All design files and intellectual property remain the property of the Designer until full payment is received.`
    },
    {
      text: `The Designer does not guarantee specific user engagement, conversion rates, or business outcomes resulting from the designs.`
    },
    {
      text: `This Agreement is governed by the laws of Nigeria.`
    }
  ]
}
,{
  id: "service_agreement_graphic_design_pro",
  profession: "Graphic Designer",
  name: "Graphic Design Services Agreement",
  description: "Branding, logos, marketing, and digital design services.",
  jurisdiction: "Nigeria",
  inputs: [
    { name: "client_name", label: "Client Name", type: "text", required: true },
    { name: "designer_name", label: "Graphic Designer Name", type: "text", required: true },
    { name: "design_scope", label: "Design Scope / Deliverables", type: "textarea", required: true },
    { name: "revisions", label: "Included Revisions", type: "number", required: true },
    { name: "deadline", label: "Delivery Deadline", type: "date", required: true },
    { name: "payment_amount", label: "Total Fee", type: "number", required: true },
    { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
  ],

  body: [
    {
      text: `This Graphic Design Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{designer_name}} ("Designer").`
    },
    {
      text: `The Designer agrees to provide the following design services: {{design_scope}}.`
    },
    {
      text: `The Client is entitled to {{revisions}} revision(s). Any additional revisions beyond this may incur additional fees.`
    },
    {
      text: `Final designs shall be delivered on or before {{deadline}}.`
    },
    {
      text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services provided.`
    },
    {
      text: `The Designer shall not be held responsible for printing errors, third-party misuse, or brand performance after delivery.`
    },
    {
      text: `All intellectual property remains with the Designer until full payment is received.`
    },
    {
      text: `This Agreement is governed by the laws of Nigeria.`
    }
  ]
},
{
  id: "service_agreement_content_creator",
  profession: "Content Creator",
  name: "Content Creation Services Agreement",
  description: "Digital content creation for brands, social media, and marketing.",
  jurisdiction: "Nigeria",
  inputs: [
    { name: "client_name", label: "Client / Brand Name", type: "text", required: true },
    { name: "creator_name", label: "Content Creator Name", type: "text", required: true },
    { name: "content_type", label: "Type of Content (e.g. videos, posts, reels)", type: "text", required: true },
    { name: "platforms", label: "Platforms (e.g. Instagram, TikTok, YouTube)", type: "text", required: true },
    { name: "deliverables", label: "Number of Deliverables", type: "text", required: true },
    { name: "deadline", label: "Delivery Date", type: "date", required: true },
    { name: "fee", label: "Total Fee", type: "number", required: true },
    { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
  ],

  body: [
    {
      text: `This Content Creation Services Agreement ("Agreement") is entered into between {{client_name}} ("Client") and {{creator_name}} ("Creator").`
    },
    {
      text: `The Creator agrees to produce the following content: {{content_type}} for use on {{platforms}}.`
    },
    {
      text: `The agreed deliverables include: {{deliverables}}, to be delivered on or before {{deadline}}.`
    },
    {
      text: `The Client agrees to pay {{fee}} {{currency}} for the content produced under this Agreement.`
    },
    {
      text: `The Creator does not guarantee specific engagement metrics, reach, sales, or audience growth.`
    },
    {
      text: `Content usage rights are granted to the Client upon full payment, limited to agreed platforms and purposes unless otherwise stated in writing.`
    },
    {
      text: `The Client agrees not to alter, resell, or reuse the content beyond the agreed scope without the Creator’s consent.`
    },
    {
      text: `This Agreement is governed by the laws of Nigeria.`
    }
  ]
}

,
  {
    id: "service_agreement_basic",
    profession: "General Service",
    name: "Service Agreement (Basic)",
    description: "Simple service agreement for freelancers and small businesses.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "provider_name", label: "Service Provider Name", type: "text", required: true },
      { name: "service_description", label: "Service Description", type: "textarea", required: true },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "payment_amount", label: "Payment Amount", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true },
      { name: "late_fee", label: "Late Fee Percentage (0 if none)", type: "number", required: true }
    ],
    body: [
      { text: `This Service Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Service Provider").` },
      { text: `The Service Provider agrees to provide the following services: {{service_description}} starting on {{start_date}}.` },
      { text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services provided under this Agreement.` },
      {
        showIf: data => Number(data.late_fee) > 0,
        text: `If the Client fails to make any payment on time, a late fee of {{late_fee}}% may be charged on the outstanding amount.`
      },
      { text: `This Agreement is governed by the laws of Nigeria.` },
      { text: `Both parties agree to act in good faith and to communicate promptly regarding any issues that arise in connection with the services.` }
    ]
  },
  {
    id: "service_agreement_webdev",
    profession: "Web Developer",
    name: "Freelance Web Development Agreement",
    description: "Project-based website or web app development for clients.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client / Company Name", type: "text", required: true },
      { name: "provider_name", label: "Developer Name", type: "text", required: true },
      { name: "project_scope", label: "Project Scope (what you are building)", type: "textarea", required: true },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "Estimated Completion Date", type: "date", required: true },
      { name: "payment_amount", label: "Total Project Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true },
      { name: "payment_schedule", label: "Payment Schedule (e.g. 50% upfront, 50% on delivery)", type: "text", required: true },
      { name: "late_fee", label: "Late Fee Percentage (0 if none)", type: "number", required: true }
    ],
    body: [
      { text: `This Freelance Web Development Agreement is made between {{client_name}} ("Client") and {{provider_name}} ("Developer").` },
      { text: `The Developer agrees to design, build and deliver the following project: {{project_scope}} . The Project will commence on {{start_date}} with an estimated completion date of {{end_date}}.` },
      { text: `The Client agrees to pay a total fee of {{payment_amount}} {{currency}} for the Project. The agreed payment schedule is as follows: {{payment_schedule}} upfront.` },
      {
        showIf: data => Number(data.late_fee) > 0,
        text: `If payment is not made on time, a late fee of {{late_fee}}% may be charged on any overdue amount at the Developer's discretion.`
      },
      { text: `All intellectual property in the Project will remain with the Developer until full payment is received. Upon full payment, the Client will receive a license to use the deliverables for its business purposes.` },
      { text: `This Agreement is governed by the laws of Nigeria, and both parties agree to resolve disputes in good faith before considering legal action.` }
    ]
  },
  {
  id: "service_agreement_computer_repair",
  profession: "Computer Technician",
  name: "Computer Repair Services Agreement",
  description: "Repair, diagnostics, and maintenance of computers and laptops.",
  jurisdiction: "Nigeria",
  inputs: [
    { name: "client_name", label: "Client Name", type: "text", required: true },
    { name: "technician_name", label: "Technician / Repair Shop Name", type: "text", required: true },

    {
      name: "device_details",
      label: "Device Details (brand, model, serial number)",
      type: "text",
      required: true
    },

    {
      name: "reported_issue",
      label: "Reported Problem / Fault",
      type: "textarea",
      required: true
    },

    {
      name: "repair_services",
      label: "Repair / Diagnostic Services to be Performed",
      type: "textarea",
      required: true
    },

    { name: "intake_date", label: "Device Intake Date", type: "date", required: true },

    {
      name: "estimated_cost",
      label: "Estimated Repair Cost",
      type: "number",
      required: true
    },

    { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
  ],

  body: [
    {
      text: `This Computer Repair Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{technician_name}} ("Service Provider").`
    },
    {
      text: `The Client has presented the following device for repair: {{device_details}}. The reported issue is described as: {{reported_issue}}.`
    },
    {
      text: `The Service Provider agrees to perform the following diagnostic and repair services: {{repair_services}}. Services shall commence on {{intake_date}}.`
    },
    {
      text: `The estimated cost for the repair services is {{estimated_cost}} {{currency}}. Any additional repairs or costs outside this estimate must be approved by the Client before proceeding.`
    },
    {
      text: `The Client acknowledges that computer components, including but not limited to motherboards, screens, connectors, chips, storage devices, and internal cables, are fragile and may fail, deteriorate, or become damaged during standard diagnostic or repair procedures due to pre-existing conditions or manufacturing defects.`
    },
    {
      text: `The Service Provider shall not be held liable for any damage, data loss, or component failure that occurs as a result of reasonable repair efforts, handling, or testing, provided such actions are performed in a professional manner.`
    },
    {
      text: `The Client agrees that the Service Provider is not responsible for loss of data and confirms that all important data has been backed up prior to repair.`
    },
    {
      text: `This Agreement shall terminate upon completion of the repair services or return of the device to the Client, whether repaired or deemed irreparable.`
    },
    {
      text: `This Agreement is governed by the laws of Nigeria, and both parties agree to act in good faith.`
    }
  ]
}

  ,
  {
    id: "service_agreement_photography",
    profession: "Photographer",
    name: "Photography Service Agreement",
    description: "Events, portraits, product shoots for clients.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "provider_name", label: "Photographer Name / Studio", type: "text", required: true },
      { name: "event_description", label: "Event / Shoot Description", type: "textarea", required: true },
      { name: "event_date", label: "Event / Shoot Date", type: "date", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "hours", label: "Number of Hours", type: "number", required: true },
      { name: "payment_amount", label: "Total Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true },
      { name: "deliverables", label: "Deliverables (e.g. 50 edited photos, online gallery)", type: "textarea", required: true }
    ],
    body: [
      { text: `This Photography Service Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Photographer").` },
      { text: `The Photographer agrees to provide photography services for the following: {{event_description}}, to take place on {{event_date}} at {{location}} for an estimated duration of {{hours}} hours.` },
      { text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services. Unless otherwise agreed in writing, payment is due on or before the event date.` },
      { text: `The Photographer will deliver the following after the event: {{deliverables}}. Delivery timelines will be communicated to the Client and may vary depending on workload and editing requirements.` },
      { text: `The Photographer retains copyright to all images created under this Agreement but grants the Client a personal, non-exclusive license to use the delivered images for personal or business promotion, unless otherwise restricted in writing.` },
      { text: `This Agreement is governed by the laws of Nigeria. Both parties agree to act in good faith and communicate promptly regarding any changes or issues.` }
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
      { name: "service_description", label: "Description of Consulting Services", type: "textarea", required: true },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "End Date (or leave blank if ongoing)", type: "date", required: false },
      { name: "rate", label: "Rate (e.g. per month, per session)", type: "text", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      { text: `This Consulting Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Consultant").` },
      { text: `The Consultant agrees to provide the following services to the Client: {{service_description}}. Services will commence on {{start_date}}{{end_date_clause}}.` },
      { text: `The Client agrees to pay the Consultant at the rate of {{rate}} in {{currency}}. Payment terms and invoicing frequency will be agreed between the parties in writing.` },
      { text: `Any confidential information shared between the parties will be kept confidential and used only for the purpose of this Agreement.` },
      { text: `This Agreement is governed by the laws of Nigeria, and any disputes will first be addressed through good faith negotiation.` }
    ],
    transformData: data => {
      const end = data.end_date ? ` and continue until ${data.end_date}` : ` and continue until terminated by either party`;
      return { ...data, end_date_clause: end };
    }
  },
  {
    id: "service_agreement_smm",
    profession: "Social Media Manager",
    name: "Social Media Management Agreement",
    description: "Content creation, posting, and account management services.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client / Business Name", type: "text", required: true },
      { name: "provider_name", label: "Social Media Manager Name", type: "text", required: true },
      { name: "platforms", label: "Platforms Managed (e.g. Instagram, X, TikTok)", type: "text", required: true },
      { name: "services", label: "Description of Services", type: "textarea", required: true },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "fee", label: "Monthly / Project Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      { text: `This Social Media Management Agreement ("Agreement") is entered into between {{client_name}} ("Client") and {{provider_name}} ("Service Provider").` },
      { text: `The Service Provider agrees to manage the Client’s social media presence on the following platforms: {{platforms}} and provide the following services: {{services}}.` },
      { text: `Services shall commence on {{start_date}} and will continue unless terminated by either party in writing.` },
      { text: `The Client agrees to pay {{fee}} {{currency}} for the services rendered. Payment terms will be agreed upon separately where necessary.` },
      { text: `The Service Provider does not guarantee specific audience growth, engagement metrics, or revenue outcomes.` },
      { text: `This Agreement is governed by the laws of Nigeria.` }
    ]
  },
  {
    id: "service_agreement_graphic_design",
    profession: "Graphic Designer",
    name: "Graphic Design Services Agreement",
    description: "Logos, branding, marketing, and digital design services.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "designer_name", label: "Designer Name", type: "text", required: true },
      { name: "design_scope", label: "Design Scope / Deliverables", type: "textarea", required: true },
      { name: "deadline", label: "Delivery Deadline", type: "date", required: true },
      { name: "payment_amount", label: "Total Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      { text: `This Graphic Design Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{designer_name}} ("Designer").` },
      { text: `The Designer agrees to provide the following design services: {{design_scope}}.` },
      { text: `The Designer shall deliver the final design materials on or before {{deadline}}.` },
      { text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services provided under this Agreement.` },
      { text: `All intellectual property remains with the Designer until full payment is received. Upon payment, ownership or license terms will apply as agreed.` },
      { text: `This Agreement is governed by the laws of Nigeria.` }
    ]
  },
  {
    id: "service_agreement_hair_stylist",
    profession: "Hair Stylist / Barber",
    name: "Personal Grooming Services Agreement",
    description: "Haircut, styling, and grooming services.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "stylist_name", label: "Stylist / Barber Name", type: "text", required: true },
      { name: "service_type", label: "Type of Service (e.g. haircut, braids, beard trim)", type: "text", required: true },
      { name: "appointment_date", label: "Appointment Date", type: "date", required: true },
      { name: "price", label: "Service Fee", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      { text: `This Personal Grooming Services Agreement ("Agreement") is entered into between {{client_name}} ("Client") and {{stylist_name}} ("Service Provider").` },
      { text: `The Service Provider agrees to perform the following service: {{service_type}} on {{appointment_date}}.` },
      { text: `The Client agrees to pay {{price}} {{currency}} for the service upon completion unless otherwise agreed.` },
      { text: `The Service Provider agrees to perform services professionally and in accordance with standard industry practices.` },
      { text: `This Agreement is governed by the laws of Nigeria.` }
    ]
  },
  {
    id: "service_agreement_mechanic",
    profession: "Auto Mechanic",
    name: "Vehicle Repair Services Agreement",
    description: "Vehicle maintenance and repair services.",
    jurisdiction: "Nigeria",
    inputs: [
      { name: "client_name", label: "Vehicle Owner Name", type: "text", required: true },
      { name: "mechanic_name", label: "Mechanic / Workshop Name", type: "text", required: true },
      { name: "vehicle_details", label: "Vehicle Details (make, model, plate number)", type: "text", required: true },
      { name: "repair_description", label: "Description of Repairs", type: "textarea", required: true },
      { name: "estimated_cost", label: "Estimated Cost", type: "number", required: true },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text", required: true }
    ],
    body: [
      { text: `This Vehicle Repair Services Agreement ("Agreement") is made between {{client_name}} ("Client") and {{mechanic_name}} ("Service Provider").` },
      { text: `The Service Provider agrees to perform the following repairs on the vehicle described as {{vehicle_details}}: {{repair_description}}.` },
      { text: `The estimated repair cost is {{estimated_cost}} {{currency}}. Any additional costs must be approved by the Client before proceeding.` },
      { text: `The Service Provider is not responsible for pre-existing faults or issues unrelated to the agreed repairs.` },
      { text: `This Agreement is governed by the laws of Nigeria.` }
    ]
  },


];

// ---------- TERMS & CONDITIONS ----------
const termsAndConditions = [
  "TERMS AND CONDITIONS",
  "1. Governing Law: This Agreement is governed by the laws of Nigeria.",
  "2. Liability: Except for willful misconduct or gross negligence, neither party shall be liable for indirect, incidental, special, or consequential damages.",
  "3. Confidentiality: Each party will keep confidential information of the other private and use it only for the purposes of performing this Agreement.",
  "4. Amendment: Any amendment must be in writing and signed by both parties.",
  "5. Severability: If any provision is held invalid, the remainder of the Agreement remains in force.",
  "6. Entire Agreement: This document (and any attachments) constitutes the entire agreement between the parties.",
  "7. Notices: Notices must be in writing and delivered by email or courier to the addresses provided.",
  "8. Signatures: Electronic copies, scanned signatures, or typed names shall be treated as original for enforcement purposes."
].join("\n\n");

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

  // Append Terms & Conditions after template body
  return paragraphs.join("\n\n") + "\n\n" + termsAndConditions;
}

// ---------- SIGNATURE + DOWNLOAD HELPERS ----------
function buildSignatureBlock() {
  return [
    "",
    "Signatures",
    "",
    "----------------------------------------",
    "",
    "Client:",
    "",
    "Name:        ________________________________________________",
    "",
    "Signature:   ________________________________________________",
    "",
    "Date:        ________________________________________________",
    "",
    "",
    "Service Provider:",
    "",
    "Name:        ________________________________________________",
    "",
    "Signature:   ________________________________________________",
    "",
    "Date:        ________________________________________________",
    ""
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
    ...body.split("\n\n").map(p => new Paragraph({ text: p, spacing: { after: 120 } })),
    new Paragraph(""),
    ...signatureBlock.split("\n").map(p => new Paragraph({ text: p }))
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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title || "Contract", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Generated by your contract tool (to be reviewed by legal counsel).",
    pageWidth / 2,
    65,
    { align: "center" }
  );

  // Body
  doc.setFont("helvetica", "normal");
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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SIGNATURES", marginX, cursorY);
  cursorY += 16;

  doc.setFont("helvetica", "normal");
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
  const [selectedTemplateId, setSelectedTemplateId] = useState(contractTemplates[0]?.id || "");
  const [formData, setFormData] = useState({});
  const [step, setStep] = useState(1); // 1 = choose template, 2 = fill form, 3 = preview & download
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [editedText, setEditedText] = useState("");

  const selectedTemplate = useMemo(() => contractTemplates.find(t => t.id === selectedTemplateId), [selectedTemplateId]);

  const visibleTemplates = useMemo(() => (showAllTemplates ? contractTemplates : contractTemplates.slice(0, 4)), [showAllTemplates]);

  const finalText = useMemo(() => (selectedTemplate ? renderContract(selectedTemplate, formData) : ""), [selectedTemplate, formData]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && selectedTemplate) {
      const initialValues = {};
      selectedTemplate.inputs.forEach(input => { initialValues[input.name] = ""; });
      setFormData(initialValues);
      setStep(2);
    } else if (step === 2 && selectedTemplate) {
      const generated = finalText || renderContract(selectedTemplate, formData);
      setEditedText(generated);
      setStep(3);
    }
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const title = selectedTemplate?.name || "Contract";
  const signatureBlock = buildSignatureBlock();

  const textForDownload = (editedText || finalText || "").trim();

  const handleDownloadTxt = () => { if (!textForDownload) return; downloadTxt(title, textForDownload, signatureBlock); };
  const handleDownloadDocx = () => { if (!textForDownload) return; downloadDocx(title, textForDownload, signatureBlock); };
  const handleDownloadPdf = () => { if (!textForDownload) return; downloadPdf(title, textForDownload, signatureBlock); };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
  <header className="mx-auto mb-6 max-w-4xl flex items-center gap-3">
<img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />

  <div>
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      Contract Generator
    </h1>
    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
      Generate profession-specific contracts and download as PDF, DOCX, or TXT.
    </p>
  </div>
</header>



      <main className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl shadow-black/60 sm:p-6">
        {/* Steps */}
        <div className="mb-4 flex flex-wrap gap-4">
          <StepIndicator label="1. Choose template" active={step === 1} done={step > 1} />
          <StepIndicator label="2. Fill details" active={step === 2} done={step > 2} />
          <StepIndicator label="3. Preview & download" active={step === 3} done={false} />
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_minmax(0,1fr)]">
          <div className="rounded-xl bg-slate-950/60 p-3 sm:p-4">
            {step === 1 && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">Select a contract</h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">Pick a template based on the profession and type of work.</p>

                <div className="flex flex-col gap-2">
                  {visibleTemplates.map(template => {
                    const isActive = template.id === selectedTemplateId;
                    return (
                      <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)}
                        className={[
                          "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                          "bg-slate-950/80 hover:border-slate-500 hover:bg-slate-900",
                          isActive ? "border-blue-400 bg-slate-900/80 shadow-[0_0_0_1px_rgba(96,165,250,0.35)]" : "border-slate-800"
                        ].join(" ")}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-300">{template.profession}</span>
                          <span className="text-[10px] text-slate-500">Jurisdiction: {template.jurisdiction}</span>
                        </div>
                        <div className="mb-1 text-sm font-semibold text-slate-100">{template.name}</div>
                        <div className="text-[11px] text-slate-400">{template.description}</div>
                      </button>
                    );
                  })}
                </div>

           {/* VIEW MORE / VIEW LESS BUTTON */}
{contractTemplates.length > 4 && (
  <div className="mt-3">
    <button
      type="button"
      onClick={() => setShowAllTemplates(prev => !prev)}
      className="text-xs sm:text-sm font-medium text-blue-300 hover:text-blue-200"
    >
      {showAllTemplates ? "View fewer templates" : "View more templates"}
    </button>
  </div>
)}

              </section>
            )}

            {step === 2 && selectedTemplate && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">{selectedTemplate.name}</h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">Fill in the details below to generate your contract.</p>

                <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="space-y-3">
                  {selectedTemplate.inputs.map(input => (
                    <div key={input.name} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-200 sm:text-sm">
                        {input.label}
                        {input.required && <span className="ml-1 text-[11px] text-orange-400">*</span>}
                      </label>
                      {input.type === "textarea" ? (
                        <textarea className="block w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 sm:text-sm"
                          value={formData[input.name] || ""} required={input.required} onChange={e => handleInputChange(input.name, e.target.value)} />
                      ) : (
                        <input className="block w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 sm:text-sm"
                          type={input.type} value={formData[input.name] || ""} required={input.required} onChange={e => handleInputChange(input.name, e.target.value)} />
                      )}
                    </div>
                  ))}

                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setStep(1)} className="inline-flex items-center rounded-full border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 sm:text-sm">Back</button>
                    <button type="submit" className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-xs font-semibold text-slate-50 shadow-md hover:from-blue-500 hover:to-violet-500 sm:text-sm">Generate Preview</button>
                  </div>
                </form>
              </section>
            )}

            {step === 3 && selectedTemplate && (
              <section>
                <h2 className="mb-1 text-base font-medium sm:text-lg">Preview & download</h2>
                <p className="mb-3 text-xs text-slate-400 sm:text-sm">Review the contract on the right, then download it in your preferred format.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={!textForDownload} onClick={handleDownloadPdf} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">Download PDF</button>
                  <button type="button" disabled={!textForDownload} onClick={handleDownloadDocx} className="inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">Download DOCX</button>
                  <button type="button" disabled={!textForDownload} onClick={handleDownloadTxt} className="inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">Download TXT</button>
                </div>
                <div className="mt-3">
                  <button type="button" onClick={() => setStep(2)} className="inline-flex items-center rounded-full border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 sm:text-sm">Back</button>
                </div>
              </section>
            )}
          </div>

          {/* Right side – preview */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <h3 className="mb-2 text-xs font-medium text-slate-200 sm:text-sm">Contract Preview</h3>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs sm:text-sm">
              {step === 3 && (editedText || finalText) ? (
                <textarea className="block h-full min-h-[260px] w-full resize-vertical rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 sm:text-xs"
                  value={editedText || finalText} onChange={e => setEditedText(e.target.value)} />
              ) : finalText ? (
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed sm:text-xs">{finalText}</pre>
              ) : (
                <p className="text-xs text-slate-500 sm:text-sm">The generated contract text will appear here once you fill the form and generate a preview. You can then edit it before downloading.</p>
              )}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]"><span className="font-semibold text-slate-300">Disclaimer:</span> This tool provides general document templates and does not constitute legal advice. A qualified lawyer should review and adapt each contract for your specific situation and jurisdiction.</p>
          </div>
        </div>

        {step === 1 && (
          <div className="mt-4 flex justify-end">
            <button type="button" disabled={!selectedTemplateId} onClick={() => { setStep(2); const initialValues = {}; selectedTemplate.inputs?.forEach(i => initialValues[i.name] = ""); setFormData(initialValues); }} className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs font-semibold text-slate-50 shadow-md hover:from-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">Continue</button>
          </div>
        )}
      </main>
        <Analytics />
    </div>
  );
}

export default App;
