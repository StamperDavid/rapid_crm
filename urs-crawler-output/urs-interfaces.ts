/**
 * URS Form Interfaces
 * 
 * Auto-generated from URS crawler
 * Generated: 2025-11-18T17:14:08.244Z
 * Total Fields: 10
 * Total Pages: 3
 */

export interface URSFormData {
  /** Yes */
  questionCode_B0011P010031S01003_Q01002_id_Y?: 'Y' | 'N';
  /** No */
  questionCode_B0011P010031S01003_Q01002_id_N?: 'Y' | 'N';
  fileUploaderDijit?: string;
  /** Document Type: */
  appDocType?: string;
  /** Your Name */
  chatUserName?: string;
  /** Applicant ID */
  chatApplicantId?: string;
  /** Email Address */
  chatEmailAddress?: string;
  /** Your Question */
  chatQuestion?: string;
  applicantNEW?: 'NEW' | 'OLD';
  applicantOLD?: 'NEW' | 'OLD';
}

export interface URSFieldMetadata {
  [key: string]: {
    label?: string;
    type: string;
    required: boolean;
    validation?: any;
    options?: Array<{ value: string; label: string }>;
  };
}

export const URS_FIELD_METADATA: URSFieldMetadata = {
  "questionCode_B0011P010031S01003_Q01002_id_Y": {
    label: "Yes",
    type: "radio",
    required: false,
    options: [{"value":"Y","label":"Yes","selected":false},{"value":"N","label":"No","selected":false}],
  },
  "questionCode_B0011P010031S01003_Q01002_id_N": {
    label: "No",
    type: "radio",
    required: false,
    options: [{"value":"Y","label":"Yes","selected":false},{"value":"N","label":"No","selected":false}],
  },
  "fileUploaderDijit": {
    label: undefined,
    type: "file",
    required: false,
  },
  "appDocType": {
    label: "Document Type:",
    type: "text",
    required: false,
  },
  "chatUserName": {
    label: "Your Name",
    type: "text",
    required: false,
    validation: {"maxLength":100},
  },
  "chatApplicantId": {
    label: "Applicant ID",
    type: "text",
    required: false,
    validation: {"maxLength":100},
  },
  "chatEmailAddress": {
    label: "Email Address",
    type: "text",
    required: false,
    validation: {"maxLength":100},
  },
  "chatQuestion": {
    label: "Your Question",
    type: "textarea",
    required: false,
  },
  "applicantNEW": {
    label: undefined,
    type: "radio",
    required: false,
    options: [{"value":"NEW","label":"NEW","selected":false},{"value":"OLD","label":"OLD","selected":false}],
  },
  "applicantOLD": {
    label: undefined,
    type: "radio",
    required: false,
    options: [{"value":"NEW","label":"NEW","selected":false},{"value":"OLD","label":"OLD","selected":false}],
  },
};
