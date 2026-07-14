/**
 * permitLibrary.js
 * ------------------------------------------------------------------
 * HSE reference library: permit types, and for each type — the
 * standard hazards and the matching precautions/controls, drafted to
 * ISO 45001 / OSHA / GCC Civil Defense-aligned good practice.
 *
 * These populate the dropdown/checklist suggestions in the New Permit
 * form. HSE can still add a free-text "Other" hazard/control.
 * ------------------------------------------------------------------
 */

export const PERMIT_TYPES = [
  'Confined Space Entry',
  'Electrical / Energy Isolation Work',
  'Chemical Handling',
  'Excavation',
  'Hot Works',
  'MEWP',
  'Manual Handling',
  'Working at Heights',
  'Lifting',
  'Elevated Work',
  'Other',
];

export const DOCUMENT_CATEGORIES = [
  'Scope of Work',
  'Stakeholder Approval (NOC)',
  'Building Permit',
  'Method Statement',
  'Risk Assessment',
  'Job Safety Analysis',
  'Third Party Certificates',
  'Engineered Drawing',
  'Supplementary Form',
  'Other',
];

export const PPE_OPTIONS = [
  'Safety Glasses',
  'Harness / Retrieval Line',
  'Ear Protection',
  'Hard Hat',
  'Safety Boots',
  'Protective Clothing',
  'Goggles',
  'Fall Protection',
  'Respiratory Protection',
  'Face Shield',
  'Safety Vest',
  'Gloves',
];

export const CLOSE_OUT_OPTIONS = ['Job Completed', 'Suspend', 'Cancelled', 'Revalidated'];

export const STATUS_OPTIONS = ['Active', 'Job Completed', 'Suspended', 'Cancelled', 'Revalidated'];

/**
 * hazardControlMap: permit type -> { hazards: [...], controls: [...] }
 * Each hazard also carries a default risk-impact rating (Low/Medium/High)
 * that HSE can override per job.
 */
export const HAZARD_CONTROL_MAP = {
  'Confined Space Entry': {
    hazards: [
      { label: 'Oxygen deficiency / enrichment', impact: 'High' },
      { label: 'Toxic or flammable gas accumulation', impact: 'High' },
      { label: 'Engulfment (liquids, granular solids)', impact: 'High' },
      { label: 'Restricted entry/exit, entrapment', impact: 'High' },
      { label: 'Poor visibility / lighting', impact: 'Medium' },
      { label: 'Communication failure with attendant', impact: 'Medium' },
    ],
    controls: [
      'Gas testing before entry and continuous monitoring',
      'Standby attendant / rescue team on-site at all times',
      'Forced ventilation before and during entry',
      'Confined Space Entry Permit displayed at entry point',
      'Rescue and retrieval equipment ready (tripod, winch, harness)',
      'Two-way communication maintained with attendant',
      'Isolation/LOTO of connected mechanical & electrical systems',
    ],
  },
  'Electrical / Energy Isolation Work': {
    hazards: [
      { label: 'Electric shock / electrocution', impact: 'High' },
      { label: 'Arc flash / arc blast', impact: 'High' },
      { label: 'Unexpected re-energization', impact: 'High' },
      { label: 'Residual stored energy (capacitors, springs)', impact: 'Medium' },
      { label: 'Fire from short circuit', impact: 'Medium' },
    ],
    controls: [
      'Lockout-Tagout (LOTO) applied at all isolation points',
      'Zero-energy verification with calibrated voltage tester',
      'Single point of isolation control with unique locks/tags',
      'Insulated tools and rated PPE for the voltage class',
      'Permit displayed at work location and isolation point',
      'Competent, authorized electrical person supervising',
    ],
  },
  'Chemical Handling': {
    hazards: [
      { label: 'Skin / eye contact with hazardous chemical', impact: 'Medium' },
      { label: 'Inhalation of vapours / fumes', impact: 'Medium' },
      { label: 'Spillage / leakage', impact: 'Medium' },
      { label: 'Fire or reaction from incompatible chemicals', impact: 'High' },
      { label: 'Incorrect labelling / unknown substance', impact: 'Medium' },
    ],
    controls: [
      'SDS (Safety Data Sheet) reviewed and available on-site',
      'Chemical-resistant PPE (gloves, goggles, apron) worn',
      'Adequate ventilation / local exhaust in place',
      'Spill kit and neutralizing agents available',
      'Segregated, compatible storage of chemicals',
      'Emergency shower / eyewash station accessible',
    ],
  },
  Excavation: {
    hazards: [
      { label: 'Collapse of excavation / trench walls', impact: 'High' },
      { label: 'Underground utility strike (electrical, gas, water)', impact: 'High' },
      { label: 'Fall of persons or materials into excavation', impact: 'Medium' },
      { label: 'Ground/plant instability at excavation edge', impact: 'Medium' },
      { label: 'Flooding / water ingress', impact: 'Medium' },
    ],
    controls: [
      'Utility survey / cable & pipe locating (CAT scan) completed',
      'Shoring, battering, or trench box installed as required',
      'Barricading and signage around excavation perimeter',
      'Safe access/egress (ladder) provided within excavation',
      'Daily inspection by competent person before entry',
      'Spoil piled at safe distance from excavation edge',
    ],
  },
  'Hot Works': {
    hazards: [
      { label: 'Fire from sparks / flying particles', impact: 'High' },
      { label: 'Burns from equipment or molten material', impact: 'Medium' },
      { label: 'Toxic fumes / welding smoke inhalation', impact: 'Medium' },
      { label: 'Explosion from flammable atmosphere', impact: 'High' },
      { label: 'Eye damage from UV / arc flash', impact: 'Medium' },
    ],
    controls: [
      'Fire watch assigned during and 30 min after work',
      'Fire extinguisher / fire blanket positioned at work location',
      'Combustible materials removed or shielded within radius',
      'Gas test performed where flammable atmosphere possible',
      'Welding screens / curtains used to protect bystanders',
      'Local exhaust ventilation or fume extraction in use',
    ],
  },
  MEWP: {
    hazards: [
      { label: 'Overturning of MEWP', impact: 'High' },
      { label: 'Fall from height / ejection from platform', impact: 'High' },
      { label: 'Collision with structure, overhead lines or personnel', impact: 'Medium' },
      { label: 'Ground instability / uneven surface', impact: 'Medium' },
      { label: 'Entrapment between platform and structure', impact: 'Medium' },
    ],
    controls: [
      'Operator holds valid MEWP competency certificate',
      'Pre-use inspection checklist completed',
      'Harness with restraint lanyard attached to anchor point',
      'Ground conditions and outrigger set-up verified',
      'Exclusion zone barricaded at ground level',
      'Overhead hazards (power lines, structures) surveyed before use',
    ],
  },
  'Manual Handling': {
    hazards: [
      { label: 'Musculoskeletal injury (strain/sprain)', impact: 'Medium' },
      { label: 'Crushed fingers/toes while lifting or placing load', impact: 'Medium' },
      { label: 'Dropped load', impact: 'Medium' },
      { label: 'Repetitive motion injury', impact: 'Low' },
    ],
    controls: [
      'Mechanical aids (trolley, hoist) used where possible',
      'Team lifting for loads exceeding safe individual limit',
      'Manual handling / safe lifting technique training confirmed',
      'Clear, obstruction-free path to destination',
      'Appropriate gloves and safety footwear worn',
    ],
  },
  'Working at Heights': {
    hazards: [
      { label: 'Fall from height', impact: 'High' },
      { label: 'Falling objects striking persons below', impact: 'High' },
      { label: 'Failure of access equipment (ladder, scaffold)', impact: 'High' },
      { label: 'Adverse weather (wind, rain)', impact: 'Medium' },
    ],
    controls: [
      'Full body harness with double lanyard, anchored to rated point',
      'Scaffold / access equipment inspected and tagged (scafftag)',
      'Edge protection / guardrails installed',
      'Toe boards / debris netting to prevent falling objects',
      'Exclusion zone barricaded below the work area',
      'Work stopped if wind speed exceeds safe limit',
    ],
  },
  Lifting: {
    hazards: [
      { label: 'Load drop / crane failure', impact: 'High' },
      { label: 'Struck-by suspended load', impact: 'High' },
      { label: 'Crane overturning / ground instability', impact: 'High' },
      { label: 'Sling / rigging failure', impact: 'Medium' },
      { label: 'Contact with overhead power lines', impact: 'High' },
    ],
    controls: [
      'Lifting Plan prepared and approved by competent person',
      'Crane, rigging and lifting gear third-party certified & in-date',
      'Appointed banksman / signaller directing the lift',
      'Exclusion zone established beneath and around lift path',
      'Ground bearing capacity verified for crane/outrigger position',
      'Load weight, radius and capacity confirmed against crane chart',
    ],
  },
  'Elevated Work': {
    hazards: [
      { label: 'Fall from elevated platform or edge', impact: 'High' },
      { label: 'Falling tools / materials', impact: 'Medium' },
      { label: 'Structural instability of platform', impact: 'Medium' },
    ],
    controls: [
      'Guardrails and toe boards installed at all open edges',
      'Tools tethered / tool lanyards used',
      'Platform load capacity confirmed before use',
      'Exclusion zone at ground level below elevated work',
    ],
  },
  Other: {
    hazards: [
      { label: 'Site-specific hazard (specify in description)', impact: 'Medium' },
    ],
    controls: [
      'Task-specific risk assessment reviewed and controls implemented',
    ],
  },
};

export function getHazardsForType(type) {
  return HAZARD_CONTROL_MAP[type]?.hazards || HAZARD_CONTROL_MAP.Other.hazards;
}

export function getControlsForType(type) {
  return HAZARD_CONTROL_MAP[type]?.controls || HAZARD_CONTROL_MAP.Other.controls;
}
