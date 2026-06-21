-- ============================================================================
-- NIST Compass — NIST CSF 2.0 catalog seed
-- Functions (6), Categories (22), Subcategories (full 2.0 set).
-- Idempotent: re-running upserts on the unique `code`.
-- Source: NIST Cybersecurity Framework (CSF) 2.0, Feb 2024.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------
insert into framework_functions (code, name, description, sort_order) values
 ('GV','Govern','Establish, communicate, and monitor the organization''s cybersecurity risk management strategy, expectations, and policy.',1),
 ('ID','Identify','Help determine the current cybersecurity risk to the organization by understanding assets, suppliers, and related risks.',2),
 ('PR','Protect','Use safeguards to manage the organization''s cybersecurity risks and prevent or limit adverse events.',3),
 ('DE','Detect','Find and analyze possible cybersecurity attacks and compromises in a timely manner.',4),
 ('RS','Respond','Take action regarding a detected cybersecurity incident to contain its effects.',5),
 ('RC','Recover','Restore assets and operations affected by a cybersecurity incident to reduce its impact.',6)
on conflict (code) do update set name=excluded.name, description=excluded.description, sort_order=excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into framework_categories (function_id, code, name, description, sort_order)
select f.id, c.code, c.name, c.description, c.sort_order
from (values
 ('GV','GV.OC','Organizational Context','The circumstances surrounding the organization''s cybersecurity risk management decisions are understood.',1),
 ('GV','GV.RM','Risk Management Strategy','The organization''s priorities, constraints, risk tolerance, and assumptions are established and used to support operational risk decisions.',2),
 ('GV','GV.RR','Roles, Responsibilities, and Authorities','Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement are established and communicated.',3),
 ('GV','GV.PO','Policy','Organizational cybersecurity policy is established, communicated, and enforced.',4),
 ('GV','GV.OV','Oversight','Results of organization-wide cybersecurity risk management activities are used to inform, improve, and adjust the risk management strategy.',5),
 ('GV','GV.SC','Cybersecurity Supply Chain Risk Management','Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by stakeholders.',6),
 ('ID','ID.AM','Asset Management','Assets that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to objectives and risk strategy.',1),
 ('ID','ID.RA','Risk Assessment','The cybersecurity risk to the organization, assets, and individuals is understood by the organization.',2),
 ('ID','ID.IM','Improvement','Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified across all CSF Functions.',3),
 ('PR','PR.AA','Identity Management, Authentication, and Access Control','Access to physical and logical assets is limited to authorized users, services, and hardware, and managed commensurate with the assessed risk of unauthorized access.',1),
 ('PR','PR.AT','Awareness and Training','The organization''s personnel are provided with cybersecurity awareness and training so they can perform their cybersecurity-related tasks.',2),
 ('PR','PR.DS','Data Security','Data are managed consistent with the organization''s risk strategy to protect the confidentiality, integrity, and availability of information.',3),
 ('PR','PR.PS','Platform Security','The hardware, software, and services of physical and virtual platforms are managed consistent with the organization''s risk strategy.',4),
 ('PR','PR.IR','Technology Infrastructure Resilience','Security architectures are managed with the organization''s risk strategy to protect asset confidentiality, integrity, and availability, and organizational resilience.',5),
 ('DE','DE.CM','Continuous Monitoring','Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events.',1),
 ('DE','DE.AE','Adverse Event Analysis','Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents.',2),
 ('RS','RS.MA','Incident Management','Responses to detected cybersecurity incidents are managed.',1),
 ('RS','RS.AN','Incident Analysis','Investigations are conducted to ensure effective response and support forensics and recovery activities.',2),
 ('RS','RS.CO','Incident Response Reporting and Communication','Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies.',3),
 ('RS','RS.MI','Incident Mitigation','Activities are performed to prevent expansion of an event and mitigate its effects.',4),
 ('RC','RC.RP','Incident Recovery Plan Execution','Restoration activities are performed to ensure operational availability of systems and services affected by cybersecurity incidents.',1),
 ('RC','RC.CO','Incident Recovery Communication','Restoration activities are coordinated with internal and external parties.',2)
) as c(fn_code, code, name, description, sort_order)
join framework_functions f on f.code = c.fn_code
on conflict (code) do update set name=excluded.name, description=excluded.description, sort_order=excluded.sort_order, function_id=excluded.function_id;

-- ---------------------------------------------------------------------------
-- Subcategories
-- ---------------------------------------------------------------------------
insert into framework_subcategories (category_id, code, description, sort_order)
select cat.id, s.code, s.description, s.sort_order
from (values
 -- GV.OC
 ('GV.OC','GV.OC-01','The organizational mission is understood and informs cybersecurity risk management.',1),
 ('GV.OC','GV.OC-02','Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood and considered.',2),
 ('GV.OC','GV.OC-03','Legal, regulatory, and contractual requirements regarding cybersecurity — including privacy and civil liberties obligations — are understood and managed.',3),
 ('GV.OC','GV.OC-04','Critical objectives, capabilities, and services that external stakeholders depend on or expect from the organization are understood and communicated.',4),
 ('GV.OC','GV.OC-05','Outcomes, capabilities, and services that the organization depends on are understood and communicated.',5),
 -- GV.RM
 ('GV.RM','GV.RM-01','Risk management objectives are established and agreed to by organizational stakeholders.',1),
 ('GV.RM','GV.RM-02','Risk appetite and risk tolerance statements are established, communicated, and maintained.',2),
 ('GV.RM','GV.RM-03','Cybersecurity risk management activities and outcomes are included in enterprise risk management processes.',3),
 ('GV.RM','GV.RM-04','Strategic direction that describes appropriate risk response options is established and communicated.',4),
 ('GV.RM','GV.RM-05','Lines of communication across the organization are established for cybersecurity risks, including risks from suppliers and other third parties.',5),
 ('GV.RM','GV.RM-06','A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established and communicated.',6),
 ('GV.RM','GV.RM-07','Strategic opportunities (i.e., positive risks) are characterized and are included in organizational cybersecurity risk discussions.',7),
 -- GV.RR
 ('GV.RR','GV.RR-01','Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture that is risk-aware, ethical, and continually improving.',1),
 ('GV.RR','GV.RR-02','Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced.',2),
 ('GV.RR','GV.RR-03','Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies.',3),
 ('GV.RR','GV.RR-04','Cybersecurity is included in human resources practices.',4),
 -- GV.PO
 ('GV.PO','GV.PO-01','Policy for managing cybersecurity risks is established based on organizational context, strategy, and priorities and is communicated and enforced.',1),
 ('GV.PO','GV.PO-02','Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced to reflect changes in requirements, threats, technology, and organizational mission.',2),
 -- GV.OV
 ('GV.OV','GV.OV-01','Cybersecurity risk management strategy outcomes are reviewed to inform and adjust strategy and direction.',1),
 ('GV.OV','GV.OV-02','The cybersecurity risk management strategy is reviewed and adjusted to ensure coverage of organizational requirements and risks.',2),
 ('GV.OV','GV.OV-03','Organizational cybersecurity risk management performance is evaluated and reviewed for adjustments needed.',3),
 -- GV.SC
 ('GV.SC','GV.SC-01','A cybersecurity supply chain risk management program, strategy, objectives, policies, and processes are established and agreed to by organizational stakeholders.',1),
 ('GV.SC','GV.SC-02','Cybersecurity roles and responsibilities for suppliers, customers, and partners are established, communicated, and coordinated internally and externally.',2),
 ('GV.SC','GV.SC-03','Cybersecurity supply chain risk management is integrated into cybersecurity and enterprise risk management, risk assessment, and improvement processes.',3),
 ('GV.SC','GV.SC-04','Suppliers are known and prioritized by criticality.',4),
 ('GV.SC','GV.SC-05','Requirements to address cybersecurity risks in supply chains are established, prioritized, and integrated into contracts and other agreements with suppliers and other relevant third parties.',5),
 ('GV.SC','GV.SC-06','Planning and due diligence are performed to reduce risks before entering into formal supplier or other third-party relationships.',6),
 ('GV.SC','GV.SC-07','The risks posed by a supplier, their products and services, and other third parties are understood, recorded, prioritized, assessed, responded to, and monitored over the course of the relationship.',7),
 ('GV.SC','GV.SC-08','Relevant suppliers and other third parties are included in incident planning, response, and recovery activities.',8),
 ('GV.SC','GV.SC-09','Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle.',9),
 ('GV.SC','GV.SC-10','Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement.',10),
 -- ID.AM
 ('ID.AM','ID.AM-01','Inventories of hardware managed by the organization are maintained.',1),
 ('ID.AM','ID.AM-02','Inventories of software, services, and systems managed by the organization are maintained.',2),
 ('ID.AM','ID.AM-03','Representations of the organization''s authorized network communication and internal and external network data flows are maintained.',3),
 ('ID.AM','ID.AM-04','Inventories of services provided by suppliers are maintained.',4),
 ('ID.AM','ID.AM-05','Assets are prioritized based on classification, criticality, resources, and impact on the mission.',5),
 ('ID.AM','ID.AM-07','Inventories of data and corresponding metadata for designated data types are maintained.',6),
 ('ID.AM','ID.AM-08','Systems, hardware, software, services, and data are managed throughout their life cycles.',7),
 -- ID.RA
 ('ID.RA','ID.RA-01','Vulnerabilities in assets are identified, validated, and recorded.',1),
 ('ID.RA','ID.RA-02','Cyber threat intelligence is received from information sharing forums and sources.',2),
 ('ID.RA','ID.RA-03','Internal and external threats to the organization are identified and recorded.',3),
 ('ID.RA','ID.RA-04','Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded.',4),
 ('ID.RA','ID.RA-05','Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response prioritization.',5),
 ('ID.RA','ID.RA-06','Risk responses are chosen, prioritized, planned, tracked, and communicated.',6),
 ('ID.RA','ID.RA-07','Changes and exceptions are managed, assessed for risk impact, recorded, and tracked.',7),
 ('ID.RA','ID.RA-08','Processes for receiving, analyzing, and responding to vulnerability disclosures are established.',8),
 ('ID.RA','ID.RA-09','The authenticity and integrity of hardware and software are assessed prior to acquisition and use.',9),
 ('ID.RA','ID.RA-10','Critical suppliers are assessed prior to acquisition.',10),
 -- ID.IM
 ('ID.IM','ID.IM-01','Improvements are identified from evaluations.',1),
 ('ID.IM','ID.IM-02','Improvements are identified from security tests and exercises, including those done in coordination with suppliers and relevant third parties.',2),
 ('ID.IM','ID.IM-03','Improvements are identified from execution of operational processes, procedures, and activities.',3),
 ('ID.IM','ID.IM-04','Incident response plans and other cybersecurity plans that affect operations are established, communicated, maintained, and improved.',4),
 -- PR.AA
 ('PR.AA','PR.AA-01','Identities and credentials for authorized users, services, and hardware are managed by the organization.',1),
 ('PR.AA','PR.AA-02','Identities are proofed and bound to credentials based on the context of interactions.',2),
 ('PR.AA','PR.AA-03','Users, services, and hardware are authenticated.',3),
 ('PR.AA','PR.AA-04','Identity assertions are protected, conveyed, and verified.',4),
 ('PR.AA','PR.AA-05','Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties.',5),
 ('PR.AA','PR.AA-06','Physical access to assets is managed, monitored, and enforced commensurate with risk.',6),
 -- PR.AT
 ('PR.AT','PR.AT-01','Personnel are provided with awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind.',1),
 ('PR.AT','PR.AT-02','Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind.',2),
 -- PR.DS
 ('PR.DS','PR.DS-01','The confidentiality, integrity, and availability of data-at-rest are protected.',1),
 ('PR.DS','PR.DS-02','The confidentiality, integrity, and availability of data-in-transit are protected.',2),
 ('PR.DS','PR.DS-10','The confidentiality, integrity, and availability of data-in-use are protected.',3),
 ('PR.DS','PR.DS-11','Backups of data are created, protected, maintained, and tested.',4),
 -- PR.PS
 ('PR.PS','PR.PS-01','Configuration management practices are established and applied.',1),
 ('PR.PS','PR.PS-02','Software is maintained, replaced, and removed commensurate with risk.',2),
 ('PR.PS','PR.PS-03','Hardware is maintained, replaced, and removed commensurate with risk.',3),
 ('PR.PS','PR.PS-04','Log records are generated and made available for continuous monitoring.',4),
 ('PR.PS','PR.PS-05','Installation and execution of unauthorized software are prevented.',5),
 ('PR.PS','PR.PS-06','Secure software development practices are integrated, and their performance is monitored throughout the software development life cycle.',6),
 -- PR.IR
 ('PR.IR','PR.IR-01','Networks and environments are protected from unauthorized logical access and usage.',1),
 ('PR.IR','PR.IR-02','The organization''s technology assets are protected from environmental threats.',2),
 ('PR.IR','PR.IR-03','Mechanisms are implemented to achieve resilience requirements in normal and adverse situations.',3),
 ('PR.IR','PR.IR-04','Adequate resource capacity to ensure availability is maintained.',4),
 -- DE.CM
 ('DE.CM','DE.CM-01','Networks and network services are monitored to find potentially adverse events.',1),
 ('DE.CM','DE.CM-02','The physical environment is monitored to find potentially adverse events.',2),
 ('DE.CM','DE.CM-03','Personnel activity and technology usage are monitored to find potentially adverse events.',3),
 ('DE.CM','DE.CM-06','External service provider activities and services are monitored to find potentially adverse events.',4),
 ('DE.CM','DE.CM-09','Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events.',5),
 -- DE.AE
 ('DE.AE','DE.AE-02','Potentially adverse events are analyzed to better understand associated activities.',1),
 ('DE.AE','DE.AE-03','Information is correlated from multiple sources.',2),
 ('DE.AE','DE.AE-04','The estimated impact and scope of adverse events are understood.',3),
 ('DE.AE','DE.AE-06','Information on adverse events is provided to authorized staff and tools.',4),
 ('DE.AE','DE.AE-07','Cyber threat intelligence and other contextual information are integrated into the analysis.',5),
 ('DE.AE','DE.AE-08','Incidents are declared when adverse events meet the defined incident criteria.',6),
 -- RS.MA
 ('RS.MA','RS.MA-01','The incident response plan is executed in coordination with relevant third parties once an incident is declared.',1),
 ('RS.MA','RS.MA-02','Incident reports are triaged and validated.',2),
 ('RS.MA','RS.MA-03','Incidents are categorized and prioritized.',3),
 ('RS.MA','RS.MA-04','Incidents are escalated or elevated as needed.',4),
 ('RS.MA','RS.MA-05','The criteria for initiating incident recovery are applied.',5),
 -- RS.AN
 ('RS.AN','RS.AN-03','Analysis is performed to establish what has taken place during an incident and the root cause of the incident.',1),
 ('RS.AN','RS.AN-06','Actions performed during an investigation are recorded, and the records'' integrity and provenance are preserved.',2),
 ('RS.AN','RS.AN-07','Incident data and metadata are collected, and their integrity and provenance are preserved.',3),
 ('RS.AN','RS.AN-08','An incident''s magnitude is estimated and validated.',4),
 -- RS.CO
 ('RS.CO','RS.CO-02','Internal and external stakeholders are notified of incidents.',1),
 ('RS.CO','RS.CO-03','Information is shared with designated internal and external stakeholders.',2),
 -- RS.MI
 ('RS.MI','RS.MI-01','Incidents are contained.',1),
 ('RS.MI','RS.MI-02','Incidents are eradicated.',2),
 -- RC.RP
 ('RC.RP','RC.RP-01','The recovery portion of the incident response plan is executed once initiated from the incident response process.',1),
 ('RC.RP','RC.RP-02','Recovery actions are selected, scoped, prioritized, and performed.',2),
 ('RC.RP','RC.RP-03','The integrity of backups and other restoration assets is verified before using them for restoration.',3),
 ('RC.RP','RC.RP-04','Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms.',4),
 ('RC.RP','RC.RP-05','The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed.',5),
 ('RC.RP','RC.RP-06','The end of incident recovery is declared based on criteria, and incident-related documentation is completed.',6),
 -- RC.CO
 ('RC.CO','RC.CO-03','Recovery activities and progress in restoring operational capabilities are communicated to designated internal and external stakeholders.',1),
 ('RC.CO','RC.CO-04','Public updates on incident recovery are shared using approved methods and messaging.',2)
) as s(cat_code, code, description, sort_order)
join framework_categories cat on cat.code = s.cat_code
on conflict (code) do update set description=excluded.description, sort_order=excluded.sort_order, category_id=excluded.category_id;
