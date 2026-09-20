// Run this after seeding degrees to attach major/core courses to each degree.
// node backend/seedCourses.js

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const Degree = require('./models/Degree')
const Course = require('./models/Course')
const logger = require('./utils/logger')

const makeCourse = (
  courseCode,
  title,
  department,
  semesterOffered,
  difficultyLevel,
  tags = [],
  skillsGained = [],
) => ({
  courseCode,
  title,
  description: `${title} core accredited curriculum course covering theoretical foundations, lab practicals, and industry application.`,
  department,
  creditHours: 3,
  difficultyLevel,
  semesterOffered,
  tags,
  skillsGained,
  careerOutcomes: tags,
  successRate: 85,
  averageRating: 4.6,
  isCore: true,
  category: 'core',
  relevantSubjects: tags,
  skillTags: skillsGained,
  careerTags: tags,
  isActive: true,
})

const COURSE_CATALOG = {
  // ── 1. INTERMEDIATE & DIPLOMAS ──────────────────────────
  'FSC-ENG': [
    makeCourse('HSSC-MATH1', 'Higher Secondary Mathematics (Calculus & Trigonometry)', 'Mathematics', 1, 'intermediate', ['Mathematics', 'Calculus'], ['Differentiation', 'Integration', 'Analytical Geometry']),
    makeCourse('HSSC-PHY1', 'Physics for Pre-Engineering (Mechanics & Waves)', 'Physics', 1, 'intermediate', ['Physics', 'Mechanics'], ['Vector Analysis', 'Rotational Dynamics']),
    makeCourse('HSSC-CHEM1', 'Chemistry (Inorganic & Physical)', 'Chemistry', 2, 'intermediate', ['Chemistry', 'Equations'], ['Stoichiometry', 'Chemical Kinetics']),
  ],
  'FSC-MED': [
    makeCourse('HSSC-BIO1', 'Biology (Cell Biology, Genetics & Physiology)', 'Biology', 1, 'intermediate', ['Biology', 'Genetics'], ['Cell Structure', 'Organ Systems Identification']),
    makeCourse('HSSC-CHEM2', 'Organic & Biochemistry Fundamentals', 'Chemistry', 1, 'intermediate', ['Chemistry', 'Biochemistry'], ['Hydrocarbons', 'Functional Groups']),
    makeCourse('HSSC-PHY2', 'Physics for Medical Sciences', 'Physics', 2, 'intermediate', ['Physics', 'Optics', 'Nuclear Physics'], ['Electromagnetism', 'Medical Physics Basics']),
  ],
  ICS: [
    makeCourse('HSSC-CS1', 'Computer Science & C Programming', 'Computer Science', 1, 'beginner', ['Computer', 'C++', 'Programming'], ['Flowcharts', 'Syntax & Loops', 'Functions']),
    makeCourse('HSSC-MATH2', 'Intermediate Mathematics & Matrices', 'Mathematics', 1, 'intermediate', ['Mathematics', 'Matrices'], ['Linear Algebra Basics', 'Mathematical Induction']),
    makeCourse('HSSC-STAT1', 'Applied Statistics & Probability', 'Statistics', 2, 'intermediate', ['Statistics', 'Data'], ['Frequency Distributions', 'Standard Deviation']),
  ],
  ICOM: [
    makeCourse('HSSC-ACC1', 'Principles of Accounting & Bookkeeping', 'Commerce', 1, 'beginner', ['Accounting', 'Bookkeeping'], ['Ledger Journaling', 'Trial Balance Preparation']),
    makeCourse('HSSC-ECON1', 'Principles of Economics & Trade', 'Economics', 1, 'beginner', ['Economics', 'Commerce'], ['Supply & Demand', 'National Income']),
    makeCourse('HSSC-BMATH1', 'Business Mathematics & Commercial Geography', 'Commerce', 2, 'intermediate', ['Mathematics', 'Finance'], ['Interest Calculations', 'Trade Logistics']),
  ],
  FA: [
    makeCourse('HSSC-PSY1', 'Foundations of Psychology', 'Psychology', 1, 'beginner', ['Psychology', 'Sociology'], ['Behavioral Principles', 'Cognitive Development']),
    makeCourse('HSSC-CIV1', 'Civics & Political Concepts', 'Social Sciences', 1, 'beginner', ['Pakistan Studies', 'Civics'], ['State Structure', 'Constitutional Basics']),
    makeCourse('HSSC-ART1', 'Studio Drawing & Visual Expression', 'Arts', 2, 'intermediate', ['Art', 'Design'], ['Perspective Drawing', 'Composition']),
  ],
  DAE: [
    makeCourse('DAE-ENG1', 'Applied Technical Mathematics & Engineering Physics', 'Technical Engineering', 1, 'intermediate', ['Mathematics', 'Physics'], ['Engineering Formulae', 'Applied Mechanics']),
    makeCourse('DAE-TECH1', 'Workshop Technology & Industrial Practice', 'Technical Engineering', 2, 'intermediate', ['Building Things', 'Fieldwork'], ['Machine Operations', 'Safety Standards']),
    makeCourse('DAE-CAD1', 'AutoCAD Drafting & Electrical/Mechanical Schematics', 'Technical Engineering', 3, 'intermediate', ['Computer', 'CAD'], ['Schematic Blueprint Reading', '2D/3D Drafting']),
  ],

  // ── 2. LATERAL BS 5TH SEMESTER ──────────────────────────
  'BSCS-LAT': [
    makeCourse('LAT-CS301', 'Advanced Object-Oriented Software Design', 'Computer Science', 5, 'intermediate', ['OOP', 'Design Patterns'], ['Clean Architecture', 'Refactoring']),
    makeCourse('LAT-CS302', 'Enterprise Database Systems & SQL', 'Computer Science', 5, 'intermediate', ['Databases', 'SQL'], ['Database Normalization', 'ACID Transactions']),
    makeCourse('LAT-CS401', 'Distributed Systems & Cloud Computing', 'Computer Science', 6, 'advanced', ['Cloud', 'Systems'], ['Microservices', 'Distributed Storage']),
  ],
  'BBA-LAT': [
    makeCourse('LAT-BBA301', 'Corporate Strategy & Leadership', 'Business Administration', 5, 'intermediate', ['Strategy', 'Management'], ['Strategic Audit', 'Competitive Advantage']),
    makeCourse('LAT-BBA302', 'Corporate Finance & Valuation Modeling', 'Business Administration', 5, 'intermediate', ['Finance', 'Accounting'], ['Valuation Models', 'Financial Statement Analysis']),
  ],

  // ── 3. POSTGRADUATE & MASTER'S ──────────────────────────
  MSCS: [
    makeCourse('MSCS701', 'Advanced Deep Learning & Neural Architectures', 'Computer Science', 1, 'advanced', ['DL', 'PyTorch', 'Transformers'], ['Attention Models', 'Diffusion Models', 'LLM Architectures']),
    makeCourse('MSCS702', 'High Performance Distributed Computing', 'Computer Science', 2, 'advanced', ['Distributed Systems', 'Cloud'], ['Cluster Scheduling', 'Parallel Computing']),
    makeCourse('MSCS801', 'Postgraduate Thesis Research & Defense', 'Computer Science', 3, 'advanced', ['Research', 'Writing'], ['Scientific Publishing', 'Experimental Validation']),
  ],
  MBA: [
    makeCourse('MBA701', 'Strategic Executive Leadership & Corporate Governance', 'Business Administration', 1, 'advanced', ['Leadership', 'Strategy'], ['Executive Negotiation', 'Governance Frameworks']),
    makeCourse('MBA702', 'Global Supply Chain & Operations Management', 'Business Administration', 2, 'advanced', ['Operations', 'Supply Chain'], ['Procurement Logistics', 'Risk Mitigation']),
    makeCourse('MBA801', 'Corporate Mergers, Acquisitions & Venture Capital', 'Business Administration', 3, 'advanced', ['Finance', 'Venture Capital'], ['LBO Modeling', 'Due Diligence']),
  ],

  // ── 4. BACHELOR'S DEGREES ───────────────────────────────
  BSCS: [
    makeCourse('CS101', 'Programming Fundamentals', 'Computer Science', 1, 'beginner', ['Programming', 'C++', 'Logic'], ['Programming Basics', 'Problem Solving']),
    makeCourse('CS102', 'Object Oriented Programming', 'Computer Science', 2, 'intermediate', ['OOP', 'Java', 'Design Patterns'], ['Polymorphism', 'Abstraction', 'Encapsulation']),
    makeCourse('CS201', 'Data Structures & Algorithms', 'Computer Science', 3, 'intermediate', ['Algorithms', 'DSA'], ['Algorithm Design', 'Complexity Analysis']),
    makeCourse('CS301', 'Operating Systems', 'Computer Science', 5, 'intermediate', ['OS', 'Systems'], ['Process Management', 'Concurrency', 'Memory Allocation']),
    makeCourse('CS302', 'Database Systems', 'Computer Science', 4, 'intermediate', ['Databases', 'SQL'], ['Schema Design', 'Relational Querying', 'Indexing']),
    makeCourse('CS303', 'Computer Networks', 'Computer Science', 5, 'intermediate', ['Networks', 'Protocols', 'TCP/IP'], ['Networking Fundamentals', 'Routing']),
    makeCourse('CS401', 'Software Engineering Principles', 'Computer Science', 6, 'intermediate', ['SDLC', 'Design'], ['System Design', 'Agile Methodologies']),
  ],
  BSSE: [
    makeCourse('SE101', 'Software Process & Models', 'Software Engineering', 1, 'beginner', ['Process', 'SDLC'], ['Process Thinking', 'Requirement Specifications']),
    makeCourse('SE201', 'Requirements Engineering', 'Software Engineering', 3, 'intermediate', ['Requirements', 'Use Cases'], ['Elicitation', 'Traceability Matrix']),
    makeCourse('SE301', 'Software Architecture & Design', 'Software Engineering', 5, 'intermediate', ['Design Patterns', 'Architecture'], ['Microservices', 'Clean Code', 'Scalability']),
    makeCourse('SE302', 'Software Testing & Quality Assurance', 'Software Engineering', 6, 'intermediate', ['Testing', 'QA', 'Automation'], ['Unit Testing', 'CI/CD Pipelines', 'Selenium']),
    makeCourse('SE401', 'Software Project Management', 'Software Engineering', 7, 'advanced', ['Management', 'Agile', 'Scrum'], ['Sprint Planning', 'Risk Mitigation', 'DevOps']),
  ],
  BSAI: [
    makeCourse('AI101', 'Introduction to Artificial Intelligence', 'Artificial Intelligence', 2, 'beginner', ['AI', 'Foundations'], ['Search Algorithms', 'Knowledge Representation']),
    makeCourse('AI201', 'Machine Learning Foundations', 'Artificial Intelligence', 4, 'intermediate', ['ML', 'Supervised Learning', 'Scikit-Learn'], ['Model Training', 'Hyperparameter Tuning', 'Evaluation']),
    makeCourse('AI301', 'Deep Learning & Neural Networks', 'Artificial Intelligence', 6, 'advanced', ['DL', 'PyTorch', 'TensorFlow'], ['Backpropagation', 'CNNs', 'RNNs', 'Transformers']),
    makeCourse('AI302', 'Natural Language Processing & LLMs', 'Artificial Intelligence', 6, 'advanced', ['NLP', 'Language Models', 'BERT'], ['Tokenization', 'Attention Mechanism', 'Fine-tuning']),
    makeCourse('AI303', 'Computer Vision', 'Artificial Intelligence', 7, 'advanced', ['Vision', 'OpenCV', 'Image Processing'], ['Feature Extraction', 'Object Detection', 'Segmentation']),
  ],
  BSDS: [
    makeCourse('DS101', 'Introduction to Data Science & R/Python', 'Data Science', 1, 'beginner', ['Python', 'Pandas', 'EDA'], ['Data Cleaning', 'Exploratory Data Analysis']),
    makeCourse('DS201', 'Applied Statistical Inference', 'Data Science', 3, 'intermediate', ['Statistics', 'Probability', 'Hypothesis Testing'], ['A/B Testing', 'Regression Models']),
    makeCourse('DS301', 'Big Data Analytics & Spark', 'Data Science', 5, 'advanced', ['Hadoop', 'Spark', 'Distributed Systems'], ['MapReduce', 'Pipeline Orchestration']),
    makeCourse('DS302', 'Data Visualization & BI Dashboards', 'Data Science', 4, 'intermediate', ['Tableau', 'PowerBI', 'Visualization'], ['Dashboard Design', 'Storytelling with Data']),
    makeCourse('DS401', 'Predictive Modeling & Time Series', 'Data Science', 7, 'advanced', ['Forecasting', 'Time Series', 'ARIMA'], ['Trend Analysis', 'Predictive Scoring']),
  ],
  BSCY: [
    makeCourse('CY101', 'Fundamentals of Cyber Security', 'Cyber Security', 2, 'beginner', ['Security', 'CIA Triad', 'Threats'], ['Risk Assessment', 'Security Policies']),
    makeCourse('CY201', 'Network Security & Firewalls', 'Cyber Security', 4, 'intermediate', ['Firewalls', 'VPNs', 'Wireshark'], ['Traffic Inspection', 'Intrusion Detection']),
    makeCourse('CY301', 'Ethical Hacking & Penetration Testing', 'Cyber Security', 5, 'advanced', ['Penetration Testing', 'Kali Linux', 'Metasploit'], ['Vulnerability Scanning', 'Exploitation Defense']),
    makeCourse('CY302', 'Cryptography & Public Key Infrastructure', 'Cyber Security', 6, 'advanced', ['Crypto', 'AES', 'RSA', 'Blockchain'], ['Ciphers', 'Digital Signatures', 'TLS']),
    makeCourse('CY401', 'Digital Forensics & Incident Response', 'Cyber Security', 7, 'advanced', ['Forensics', 'Memory Analysis', 'SOC'], ['Evidence Acquisition', 'Malware Triage']),
  ],
  MBBS: [
    makeCourse('MED101', 'Human Gross Anatomy & Histology', 'Medicine', 1, 'beginner', ['Anatomy', 'Human Body'], ['Dissection Basics', 'Organ Systems Identification']),
    makeCourse('MED102', 'Medical Physiology', 'Medicine', 2, 'beginner', ['Physiology', 'Homeostasis'], ['Cardiovascular & Respiratory Mechanics']),
    makeCourse('MED201', 'Medical Biochemistry & Genetics', 'Medicine', 3, 'intermediate', ['Biochemistry', 'Genetics'], ['Enzyme Kinetics', 'Metabolic Pathways']),
    makeCourse('MED301', 'General Pathology & Microbiology', 'Medicine', 5, 'intermediate', ['Pathology', 'Bacteria', 'Virology'], ['Disease Etiology', 'Lab Diagnostic Cultures']),
    makeCourse('MED302', 'Systemic Pharmacology', 'Medicine', 6, 'intermediate', ['Pharmacology', 'Drug Action'], ['Pharmacokinetics', 'Therapeutics & Dosages']),
    makeCourse('MED401', 'Internal Medicine & Clinical Diagnostics', 'Medicine', 8, 'advanced', ['Clinical Diagnosis', 'Patient Care'], ['Bedside Clinical Examination', 'Emergency Triage']),
  ],
  BDS: [
    makeCourse('BDS101', 'Oral Anatomy & Tooth Morphology', 'Dental Surgery', 1, 'beginner', ['Oral Anatomy', 'Dentition'], ['Tooth Carving', 'Dental Morphology']),
    makeCourse('BDS201', 'Dental Materials Science', 'Dental Surgery', 3, 'intermediate', ['Dental Materials', 'Biocompatibility'], ['Impression Techniques', 'Polymer Fillings']),
    makeCourse('BDS301', 'Oral Pathology & Microbiology', 'Dental Surgery', 5, 'intermediate', ['Oral Pathology', 'Biopsy'], ['Lesion Identification', 'Histopathology']),
    makeCourse('BDS401', 'Operative Dentistry & Endodontics', 'Dental Surgery', 7, 'advanced', ['Root Canal', 'Fillings'], ['Cavity Preparation', 'Pulp Capping']),
    makeCourse('BDS402', 'Oral & Maxillofacial Surgery', 'Dental Surgery', 8, 'advanced', ['Surgery', 'Extractions'], ['Tooth Extraction', 'Anesthesia Administration']),
  ],
  PharmD: [
    makeCourse('PHM101', 'Pharmaceutical Chemistry', 'Pharmacy', 1, 'beginner', ['Organic Chemistry', 'Formulations'], ['Chemical Synthesis', 'Assay Analysis']),
    makeCourse('PHM201', 'Pharmaceutics & Dosage Form Design', 'Pharmacy', 3, 'intermediate', ['Formulation', 'Tablets', 'Syrups'], ['Drug Delivery Systems', 'Compounding']),
    makeCourse('PHM301', 'Pharmacognosy & Herbal Medicine', 'Pharmacy', 4, 'intermediate', ['Phytochemistry', 'Plant Extracts'], ['Natural Product Isolation', 'Extraction']),
    makeCourse('PHM401', 'Clinical Pharmacy & Therapeutics', 'Pharmacy', 7, 'advanced', ['Hospital Care', 'Patient Monitoring'], ['Drug Interaction Screening', 'Prescription Auditing']),
    makeCourse('PHM501', 'Pharmaceutical Quality Assurance & GMP', 'Pharmacy', 9, 'advanced', ['GMP', 'HPLC', 'Validation'], ['Regulatory Compliance', 'Stability Testing']),
  ],
  DPT: [
    makeCourse('DPT101', 'Kinesiology & Biomechanics', 'Physical Therapy', 1, 'beginner', ['Kinesiology', 'Movement'], ['Gait Analysis', 'Joint Kinematics']),
    makeCourse('DPT201', 'Physical Therapy Assessment & Modalities', 'Physical Therapy', 3, 'intermediate', ['Electrotherapy', 'Thermal Agents'], ['Assessment Techniques', 'Range of Motion']),
    makeCourse('DPT301', 'Musculoskeletal Physical Therapy', 'Physical Therapy', 5, 'intermediate', ['Orthopedics', 'Rehabilitation'], ['Manual Joint Mobilization', 'Post-Op Rehab']),
    makeCourse('DPT401', 'Neurological Physical Therapy', 'Physical Therapy', 7, 'advanced', ['Neuro Rehab', 'Stroke Recovery'], ['Proprioceptive Training', 'Motor Re-learning']),
    makeCourse('DPT501', 'Cardiopulmonary & Sports Rehabilitation', 'Physical Therapy', 9, 'advanced', ['Sports Therapy', 'Cardiac Rehab'], ['Exercise Prescription', 'Athletic Taping']),
  ],
  BSN: [
    makeCourse('NUR101', 'Fundamentals of Nursing & Patient Care', 'Nursing', 1, 'beginner', ['Patient Care', 'Vital Signs'], ['Bedside Care', 'Infection Control Protocols']),
    makeCourse('NUR201', 'Adult Health Nursing', 'Nursing', 3, 'intermediate', ['Medical Surgical', 'Wound Care'], ['Post-Op Nursing', 'IV Therapy Management']),
    makeCourse('NUR301', 'Community Health & Epidemiology', 'Nursing', 5, 'intermediate', ['Public Health', 'Immunization'], ['Epidemiological Surveys', 'Patient Education']),
    makeCourse('NUR401', 'Critical Care & Emergency Nursing', 'Nursing', 7, 'advanced', ['ICU', 'Emergency Triage'], ['Ventilator Monitoring', 'ACLS Resuscitation']),
  ],
  BSEE: [
    makeCourse('EE101', 'Linear Circuit Analysis & Lab', 'Electrical Engineering', 1, 'beginner', ['Circuits', 'Ohm Law', 'Kirchhoff'], ['Breadboard Prototyping', 'Oscilloscope Testing']),
    makeCourse('EE201', 'Electronic Devices & Circuits', 'Electrical Engineering', 3, 'intermediate', ['Diodes', 'Transistors', 'Op-Amps'], ['Amplifier Design', 'PCB Layout']),
    makeCourse('EE301', 'Signals, Systems & DSP', 'Electrical Engineering', 5, 'intermediate', ['Signals', 'Fourier Transform', 'DSP'], ['Filter Design', 'Frequency Analysis']),
    makeCourse('EE302', 'Electrical Power Distribution & Machines', 'Electrical Engineering', 6, 'advanced', ['Transformers', 'Power Grid', 'Motors'], ['Load Calculation', 'Power Factor Correction']),
    makeCourse('EE401', 'Control Systems Engineering', 'Electrical Engineering', 7, 'advanced', ['Feedback', 'PID Control', 'Stability'], ['State-Space Modeling', 'MATLAB Simulink']),
  ],
  BSME: [
    makeCourse('ME101', 'Engineering Mechanics & Statics', 'Mechanical Engineering', 1, 'beginner', ['Statics', 'Forces', 'Equilibrium'], ['Truss Analysis', 'Free Body Diagrams']),
    makeCourse('ME201', 'Thermodynamics & Heat Engines', 'Mechanical Engineering', 3, 'intermediate', ['Thermodynamics', 'Carnot Cycle'], ['Heat Transfer Modeling', 'Energy Efficiency']),
    makeCourse('ME301', 'Fluid Mechanics & Hydraulics', 'Mechanical Engineering', 4, 'intermediate', ['Fluid Flow', 'Bernoulli', 'Pumps'], ['Pipe Network Sizing', 'CFD Simulation']),
    makeCourse('ME302', 'Machine Design & CAD/CAM', 'Mechanical Engineering', 6, 'advanced', ['SolidWorks', 'CAD', 'Stress Analysis'], ['3D Mechanical Modeling', 'Failure Theories']),
    makeCourse('ME401', 'Refrigeration & HVAC Systems', 'Mechanical Engineering', 7, 'advanced', ['HVAC', 'Refrigeration Cycles'], ['Building Climate Load Sizing', 'Duct Design']),
  ],
  BSCE: [
    makeCourse('CE101', 'Engineering Surveying & Leveling', 'Civil Engineering', 1, 'beginner', ['Surveying', 'Theodolite', 'GIS'], ['Topographic Mapping', 'Leveling Calculation']),
    makeCourse('CE201', 'Mechanics of Solids & Structural Analysis', 'Civil Engineering', 3, 'intermediate', ['Bending Moments', 'Shear Force'], ['Deflection Calculations', 'Structure Design']),
    makeCourse('CE301', 'Reinforced Concrete Design (RCC)', 'Civil Engineering', 5, 'advanced', ['Concrete', 'Rebar', 'ACI Codes'], ['Beam & Slab Detailing', 'ETABS Modeling']),
    makeCourse('CE302', 'Geotechnical & Soil Mechanics', 'Civil Engineering', 6, 'intermediate', ['Soil Testing', 'Foundations'], ['Bearing Capacity Calculation', 'Retaining Walls']),
    makeCourse('CE401', 'Transportation & Highway Engineering', 'Civil Engineering', 7, 'advanced', ['Pavement Design', 'Traffic Flow'], ['Geometric Road Alignment', 'Asphalt Quality']),
  ],
  BSMTR: [
    makeCourse('MTR101', 'Introduction to Mechatronics & Sensors', 'Mechatronics', 2, 'beginner', ['Sensors', 'Actuators', 'Arduino'], ['Sensor Interfacing', 'Transducer Calibration']),
    makeCourse('MTR201', 'Microcontrollers & Embedded C', 'Mechatronics', 4, 'intermediate', ['Microcontrollers', 'STM32', 'Robotics'], ['Interrupt Programming', 'PWM Motor Drive']),
    makeCourse('MTR301', 'Robotics Kinematics & Motion Planning', 'Mechatronics', 6, 'advanced', ['Robotics', 'ROS', 'Kinematics'], ['Forward/Inverse Kinematics', 'Trajectory Generation']),
    makeCourse('MTR401', 'Industrial Automation & PLC/SCADA', 'Mechatronics', 7, 'advanced', ['PLC', 'SCADA', 'Ladder Logic'], ['Factory Automation Design', 'HMI Interfacing']),
  ],
  BBA: [
    makeCourse('BBA101', 'Principles of Management & Leadership', 'Business Administration', 1, 'beginner', ['Management', 'Organizational Behavior'], ['Leadership Styles', 'Operational Planning']),
    makeCourse('BBA102', 'Principles of Marketing & Consumer Insights', 'Business Administration', 2, 'beginner', ['Marketing', 'Branding'], ['Market Segmentation', 'Campaign Strategy']),
    makeCourse('BBA201', 'Financial Accounting & Reporting', 'Business Administration', 3, 'intermediate', ['Accounting', 'Financial Statements'], ['Balance Sheet Analysis', 'Cash Flow Auditing']),
    makeCourse('BBA202', 'Managerial Economics', 'Business Administration', 4, 'intermediate', ['Economics', 'Microeconomics'], ['Pricing Strategies', 'Elasticity Modeling']),
    makeCourse('BBA301', 'Corporate Finance & Valuation', 'Business Administration', 5, 'intermediate', ['Finance', 'Capital Budgeting'], ['NPV/IRR Calculation', 'Working Capital Management']),
    makeCourse('BBA401', 'Strategic Management & Business Policy', 'Business Administration', 7, 'advanced', ['Strategy', 'Competitive Advantage'], ['SWOT Analysis', 'Mergers & Acquisitions']),
  ],
  BSAF: [
    makeCourse('AF101', 'Financial Accounting Fundamentals', 'Accounting & Finance', 1, 'beginner', ['Bookkeeping', 'Journals'], ['Ledger Posting', 'Trial Balance Preparation']),
    makeCourse('AF201', 'Cost & Management Accounting', 'Accounting & Finance', 3, 'intermediate', ['Costing', 'Standard Costing'], ['Variance Analysis', 'Job Order Costing']),
    makeCourse('AF301', 'Auditing & Assurance Standards', 'Accounting & Finance', 5, 'intermediate', ['Auditing', 'ISA Standards'], ['Internal Controls Evaluation', 'Audit Sampling']),
    makeCourse('AF302', 'Taxation Law & Tax Planning', 'Accounting & Finance', 6, 'intermediate', ['Income Tax', 'Sales Tax'], ['Corporate Tax Filing', 'Tax Optimization']),
    makeCourse('AF401', 'Investment Analysis & Portfolio Management', 'Accounting & Finance', 7, 'advanced', ['Equities', 'Bonds', 'CAPM'], ['Portfolio Diversification', 'Asset Pricing Models']),
  ],
  BSFT: [
    makeCourse('FT101', 'Foundations of Fintech & Digital Money', 'Fintech', 1, 'beginner', ['Fintech', 'Digital Wallets'], ['Neo-Banking Concepts', 'Payment Ecosystems']),
    makeCourse('FT201', 'Blockchain & Smart Contracts', 'Fintech', 4, 'intermediate', ['Solidity', 'Ethereum', 'DeFi'], ['Smart Contract Deployment', 'DApps']),
    makeCourse('FT301', 'Algorithmic Trading & Quant Finance', 'Fintech', 6, 'advanced', ['Quant Finance', 'Python', 'Trading'], ['Backtesting Strategies', 'Order Execution Algorithms']),
    makeCourse('FT401', 'RegTech, Compliance & Anti-Money Laundering', 'Fintech', 7, 'advanced', ['RegTech', 'AML/KYC', 'Cyber Law'], ['Automated Compliance Screening', 'Fraud Detection Models']),
  ],
  LLB: [
    makeCourse('LAW101', 'Introduction to Legal Systems & Jurisprudence', 'Law', 1, 'beginner', ['Jurisprudence', 'Legal Theory'], ['Legal Reasoning', 'Case Law Interpretation']),
    makeCourse('LAW201', 'Constitutional Law of Pakistan & UK/US', 'Law', 3, 'intermediate', ['Constitutional Law', 'Fundamental Rights'], ['Judicial Review', 'Writs Filing']),
    makeCourse('LAW301', 'Law of Contract & Specific Relief', 'Law', 4, 'intermediate', ['Contract Law', 'Breach & Remedies'], ['Agreement Drafting', 'Commercial Litigation']),
    makeCourse('LAW302', 'Criminal Law & Pakistan Penal Code (PPC)', 'Law', 5, 'intermediate', ['Criminal Law', 'CrPC', 'PPC'], ['Offense Elements', 'Bail & Trial Procedures']),
    makeCourse('LAW401', 'Corporate & Commercial Law', 'Law', 7, 'advanced', ['Companies Act', 'Arbitration', 'SECP'], ['M&A Due Diligence', 'Corporate Contracts']),
  ],
  BSPSY: [
    makeCourse('PSY101', 'Introduction to General Psychology', 'Psychology', 1, 'beginner', ['Psychology', 'Cognition', 'Perception'], ['Behavioral Observation', 'Experimental Methods']),
    makeCourse('PSY201', 'Developmental & Child Psychology', 'Psychology', 3, 'intermediate', ['Developmental Stages', 'Piaget'], ['Child Assessment', 'Milestone Tracking']),
    makeCourse('PSY301', 'Psychopathology & Abnormal Psychology', 'Psychology', 5, 'intermediate', ['DSM-5', 'Mood Disorders', 'Schizophrenia'], ['Diagnostic Criteria', 'Clinical Profiling']),
    makeCourse('PSY302', 'Psychological Testing & Psychometrics', 'Psychology', 6, 'intermediate', ['Psychometrics', 'IQ Tests', 'MMPI'], ['Test Administration', 'Reliability & Validity']),
    makeCourse('PSY401', 'CBT & Clinical Counseling Skills', 'Psychology', 7, 'advanced', ['CBT', 'Counseling', 'Therapy'], ['Active Listening', 'Cognitive Restructuring']),
  ],
  BSIR: [
    makeCourse('IR101', 'Theories of International Relations', 'International Relations', 1, 'beginner', ['Realism', 'Liberalism', 'Constructivism'], ['Foreign Policy Analysis', 'Global System Modeling']),
    makeCourse('IR201', 'International Law & Treaties', 'International Relations', 3, 'intermediate', ['International Law', 'UN Charter', 'ICJ'], ['Treaty Drafting', 'State Sovereignty Disputes']),
    makeCourse('IR301', 'Geopolitics of South Asia & Middle East', 'International Relations', 5, 'intermediate', ['Geopolitics', 'Regional Security', 'CPEC'], ['Strategic Analysis', 'Defense Policy']),
    makeCourse('IR401', 'Diplomacy, Negotiation & Conflict Resolution', 'International Relations', 7, 'advanced', ['Diplomacy', 'Mediation', 'Crisis Management'], ['Bilateral Negotiations', 'Peacekeeping Strategies']),
  ],
  BArch: [
    makeCourse('ARC101', 'Basic Architectural Design Studio I', 'Architecture', 1, 'beginner', ['Studio Drawing', 'Space Making', 'Scale'], ['Freehand Drafting', 'Physical Model Making']),
    makeCourse('ARC201', 'History of Islamic & World Architecture', 'Architecture', 3, 'intermediate', ['Architectural History', 'Heritage'], ['Style Analysis', 'Vernacular Architecture']),
    makeCourse('ARC301', 'Architectural Design Studio: Housing & Urbanism', 'Architecture', 5, 'advanced', ['Housing', 'Urban Masterplanning'], ['Site Planning', 'Parametric Modeling (Rhino/Revit)']),
    makeCourse('ARC401', 'Building Services & Sustainable Climate Design', 'Architecture', 7, 'advanced', ['Solar Passive Design', 'HVAC/Acoustics'], ['Energy Simulation', 'LEED Certification Standards']),
    makeCourse('ARC501', 'Comprehensive Thesis Project', 'Architecture', 9, 'advanced', ['Thesis', 'Final Architecture Studio'], ['Complex Building Synthesis', 'Jury Defense']),
  ],
  BSGD: [
    makeCourse('GD101', 'Visual Communication & Typography', 'Design', 1, 'beginner', ['Typography', 'Color Theory', 'Illustrator'], ['Grid Systems', 'Hierarchy & Layout']),
    makeCourse('GD201', 'UI/UX Design & User Research', 'Design', 3, 'intermediate', ['Figma', 'UI/UX', 'Wireframing'], ['Design Systems', 'Usability Testing', 'Prototyping']),
    makeCourse('GD301', 'Motion Graphics & After Effects', 'Design', 5, 'intermediate', ['After Effects', 'Animation', 'Kinetic Typography'], ['Keyframing', 'Visual Storytelling']),
    makeCourse('GD401', 'Brand Identity Systems & 3D Art', 'Design', 7, 'advanced', ['Brand Identity', 'Blender', '3D Design'], ['Brand Guidelines', '3D Product Rendering']),
  ],
  BSBT: [
    makeCourse('BT101', 'Cell & Molecular Biology', 'Biotechnology', 1, 'beginner', ['Cell Biology', 'DNA/RNA'], ['Gel Electrophoresis', 'Microscopy']),
    makeCourse('BT201', 'Recombinant DNA Technology & Genetic Engineering', 'Biotechnology', 3, 'intermediate', ['Cloning', 'CRISPR', 'Plasmids'], ['Gene Splicing', 'PCR Amplification']),
    makeCourse('BT301', 'Bioinformatics & Computational Genomics', 'Biotechnology', 5, 'advanced', ['Bioinformatics', 'BLAST', 'Python for Bio'], ['Sequence Alignment', 'Protein Structure Prediction']),
    makeCourse('BT401', 'Industrial & Fermentation Biotechnology', 'Biotechnology', 7, 'advanced', ['Bioprocess', 'Bioreactors', 'Vaccines'], ['Downstream Processing', 'Yield Optimization']),
  ],
  BSAGRI: [
    makeCourse('AG101', 'Fundamentals of Agronomy & Crop Science', 'Agriculture', 1, 'beginner', ['Crop Science', 'Agronomy'], ['Seedbed Preparation', 'Crop Phenology']),
    makeCourse('AG201', 'Soil Science & Fertility Management', 'Agriculture', 3, 'intermediate', ['Soil Chemistry', 'Nutrient Cycles'], ['Soil pH Testing', 'Fertilizer Formulation']),
    makeCourse('AG301', 'Plant Breeding & Genetics', 'Agriculture', 5, 'intermediate', ['Plant Genetics', 'Hybrid Crops'], ['Hybridization Techniques', 'Yield Resistance Traits']),
    makeCourse('AG401', 'Precision Agriculture, GIS & Smart Irrigation', 'Agriculture', 7, 'advanced', ['Smart Farming', 'Drones', 'Drip Irrigation'], ['Satellite Crop Monitoring', 'Water Resource Optimization']),
  ],
}

const seedCourses = async () => {
  try {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in environment variables')
    }

    await mongoose.connect(mongoUri)
    logger.info('Seed courses connected to MongoDB Atlas')

    const degreeShortNames = Object.keys(COURSE_CATALOG)
    const degrees = await Degree.find({ shortName: { $in: degreeShortNames } })
    const degreeByShort = new Map(
      degrees.map((degree) => [degree.shortName, degree]),
    )

    let upserted = 0
    let skipped = 0

    for (const shortName of degreeShortNames) {
      const degree = degreeByShort.get(shortName)
      if (!degree) {
        logger.warn('Degree not found while seeding courses', { shortName })
        skipped += COURSE_CATALOG[shortName].length
        continue
      }

      for (const course of COURSE_CATALOG[shortName]) {
        const payload = { ...course, degree: degree._id }
        await Course.updateOne(
          { courseCode: payload.courseCode },
          { $set: payload },
          { upsert: true },
        )
        upserted += 1
      }
    }

    logger.info('Successfully seeded courses for all academic programs', { upserted, skipped })
    process.exit(0)
  } catch (error) {
    logger.error('Seed courses failed', {
      error: error.message,
      stack: error.stack,
    })
    process.exit(1)
  }
}

seedCourses()
