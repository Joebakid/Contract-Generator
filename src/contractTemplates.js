// src/contractTemplates.js

export const contractTemplates = [
  {
    id: "service_agreement_basic",
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
      {
        text: `This Service Agreement ("Agreement") is made between {{client_name}} ("Client") and {{provider_name}} ("Service Provider").`
      },
      {
        text: `The Service Provider agrees to provide the following services: {{service_description}} starting on {{start_date}}.`
      },
      {
        text: `The Client agrees to pay {{payment_amount}} {{currency}} for the services provided under this Agreement.`
      },
      {
        showIf: data => Number(data.late_fee) > 0,
        text: `If the Client fails to make any payment on time, a late fee of {{late_fee}}% may be charged on the outstanding amount.`
      },
      {
        text: `This Agreement is governed by the laws of Nigeria.`
      },
      {
        text: `Both parties agree to act in good faith and to communicate promptly regarding any issues that arise in connection with the services.`
      }
    ]
  }
];
