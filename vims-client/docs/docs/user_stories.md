1	1.0 Main Module: Inspection Client Application
1.1	1.1 Sub-component: Application Security and Access
User Story ID	001
User Story	As a System Administrator, I want the desktop client application to operate in restricted kiosk mode, so that unauthorized use of the operating system or tampering with the inspection machine is prevented.
Acceptance Criteria	• Given the inspection machine is powered on, when the OS loads, then the client application must launch automatically in full-screen mode.
• Given the application is running, when a user attempts to use standard OS shortcuts (e.g., Alt+Tab, Ctrl+Alt+Del), then the action must be blocked.
• UI/UX: The application interface must occupy 100% of the screen real estate with no window borders or minimize/close buttons visible.
Data Attributes	• Application Status, Boolean, True=Running/False=Closed.
• Kiosk Mode Active, Boolean, True/False.
• Machine ID, String, Unique Hardware Identifier.
UX Flow & Navigation	1. Technician powers on the Inspection Machine.
2. System boots directly into the Inspection Client Application login screen.
3. Technician attempts to exit the app (action blocked).
Notes / Assumptions	Refers to RFP Item 47. The application must prevent modification of data both at rest and in transit (Item 43).
User Story ID	002
User Story	As a System Security Module, I want to authenticate both the inspection machine and the user, so that data is only transmitted from trusted hardware and authorized personnel.
Acceptance Criteria	• Given a user attempts to log in, when they enter valid credentials, then the system must also validate the physical Machine ID against a trusted central repository.
• Given the Machine ID is not recognized, when a user attempts login, then access must be denied regardless of valid user credentials.
• UI/UX: Login screen must display "Verifying Machine Security..." status indicator during the handshake.
Data Attributes	• Username, String, Alphanumeric.
• Password, String, Encrypted Hash.
• Machine MAC Address, String, Standard MAC format.
• Machine Certificate, Binary, X.509 Standard.
UX Flow & Navigation	1. User views the Login Screen.
2. User enters Username and Password.
3. User clicks "Login".
4. System validates credentials and Machine ID in background.
5. User lands on the Inspector Dashboard.
Notes / Assumptions	Refers to RFP Item 44 and Item 50 (Mutual Authentication).
2.0 Main Module: Core Inspection Operations
•	2.1 Sub-component: Registration and Workflow
Open o	003
User Story	As an Inspector, I want to digitize the vehicle and owner registration details, so that I can initiate an inspection record that matches the official Annual Technical Inspection Certificate.
Acceptance Criteria	• Given a new inspection request, when I input the vehicle data, then the system must validate the fields against the standard format.
• Given the registration form is open, when I save the data, then a unique Inspection ID must be generated.
• UI/UX: The input form must mirror the layout of the physical "Annual Technical Inspection Certificate" for ease of data entry.
Data Attributes	• Plate Number, String, Regional Code + Number.
• Chassis Number, String, Alphanumeric (Unique).
• Engine Number, String, Alphanumeric.
• Vehicle Type, String, Dropdown Selection.
• Vehicle Model, String, Alphanumeric.
• Title Certificate Book Number, String, Alphanumeric.
• Licensed Capacity (Seat/KG), Integer, Positive Value.
UX Flow & Navigation	1. Inspector navigates to Main Menu -> "New Inspection".
2. Inspector enters Vehicle and Owner details.
3. Inspector clicks "Save & Proceed".
4. System displays the Inspection Workflow screen.
Notes / Assumptions	Refers to RFP Item 1 and the "Annual Technical Inspection Certificate" form provided in the supporting documents.
•	2.2 Sub-component: Visual Inspection
User Story ID	004
User Story	As an Inspector, I want to complete a digital visual inspection checklist, so that I can replace the manual paper checklist and attach evidence.
Acceptance Criteria	• Given the visual inspection screen, when I check items like "Body," "Engine," or "Lights," then I must be able to mark them as "Pass" or "Fail."
• Given a specific failure, when I select "Fail," then the system must prompt me to capture or attach an image/video using the device camera.
• UI/UX: The form must be responsive for tablet use with large touch targets for Pass/Fail toggles.
Data Attributes	• Body Check Status, Enum, Pass/Fail.
• Engine Check Status, Enum, Pass/Fail.
• Lights Check Status, Enum, Pass/Fail.
• Steering Check Status, Enum, Pass/Fail.
• Safety Equipment Status, Enum, Pass/Fail.
• Attachment File, Binary, JPG/MP4.
• Attachment Timestamp, DateTime, ISO 8601.
UX Flow & Navigation	1. Inspector selects an active vehicle record.
2. Inspector clicks the "Visual Inspection" tab.
3. Inspector toggles "Pass" for Body and Engine.
4. Inspector toggles "Fail" for Lights.
5. Inspector clicks "Camera Icon" to take a photo of the broken light.
6. Inspector clicks "Save Visual Results".
Notes / Assumptions	Refers to RFP Item 3 and Item 26. Checklist items are derived from the handwritten checklist form (Body, Engine, Lights, Steering, etc.).
2	2.0 Main Module: Core Inspection Operations
2.1	2.2 Sub-component: Machine-Based Inspection
User Story ID	005
User Story	As an Inspector, I want the system to automatically capture Alignment, Suspension, and Brake test data directly from the inspection line equipment, so that manual data entry errors are eliminated and data integrity is maintained.
Acceptance Criteria	• Given the vehicle is on the test line, when the machine completes the Alignment test, then the "Deviation (m/km)" value must automatically populate in the client application.
• Given the Suspension test is run, when completed, then "Left/Right Efficiency (%)" and "Difference (%)" must populate.
• Given the Brake test (Service, Parking, Emergency) is run, when completed, then "Force (KN)", "Axle Difference (%)", and "Total Efficiency (%)" must populate.
• UI/UX: The application dashboard must show a "Receiving Data..." indicator while the machine is active and lock the input fields to read-only.
Data Attributes	• Alignment Deviation, Decimal, Unit: m/km.
• Suspension Efficiency Left, Decimal, Unit: %.
• Suspension Efficiency Right, Decimal, Unit: %.
• Brake Force Left (Service), Decimal, Unit: KN.
• Brake Force Right (Service), Decimal, Unit: KN.
• Brake Efficiency Total, Decimal, Unit: %.
• Parking Brake Force, Decimal, Unit: KN.
UX Flow & Navigation	1. Inspector positions vehicle on the test lane.
2. Inspector selects the active inspection record on the Desktop Client.
3. Inspector initiates the test sequence on the physical machine.
4. Client Application detects incoming data stream.
5. Fields populate automatically in real-time.
Notes / Assumptions	Refers to RFP Item 2 and the "Lideta" Inspection Report image (Alignment, Suspension, Brakes sections).
User Story ID	006
User Story	As an Inspector, I want the system to automatically capture Emissions (Gas/Smoke) and Headlight data, so that environmental and safety compliance is accurately recorded.
Acceptance Criteria	• Given a gas analyzer is connected, when the test concludes, then values for HC (ppm), CO (%), CO2 (%), O2 (%), Lambda, and RPM must be captured.
• Given a smoke meter is used (for diesel), when the test concludes, then the Opacity (K) value and Max RPM must be captured.
• Given the headlight tester is used, when the test concludes, then "Intensity (cd)" and beam alignment status must be captured.
• UI/UX: The UI must distinguish between "Gas Analyzer" (Petrol) and "Smoke Meter" (Diesel) sections based on the vehicle fuel type registered.
Data Attributes	• HC Value, Integer, Unit: ppm.
• CO Value, Decimal, Unit: %.
• CO2 Value, Decimal, Unit: %.
• Lambda Value, Decimal, Range: 0.00-2.00.
• Smoke Opacity (K), Decimal, Unit: m-1.
• Headlight Intensity, Integer, Unit: cd.
• Headlight Beam Status, String, Pass/Fail.
UX Flow & Navigation	1. Inspector inserts the probe into the exhaust.
2. Inspector revs engine to required RPM.
3. Machine sends signal "Test Complete".
4. Client Application populates the "Gas Analyzer" or "Smoke Meter" section.
5. Inspector moves to Headlight tester and repeats process.
Notes / Assumptions	Refers to RFP Item 2 and the "Lideta" Inspection Report image (Gas Analyzer, Smoke Meter, Headlight sections).
User Story ID	007
User Story	As a Compliance Officer, I want the system to prevent inspection centers from editing machine-generated results, so that the integrity of the inspection process is guaranteed.
Acceptance Criteria	• Given machine data has been populated in the form, when a user attempts to click into the field or type, then the field must remain read-only/disabled.
• Given a machine error occurs, when a re-test is required, then the system must log the overwrite action with a specific "Re-test" flag in the audit trail, rather than allowing a simple edit.
• UI/UX: Machine-populated fields should have a distinct background color (e.g., greyed out) indicating they are locked.
Data Attributes	• Field Editability Status, Boolean, False (for machine fields).
• Data Source Tag, String, Value: "Machine_Interface" or "Manual_Input".
• Re-test Count, Integer, Default: 0.
UX Flow & Navigation	1. Data populates from the machine.
2. Inspector notices an anomaly (e.g., sensor fell off).
3. Inspector clicks "Re-initiate Test" (not edit text).
4. System clears the field and waits for new machine data.
5. System logs the event "Test Retaken".
Notes / Assumptions	Refers to RFP Item 11 ("Prevent inspection centers from editing machine-generated results").
User Story ID	008
User Story	As a System Logic Module, I want to automatically generate a Pass/Fail result based on machine data, so that human bias is removed from the final decision.
Acceptance Criteria	• Given the captured machine data (e.g., Brake Efficiency 48%), when the value is below the configured threshold (e.g., Limit 50%), then the system must automatically mark the section as "Fail".
• Given all machine sections and visual checks are marked "Pass," when the final calculation runs, then the Overall Inspection Result must be "Pass".
• UI/UX: Failed values should be highlighted in Red text; Passed values in Green text immediately upon capture.
Data Attributes	• Section Result, Enum, Pass/Fail.
• Threshold Value, Decimal, Configurable per Vehicle Type.
• Overall Result, Enum, Pass/Fail.
• Logic Rule ID, String, Reference to regulation code.
UX Flow & Navigation	1. Data is captured for all sections.
2. System compares value vs. Limit (from "Lideta" report logic).
3. System updates the "Result" column instantly.
4. Inspector views the summary at the bottom of the screen showing "Total Vehicle Efficiency" and Final Status.
Notes / Assumptions	Refers to RFP Item 2. The "Lideta" report shows "Limits" columns which implies the system logic for Pass/Fail.
2.2	2.3 Sub-component: Result Generation and Reporting
User Story ID	009
User Story	As an Inspector, I want to generate a combined inspection report that includes both machine-generated data and visual inspection results, so that a comprehensive record of the vehicle's condition is created for the central system.
Acceptance Criteria	• Given both machine and visual inspection workflows are marked "Complete," when I click "Finalize," then the system must compile a single data object linking the machine metrics with visual checklist statuses.
• Given images or videos were captured during visual inspection, when the report is generated, then these media files must be securely linked to the specific report ID.
• UI/UX: The "Finalize" button should be disabled until all mandatory sections (Visual + Machine) are completed.
Data Attributes	• Report ID, GUID, Unique Identifier.
• Machine Data Block, JSON Object, Encapsulated metrics.
• Visual Data Block, JSON Object, Encapsulated checklist.
• Media Links, Array, URLs/File Paths to attached evidence.
• Completion Timestamp, DateTime, ISO 8601.
UX Flow & Navigation	1. Inspector reviews all tabs (Visual, Alignment, Brake, Gas).
2. Inspector clicks "Generate Final Report".
3. System compiles data and displays a "Preview" summary.
4. Inspector confirms the details.
5. System locks the record against further changes.
Notes / Assumptions	Refers to RFP Item 4 and Item 27. Ensures the "link" between different data types.
User Story ID	010
User Story	As an Inspector, I want to export and print the final inspection results and checklists, so that I can provide the vehicle owner with a physical certificate and test summary.
Acceptance Criteria	• Given a finalized inspection record, when I select "Print," then the system must generate a PDF matching the official "Annual Technical Inspection Certificate" layout.
• Given the need for digital records, when I select "Export," then I must be able to save the report in PDF or CSV format.
• UI/UX: The print preview must show the exact layout of the printed form (as seen in the "Lideta" and "Certificate" images) to ensure proper alignment on pre-printed stationery if used.
Data Attributes	• Certificate Number, String, Generated Sequence.
• Owner Name, String, Mapped from Registration.
• Expiry Date, Date, Calculated (Inspection Date + 1 Year).
• Print Status, Boolean, True/False.
UX Flow & Navigation	1. Inspector views the "Inspection Summary" screen.
2. Inspector clicks the "Print Certificate" button.
3. System opens standard OS print dialog with pre-configured page settings.
4. Inspector selects printer and confirms.
5. System marks the record as "Certificate Issued".
Notes / Assumptions	Refers to RFP Item 6. The format must match the physical documents provided (e.g., the "Lideta" result sheet and the Certificate).
•	2.4 Sub-component: Connectivity and Synchronization
User Story ID	011
User Story	As a System Logic Module, I want to securely transmit inspection results to the central server, effectively handling both online and offline scenarios, so that data is never lost due to connectivity issues.
Acceptance Criteria	• Given the center has internet connectivity, when a report is finalized, then the data must be encrypted (TLS 1.3) and transmitted immediately to the Tele Cloud.
• Given the internet is down, when a report is finalized, then the system must securely cache the encrypted data locally.
• Given connectivity is restored, then the system must automatically synchronize the cached data to the central server without user intervention.
• UI/UX: The dashboard must display a "Sync Status" icon (Green=Synced, Amber=Caching, Red=Error).
Data Attributes	• Sync Status, Enum, Synced/Pending/Failed.
• Encryption Protocol, String, "TLS 1.3".
• Cache Timestamp, DateTime, Time of local storage.
• Retry Count, Integer, Number of sync attempts.
UX Flow & Navigation	1. Inspector finalizes report (Action).
2. System checks internet connection.
3. (Scenario A: Online) System uploads data; Status icon turns Green.
4. (Scenario B: Offline) System saves locally; Status icon turns Amber.
5. Background service detects network restoration and pushes data.
Notes / Assumptions	Refers to RFP Items 43 (Secure transmission), 48 (Offline caching), and 50 (TLS 1.3).
3.0 Main Module: Central Management System
•	3.1 Sub-component: Data Storage and Management
User Story ID	012
User Story	As a Central Administrator, I want to store all inspection data on the Tele Cloud with redundancy, so that I can maintain a full vehicle inspection history that is easily retrievable.
Acceptance Criteria	• Given data is received from any of the 150 centers, when stored, then it must be replicated across redundant storage nodes to prevent data loss.
• Given a query for a specific Chassis Number, when searched, then the system must retrieve the complete chronological history of all inspections for that vehicle.
• UI/UX: The central search interface should allow looking up records by Plate, Chassis, or Owner Name.
Data Attributes	• Storage Location, String, "Tele Cloud Region A/B".
• Redundancy Level, String, "High Availability".
• Archive Status, Boolean, Active/Archived.
• Search Index, String, Chassis_Number.
UX Flow & Navigation	1. Administrator logs into Central Management Console.
2. Navigates to "Vehicle History".
3. Enters Chassis Number "LZYTBTE..."
4. System lists all past inspection dates and results.
5. Administrator clicks a specific date to view the full report.
Notes / Assumptions	Refers to RFP Item 5 (Tele Cloud/Redundancy) and Item 7 (Full history retrieval).
 
3	4.0 Main Module: System Integration
•	4.1 Sub-component: Video Management System (VMS)
User Story ID	013
User Story	As an Auditor, I want the system to integrate with the Video Management System (VMS), so that I can retrieve and associate specific video evidence with every inspection session.
Acceptance Criteria	• Given an inspection is in progress, when the session starts and ends, then the system must log the exact timestamps to index the VMS recording.
• Given a historical inspection record, when I click "View Inspection Video," then the system must query the VMS to stream the archived footage corresponding to that specific vehicle and time slot.
• UI/UX: The inspection details view must have a distinct media player section or a direct link labeled "Open VMS Evidence".
Data Attributes	• VMS Session ID, String, External Reference Key.
• Camera ID, String, Identifier for the specific lane camera.
• Recording Start Time, DateTime, ISO 8601.
• Recording End Time, DateTime, ISO 8601.
• Video URL, String, Secure Stream Path.
UX Flow & Navigation	1. Auditor opens a past Inspection Record.
2. Auditor scrolls to the "Evidence" section.
3. Auditor clicks the "Play Video" icon.
4. System authenticates with VMS and loads the specific clip in a modal window.
Notes / Assumptions	Refers to RFP Item 8, 9, 27, and 28. Links inspection events to video timeline.
•	4.2 Sub-component: Payment Gateway
User Story ID	014
User Story	As a Center Operator, I want to integrate Telebirr and other digital payment options, so that inspection fees are collected digitally before the inspection process is finalized.
Acceptance Criteria	• Given a vehicle is registered for inspection, when the payment workflow is triggered, then the system must allow payment via Telebirr.
• Given the payment is successful, then the system must receive a transaction confirmation code and update the inspection status to "Paid/Ready."
• UI/UX: The payment screen should display a dynamic QR code for the customer to scan or an input field to trigger a USSD push request to the customer's phone.
Data Attributes	• Transaction ID, String, Unique Payment Reference.
• Payment Provider, Enum, Telebirr/CBE/Other.
• Amount, Decimal, Currency (ETB).
• Payment Status, Enum, Pending/Completed/Failed.
• Payer Phone Number, String, MSISDN.
UX Flow & Navigation	1. Operator initiates "Payment" step.
2. Operator selects "Telebirr".
3. Operator enters customer phone number or generates QR.
4. Customer approves payment on their device.
5. System receives API callback "Success".
6. Inspection workflow unlocks.
Notes / Assumptions	Refers to RFP Item 12. "Telebirr" is explicitly named as a required gateway.
3.0 Main Module: Central Management System (Continued)
•	3.2 Sub-component: System Administration
User Story ID	015
User Story	As a System Administrator, I want a remote management console, so that I can monitor, update, and support client applications across all 120 centers without physical visits.
Acceptance Criteria	• Given a new software patch is available, when I deploy it from the central console, then all connected client applications must automatically download and apply the update.
• Given a client application crashes or goes offline, when this occurs, then the console must display a real-time alert regarding the specific center's health status.
• UI/UX: A map-based or list-based dashboard showing "Health Status" (Green/Red) for every inspection center.
Data Attributes	• Client Version, String, Semantic Versioning (e.g., v1.2.0).
• Center Status, Enum, Online/Offline/Warning.
• Last Heartbeat, DateTime, Timestamp of last signal.
• IP Address, String, IPv4/IPv6.
UX Flow & Navigation	1. Admin logs into Central Management Console.
2. Navigates to "Client Health" dashboard.
3. Filters by "Offline" centers.
4. Selects a center to view logs or pushes a "Restart Service" command remotely.
Notes / Assumptions	Refers to RFP Item 45 (Patch management) and Item 55 (Remote management console).
5.0 Main Module: Analytics and Reporting
•	5.1 Sub-component: Dashboard and Monitoring
User Story ID	016
User Story	As a Transport Authority Director, I want dashboard analytics for trends and performance, so that I can monitor failure rates, compliance, and inspection volume in real-time.
Acceptance Criteria	• Given the analytics dashboard, when I view the "Failure Trends" section, then I must see a breakdown of failures by category (e.g., Brake vs. Gas) over time.
• Given the "Performance" section, when viewed, then I must see the throughput (vehicles per hour) for each inspection center.
• UI/UX: Interactive charts (Bar/Line graphs) allowing drill-down from National view to Regional view to Specific Center view.
Data Attributes	• Failure Category, Enum, Brake/Light/Suspension/Emission.
• Inspection Volume, Integer, Count of inspections.
• Pass Rate, Percentage, Calculated value.
• Center ID, String, Geographic location identifier.
• Date Range, Date, Start/End filter.
UX Flow & Navigation	1. Director logs in.
2. Lands on "Executive Dashboard".
3. Sets date filter to "Last Month".
4. Views "Top Failure Reasons" chart.
5. Drills down into "Brake Failures" to see which center reports the highest anomalies.
Notes / Assumptions	Refers to RFP Item 23 (Dashboard analytics) and Item 53 (Automated monitoring).

5.0 Main Module: Analytics and Reporting (Continued)
•	5.2 Sub-component: Auditing and Forensics
User Story ID	017
User Story	As a Compliance Officer, I want to log all system activity and user actions in a secure audit trail, so that digital forensics readiness, integrity checks, and non-repudiation are ensured.
Acceptance Criteria	• Given any user interaction (login, data capture, print, logout), when the action occurs, then the system must record the User ID, Timestamp, Action Type, and Source Machine.
• Given an attempt to alter data or configuration, when the attempt is made, then the system must log the event immediately, even if the attempt fails.
• UI/UX: The "Audit Log" view in the admin console must be read-only and immutable; no user can delete log entries.
Data Attributes	• Event ID, UUID, Unique Log Identifier.
• Actor ID, String, User or System process.
• Action Type, Enum, Create/Read/Update/Delete/Login.
• Timestamp, DateTime, UTC.
• Old Value, String, Previous state (if applicable).
• New Value, String, New state (if applicable).
• Hash, String, Integrity check for the log entry.
UX Flow & Navigation	1. Officer navigates to "System Logs".
2. Officer filters by "Action Type: Data Modification".
3. Officer selects a specific date range.
4. System displays list of all matching events.
5. Officer exports log for external audit.
Notes / Assumptions	Refers to RFP Items 20 (Log all activity), 51 (Tamper detection), and 52 (Digital forensics readiness).
6.0 Main Module: Security and Compliance
•	6.1 Sub-component: Data Security and Integrity
User Story ID	018
User Story	As a System Security Module, I want to digitally sign all transmitted inspection results, so that the central system can guarantee the authenticity and integrity of every report received.
Acceptance Criteria	• Given an inspection record is ready for transmission, when the client application prepares the packet, then it must apply a digital signature using the client's private key.
• Given the central server receives a record, when it processes the data, then it must verify the signature against the trusted public key before accepting the data.
• UI/UX: (Backend Process) No user intervention required, but a "Signature Verified" badge should appear on the report in the central view.
Data Attributes	• Digital Signature, String, RSA/ECC Hash.
• Signing Key ID, String, Reference to the cert.
• Data Payload, JSON, The data being signed.
• Verification Status, Boolean, Valid/Invalid.
UX Flow & Navigation	1. Inspector clicks "Submit/Sync".
2. Client App calculates hash of the record.
3. Client App encrypts hash with Private Key.
4. Client App appends signature to payload.
5. Central Server receives and verifies.
Notes / Assumptions	Refers to RFP Item 46.
•	6.2 Sub-component: Localization and Accessibility
User Story ID	019
User Story	As a Center Inspector, I want to switch the application language, so that I can work in Amharic, Afaan Oromo, Somali, Tigrinya, or English depending on my region and preference.
Acceptance Criteria	• Given the login screen or dashboard, when I select the language dropdown, then the entire UI (labels, buttons, menus, and help text) must instantly switch to the selected language.
• Given I am in a specific language mode (e.g., Amharic), when I generate a printed report, then the system must allow me to choose whether the printout is in the local language or English (or bilingual if required).
• UI/UX: A prominent "Language" flag/icon selector must be available in the global header bar at all times.
Data Attributes	• Selected Language, Enum, am_ET/om_ET/so_ET/ti_ET/en_US.
• Label Key, String, Reference ID for UI text.
• Localized Text, String, The translation.
UX Flow & Navigation	1. User sees global header.
2. Clicks "Language" icon.
3. Selects "Afaan Oromo".
4. UI refreshes immediately; "Vehicle Type" becomes the Afaan Oromo equivalent.
5. Preference is saved for the next session.
Notes / Assumptions	Refers to RFP Items 25 and 33.
•	6.3 Sub-component: Access Control
User Story ID	020
User Story	As a System Administrator, I want to configure role-based access control (RBAC), so that users like Inspectors, Center Managers, and Auditors only see features relevant to their stakeholder roles.
Acceptance Criteria	• Given a user logged in as "Inspector," then they must only access "New Inspection," "Visual Checklist," and "My Results."
• Given a user logged in as "Auditor," then they must only access "Reports," "Video Evidence," and "Logs" (Read-only).
• Given a user logged in as "Center Manager," then they can access center-specific analytics and staff management.
• UI/UX: Menu items not accessible to the current user role should be hidden or disabled (greyed out).
Data Attributes	• Role Name, String, e.g., "Inspector".
• Permission Set, Array, List of allowed Action IDs.
• User Role Link, Relation, User_ID <-> Role_ID.
UX Flow & Navigation	1. Admin navigates to "User Management".
2. Selects user "Abebe".
3. Assigns Role "Inspector".
4. Abebe logs in.
5. Abebe sees only inspection-related workflow buttons.
Notes / Assumptions	Refers to RFP Item 13 (Role-based reporting) and Item 19 (Role-based access control).
•	5.3 Sub-component: System Health and SLAs
User Story ID	021
User Story	As a Support Engineer, I want the system to provide automated monitoring and alerting, so that I am notified immediately of issues regarding client application health, connectivity, and performance before they impact operations.
Acceptance Criteria	• Given a client application at any center disconnects or experiences high latency, when the threshold is breached, then an automated alert (email/SMS/dashboard notification) must be triggered.
• Given the central server CPU or storage utilization peaks, when it crosses the safety limit, then an alert must be sent to the admin team.
• UI/UX: An "Alerts" center in the admin dashboard showing active issues sorted by severity (Critical, Warning, Info).
Data Attributes	• Alert ID, UUID, Unique Identifier.
• Severity Level, Enum, Critical/High/Medium/Low.
• Component Name, String, e.g., "Client_App_Center_05".
• Metric Value, Decimal, e.g., "Latency: 500ms".
• Threshold Limit, Decimal, Configured value.
UX Flow & Navigation	1. System detects latency > 500ms at "Bole Center".
2. System generates alert notification.
3. Support Engineer receives notification.
4. Engineer clicks the link in the notification.
5. Dashboard opens directly to the "Health Metrics" graph for that specific node.
Notes / Assumptions	Refers to RFP Item 53 and Item 54 (SLAs).
7.0 Main Module: Business Continuity and Deployment
•	7.1 Sub-component: Interoperability and Extensibility
User Story ID	022
User Story	As a System Developer, I want the system to expose Open APIs and use open standards, so that the system supports modular expansion and interoperability with future external systems.
Acceptance Criteria	• Given the need to integrate a new third-party tool, when I access the API layer, then I must find standard RESTful endpoints documenting data access methods.
• Given the requirement for modularity, when a new module is developed, then it must be able to plug into the core system without refactoring the entire legacy codebase.
• UI/UX: (Developer Experience) Access to a Swagger/OpenAPI documentation page hosted on the central server.
Data Attributes	• API Endpoint, String, URL Path.
• HTTP Method, Enum, GET/POST/PUT/DELETE.
• Data Format, String, JSON/XML.
• Auth Token, String, Bearer Token.
UX Flow & Navigation	1. Developer navigates to https://server-url/api/docs.
2. Developer authenticates with API credentials.
3. Developer views the "Vehicle Data" endpoint.
4. Developer tests a "GET" request via the interface.
5. System returns standard JSON response.
Notes / Assumptions	Refers to RFP Item 24 (Modular expansion) and Item 41 (Open standards and APIs).
•	7.2 Sub-component: Reliability and Recovery
User Story ID	023
User Story	As an Operations Manager, I want the system to support a Business Continuity and Disaster Recovery plan, so that operations can be restored quickly in the event of a catastrophic failure.
Acceptance Criteria	• Given a primary server failure, when the disaster recovery protocol is initiated, then the system must failover to the redundant infrastructure with minimal downtime.
• Given a data corruption event, when a restore is triggered, then the system must be able to recover data from the last secure backup point.
• UI/UX: A "System Status" page indicating "Primary Active" or "Failover Active" modes.
Data Attributes	• Disaster Mode, Boolean, True/False.
• Last Backup Timestamp, DateTime, UTC.
• RTO (Recovery Time Objective), Integer, Target minutes.
• RPO (Recovery Point Objective), Integer, Target minutes.
UX Flow & Navigation	1. Critical Failure detected on Primary Node.
2. Admin logs into DR Console.
3. Admin clicks "Initiate Failover".
4. System switches traffic to Secondary Node.
5. Dashboard updates status to "Running on DR Site".
Notes / Assumptions	Refers to RFP Item 36.
6.0 Main Module: Security and Compliance (Continued)
•	6.1 Sub-component: Data Security
User Story ID	024
User Story	As a Security Officer, I want all data at rest to be encrypted using high-standard encryption algorithms, so that sensitive vehicle and owner data is protected even if physical storage is compromised.
Acceptance Criteria	• Given inspection data is written to the database disk, when it is stored, then it must be encrypted using AES-256 or higher standards.
• Given a database export or backup is created, when the file is generated, then it must also remain in an encrypted state.
• UI/UX: (Backend Function) No specific UI, but the "Security Configuration" panel should display "Encryption at Rest: Enabled (AES-256)".
Data Attributes	• Encryption Algorithm, String, "AES-256".
• Key Rotation Date, Date, Scheduled timestamp.
• Encryption Status, Boolean, True (Enforced).
UX Flow & Navigation	1. Admin navigates to "Security Settings".
2. Views "Database Encryption" section.
3. Verifies status is "Enabled".
4. (Backend) System handles transparent encryption/decryption during Read/Write operations.
Notes / Assumptions	Refers to RFP Item 49.
3.0 Main Module: Central Management System (Continued)
•	3.3 Sub-component: Configuration and Development
User Story ID	025
User Story	As an Internal Developer, I want the system to provide co-development capabilities, so that I can collaborate on feature development and customize the system using in-house resources.
Acceptance Criteria	• Given the need to add a custom field or workflow step, when I access the development module, then I must be able to modify configuration files or scripts without voiding the core system warranty.
• Given a new feature is developed locally, when tested, then I must be able to deploy it to the central repository for distribution to centers.
• UI/UX: A "Developer Mode" or "Configuration Studio" interface allowing secure access to non-compiled code or scriptable interfaces.
Data Attributes	• Script ID, String, Unique Identifier.
• Module Name, String, Target component.
• Version Control Tag, String, Git Commit Hash.
• Deployment Status, Enum, Staged/Production.
UX Flow & Navigation	1. Developer logs in with elevated permissions.
2. Navigates to "System Configuration" -> "Dev Tools".
3. Selects "Form Editor".
4. Adds a new field "Custom Tag".
5. Commits changes to the version control system.
Notes / Assumptions	Refers to RFP Item 10.
User Story ID	026
User Story	As a Finance Manager, I want to configure inspection fees based on vehicle type and inspection category, so that the payment gateway charges the correct amount via Telebirr.
Acceptance Criteria	• Given a "Heavy Truck" is registered, when the payment request is generated, then the system must apply the specific fee configured for that vehicle class.
• Given the need to separate pricing for the central system and individual centers, when configuring fees, then I must be able to define split-payment rules or distinct fee structures.
• UI/UX: A matrix-style input form where rows are Vehicle Types and columns are Inspection Types, allowing easy fee entry.
Data Attributes	• Vehicle Class, Enum, Motorcycle/Automobile/Heavy Truck/Bus.
• Service Type, Enum, Initial/Re-test/Annual.
• Fee Amount, Decimal, Currency.
• GL Code, String, Accounting reference.
UX Flow & Navigation	1. Manager navigates to "Finance Settings".
2. Selects "Fee Configuration".
3. Finds row "Public Transport Bus ( > 60 seats)".
4. Updates "Annual Inspection Fee" to "500 ETB".
5. Saves configuration.
Notes / Assumptions	Refers to RFP Item 12 (Payment integration) and Supplier Obligations (Separate pricing).
7.0 Main Module: Business Continuity and Deployment (Continued)
•	7.1 Sub-component: Scalability and Performance
User Story ID	027
User Story	As a System Architect, I want the system to support horizontal and vertical scalability, so that it can handle the load of 1.2 million annual inspections across 120 centers without performance degradation.
Acceptance Criteria	• Given a spike in traffic (e.g., end-of-month rush), when CPU usage exceeds 70%, then the system must automatically provision additional server instances (horizontal scaling).
• Given the database size grows over time, when storage thresholds are met, then the infrastructure must support increasing disk capacity (vertical scaling) without service interruption.
• UI/UX: (Backend behavior) Dashboard displays "Current Load" and "Active Instances" count.
Data Attributes	• Instance Count, Integer, Number of active nodes.
• CPU Utilization, Percentage, Real-time metric.
• Traffic Load, Integer, Requests per second.
• Auto-scale Policy, String, Rule Definition.
UX Flow & Navigation	1. (Automated) Load Balancer detects high traffic.
2. Auto-scaling group triggers "Add Node".
3. New instance boots and syncs.
4. Traffic is distributed to the new node.
5. Performance stabilizes.
Notes / Assumptions	Refers to RFP Item 18 (1.2m inspections) and Item 39 (Scalability).
1.0 Main Module: Inspection Client Application (Continued)
•	1.3 Sub-component: User Support and Training
User Story ID	028
User Story	As an Inspector, I want to access digital training materials and user manuals directly within the application, so that I can reference standard operating procedures without leaving my station.
Acceptance Criteria	• Given I am unsure about a specific test procedure, when I press the "Help" button, then the system must display the relevant training documentation or video.
• Given the multilingual requirement, when I view the help materials, then they must be available in Amharic and English as per the training deliverable requirements.
• UI/UX: A persistent "?" or "Help" icon in the sidebar that opens a searchable knowledge base overlay.
Data Attributes	• Content ID, String, Unique Reference.
• Content Type, Enum, PDF/Video/HTML.
• Language Tag, Enum, am_ET/en_US.
• Context Tag, String, Screen ID (for context-sensitive help).
UX Flow & Navigation	1. Inspector is on the "Gas Analyzer" screen.
2. Clicks the "?" Help icon.
3. System opens a popup showing "How to calibrate the Gas Analyzer".
4. Inspector selects "Amharic" version.
5. Inspector closes popup and resumes work.
Notes / Assumptions	Refers to RFP Item 33 (Deliver training materials in Amharic and English).
3.0 Main Module: Central Management System (Continued)
•	3.4 Sub-component: Center and Resource Management
User Story ID	029
User Story	As a System Administrator, I want to register and configure inspection centers, including their specific lanes and machines, so that the system accurately reflects the physical infrastructure of the 120 centers nationwide.
Acceptance Criteria	• Given a new center is being deployed, when I create a "Center" record, then I must be able to define its Location, Lane Count, and associated Machine IDs.
• Given a center is active, when I view its profile, then I must be able to see the specific "Lane No" and "Lane Type" configurations (e.g., Heavy vs. Light vehicle lanes).
• UI/UX: A hierarchical tree view: Region -> Center -> Lane -> Connected Machines.
Data Attributes	• Center ID, String, Unique Code.
• Center Name, String, e.g., "Kality Branch".
• Region, String, Geographic Zone.
• Lane Number, Integer, e.g., 1, 2.
• Lane Type, Enum, Light/Heavy/Universal.
UX Flow & Navigation	1. Admin navigates to "Infrastructure Management".
2. Clicks "Add New Center".
3. Enters details for "Bole Center".
4. Adds "Lane 1" (Light Vehicle).
5. Links "Brake Tester ID #123" to Lane 1.
6. Saves Configuration.
Notes / Assumptions	Refers to RFP Item 1 (Inspection center registration) and the "Lideta" form (Lane No / Lane Type).
User Story ID	030
User Story	As a Center Manager, I want to register technicians and assign them to inspections, so that the final reports accurately reflect the "Name of Technician" and "Name of Head" as required by the certification forms.
Acceptance Criteria	• Given a new staff member, when I register them, then I must be able to capture their digital signature for use on reports.
• Given an inspection is starting, when the workflow begins, then the system must tag the logged-in Technician's ID to the record.
• UI/UX: The "Finalize Report" screen must auto-populate the "Technician" and "Head" fields based on the active user session or approval workflow.
Data Attributes	• Staff ID, String, Employee Code.
• Full Name, String, e.g., "Getu".
• Role, Enum, Technician/Head of Inspection.
• Digital Signature, Image/Vector, Stored representation.
• Assignment Date, Date, Active period.
UX Flow & Navigation	1. Manager registers User "Getu".
2. Getu logs in to perform inspection.
3. Getu completes the test.
4. Report generates with "Name of Technician: Getu".
5. "Head" user logs in to countersign/approve.
Notes / Assumptions	Refers to RFP Item 1 (Registration) and the handwritten signatures/names on the provided Inspection Certificate and Lideta Report.
6.0 Main Module: Security and Compliance (Continued)
•	6.2 Sub-component: Localization and Usage (Continued)
User Story ID	031
User Story	As an Inspector, I want the client application to allow responsive usage across desktop, laptop, tablet, and smartphone, so that I can perform visual inspections (walking around the vehicle) using a mobile device while the machine data is captured on the desktop.
Acceptance Criteria	• Given I am logging in on a Tablet, when the visual checklist loads, then the UI must adjust to a touch-friendly layout (large buttons, vertical scrolling).
• Given I am on a Desktop, when the same screen loads, then it should utilize the wider screen real estate for data density.
• UI/UX: The interface must use responsive design frameworks to automatically reflow content based on the device viewport width.
Data Attributes	• Device Type, Enum, Desktop/Tablet/Mobile.
• Viewport Width, Integer, Pixel count.
• Touch Mode, Boolean, Enabled for mobile/tablet.
UX Flow & Navigation	1. Inspector starts inspection on Desktop (Machine tests).
2. Inspector picks up Tablet and logs in.
3. System detects "Tablet" and renders "Mobile View".
4. Inspector walks around car tapping "Pass/Fail".
5. Data syncs back to the Desktop session instantly.
Notes / Assumptions	Refers to RFP Item 14. Essential for the "Visual Inspection" workflow (Item 3).
2.0 Main Module: Core Inspection Operations (Continued)
•	2.3 Sub-component: Result Generation and Reporting (Continued)
User Story ID	032
User Story	As an Inspector, I want to record the issuance of the Registration Sticker, so that the sticker number is securely linked to the specific Annual Inspection Certificate in the system.
Acceptance Criteria	• Given the vehicle has passed inspection, when the certificate is generated, then the system must prompt me to input the "Registration Sticker Number" being issued.
• Given the sticker number is entered, when saved, then the system must validate that this sticker number has not been used previously (inventory control).
• UI/UX: A mandatory input field "Sticker No." appearing only when the Overall Result is "Pass".
Data Attributes	• Sticker Number, String, Unique Serial.
• Issuance Date, Date, Timestamp.
• Issued By, String, User ID.
• Status, Enum, Active/Void/Expired.
UX Flow & Navigation	1. Inspection result calculated as "Pass".
2. Inspector clicks "Issue Certificate".
3. System prompts: "Enter Sticker Number".
4. Inspector types the number from the physical sticker.
5. System validates and saves the record.
6. Certificate prints with the Sticker Number included.
Notes / Assumptions	Refers to the "Annual Technical Inspection Certificate" form field: "...and given Registration Sticker Number".


3.1	2.1 Sub-component: Registration and Workflow
•	Feature: Digitize the end-to-end vehicle inspection process including vehicle, owner, and inspection center registration.
•	Feature: Capture vehicle identification data (Plate Number, Chassis Number, Engine Number, Vehicle Type, Model) as per inspection certificate.
•	Feature: Capture owner details and title certificate book number.
2.2 Sub-component: Machine-Based Inspection
•	Feature: Automate data capture from inspection machines for Alignment, Suspension, and Brakes (Service, Parking, Emergency).
•	Feature: Automate data capture from Gas Analyzers (HC, CO, CO2, O2, Lambda, RPM) and Smoke Meters.
•	Feature: Automate data capture for Headlight intensity and beam.
•	Feature: Automatically generate pass/fail results based on machine inspection data.
•	Feature: Prevent inspection centers from editing machine-generated results.
2.3 Sub-component: Visual Inspection
•	Feature: Enable visual inspection inputs via digital forms replacing manual checklists.
•	Feature: Support specific visual checks for body, engine, lights, steering, and safety equipment as per technical checklists.
•	Feature: Securely capture and attach inspection images and videos to the record.
2.4 Sub-component: Result Generation
•	Feature: Generate and send a combined report (machine + visual link) to the central system.
•	Feature: Support export and printing of inspection results, certificates, and checklists.
3.0 Main Module: Central Management System
3.1 Sub-component: Data Storage and Management
•	Feature: Store all inspection data securely on Tele Cloud with redundancy.
•	Feature: Maintain full vehicle inspection history with easy retrieval.
•	Feature: Implement role-based access control for different user types.
•	Feature: Securely store inspection images and videos.
3.2 Sub-component: System Administration
•	Feature: Provide a remote management console to administer, monitor, and update all client applications across centers.
•	Feature: Configure separate pricing for the central system and individual inspection systems.
•	Feature: Enable co-development capabilities for collaborative feature development with the in-house team.
4.0 Main Module: System Integration
4.1 Sub-component: Video Management System (VMS)
•	Feature: Integrate with VMS for real-time and archived video evidence.
•	Feature: Link inspection images and videos to specific inspection sessions via VMS.
•	Feature: Retrieve and associate archived videos with inspection records.
4.2 Sub-component: Payment Gateway
•	Feature: Integrate Telebirr and other digital payment options for inspection fees.
5.0 Main Module: Analytics and Reporting
5.1 Sub-component: Dashboard and Monitoring
•	Feature: Provide advanced analytics dashboards for failure trends and performance.
•	Feature: Provide real-time reporting on inspection outcomes across all centers.
•	Feature: Monitor compliance with transportation and data regulations.
•	Feature: Provide automated monitoring and alerting for client application health and connectivity.
5.2 Sub-component: Auditing
•	Feature: Log all system activity and user actions in a secure audit trail.
•	Feature: Ensure digital forensics readiness with logs, integrity checks, and non-repudiation mechanisms.
6.0 Main Module: Security and Compliance
6.1 Sub-component: Data Security
•	Feature: Encrypt all data at rest using higher standards encryption algorithms.
•	Feature: Encrypt all data in transit using TLS 1.3 or higher with mutual authentication.
•	Feature: Adhere to national data protection and cybersecurity regulations.
6.2 Sub-component: Localization and Usage
•	Feature: Offer multilingual support: Amharic, Afaan Oromo, Somali, Tigrinya, and English.
•	Feature: Provide responsive UI for desktop, laptop, tablet, and smartphone.
7.0 Main Module: Business Continuity and Deployment
7.1 Sub-component: Reliability
•	Feature: Provide business continuity and disaster recovery plans.
•	Feature: Ensure scalability at both infrastructure and application layers (horizontal/vertical).
7.2 Sub-component: Interoperability
•	Feature: Use open standards and APIs to ensure interoperability and extensibility.

