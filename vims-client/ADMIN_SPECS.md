Administration & Configuration
1.0 Module: Identity & Access Management (IAM)
Sub-component: User Administration
Sub-component: Role & Permission Matrix
2.0 Module: Center & Asset Registry
Sub-component: Center Onboarding & Geo-Spatial Security
Sub-component: Machine Whitelisting
3.0 Module: Master Configuration Engine
Sub-component: Dynamic Test Standards
Sub-component: Fee & Tax Configuration
4.0 Module: Reporting & Analytics Configuration
Sub-component: Regional Template Management


------------------------------------------------------------------------------------------------------------------------------------

1.	Functional Requirements (User Stories) 
1.1.	Identity & Access Management (IAM)
User Story ID	Admin-001
User Story	As a Super Administrator, I want to create and manage user accounts with specific regional scopes, so that users can only access data relevant to their specific jurisdiction (e.g., Oromia vs. Addis Ababa).
Acceptance Criteria	• Given the "User Management" screen, When I click "Create User", Then a form must appear requiring personal details and a "Scope Assignment".
• Given the "Scope" dropdown, When I select "Regional", Then a secondary dropdown must appear to select the specific Region (e.g., Amhara).
• Given a user is assigned to "Center Scope", When they log in, Then they must strictly be prevented from viewing any data outside that specific center.
• UI/UX: A datatable listing users with columns for Name, Role, and Assigned Scope. The "Add User" modal must have dynamic dropdowns where selecting the Role updates the available Scope options.
Data Attributes	• User_ID, String, Auto-generated UUID.
• Full_Name, String, Required.
• Role_ID, Integer, Linked to Role Matrix.
• Scope_Type, Enum, [National, Regional, Center].
• Scope_Value, String, ID of the Region or Center.
• Account_Status, Enum, [Active, Suspended].
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Users'.
2. Clicks the '+ Add New User' button.
3. Fills in Name and selects Role 'Regional Authority'.
4. System prompts to select 'Region'. User selects 'Oromia'.
5. Clicks 'Save'.
Notes / Assumptions	Source: Functional Requirements Category 6 (User Access & Roles) and Meeting Notes regarding regional data separation.

User Story ID	Admin-002
User Story	As a Super Administrator, I want to configure a granular Permission Matrix for user roles, so that I can define exactly which actions (Read, Write, Delete, Export) each role can perform on specific modules.
Acceptance Criteria	• Given the "Role Management" interface, When I select a role (e.g., "Viewer"), Then I must see a grid listing all system modules.
• Given the permission grid, When I uncheck the "Export" box for the "Reports" module, Then users with that role must no longer see the "Download PDF/Excel" buttons.
• Given a change is saved, When the affected user updates their session, Then the new permissions must take immediate effect.
• UI/UX: A matrix/grid layout. Rows = Modules (Inspection, Financials, Logs). Columns = Actions (View, Create, Edit, Delete, Export). Cells = Checkboxes.
Data Attributes	• Role_Name, String, Unique.
• Module_ID, String, System Component.
• Can_View, Boolean, True/False.
• Can_Edit, Boolean, True/False.
• Can_Delete, Boolean, True/False.
• Can_Export, Boolean, True/False.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Users -> Roles & Permissions'.
2. Clicks 'Edit' next to the 'Enforcement Agent' role.
3. Locates the 'Financial Reports' row.
4. Unchecks 'View' and 'Export'.
5. Clicks 'Update Role'.
Notes / Assumptions	Source: Functional Requirements Category 6 (Multi-role system with permissions).
1.2.	Center & Asset Registry
User Story ID	Admin-003
User Story	As a Super Administrator, I want to define the Geo-Fence coordinates for a specific Inspection Center, so that the system can automatically flag "Ghost Inspections" performed outside this authorized area.
Acceptance Criteria	• Given the "Center Onboarding" profile, When I access the Location tab, Then I must see an interactive map.
• Given the map, When I drop a pin and define a radius (e.g., 50 meters), Then the system must store these geocoordinates as the valid inspection zone.
• Given an active center, When I save the geo-fence, Then this data must be pushed to the fraud detection engine.
• UI/UX: An embedded map interface (like Google Maps/OpenStreetMap). User clicks to drop a pin, and uses a slider to adjust the radius circle visually.
Data Attributes	• Center_ID, Integer, Unique.
• GPS_Latitude, Decimal, 6 decimal places.
• GPS_Longitude, Decimal, 6 decimal places.
• Geo_Fence_Radius, Integer, Meters (e.g., 50, 100).
• Center_Status, Enum, [Active, Inactive, Suspended].
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Centers'.
2. Selects 'Bole Center 01'.
3. Clicks the 'Location & Geo-Fence' tab.
4. Drags the pin to the exact building location on the satellite map.
5. Sets Radius slider to '100m'.
6. Clicks 'Save Configuration'.
Notes / Assumptions	Source: Functional Requirements Category 5 (Geofencing) and Meeting Notes (Dec 10) regarding "Ghost Inspections" and "GeoReference".

User Story ID	Admin-004
User Story	As a Technical Administrator, I want to whitelist specific Machine Serial Numbers for each center, so that inspection data submitted from unauthorized or unknown devices is automatically rejected.
Acceptance Criteria	• Given the "Asset Registry", When I add a new machine (e.g., Brake Tester), Then I must enter the manufacturer's Serial Number and link it to a specific Center ID.
• Given an API request from a desktop client, When the machine data includes a serial number not in the whitelist, Then the system must reject the data and log a security alert.
• UI/UX: A list view of assets nested under a Center Profile. "Add Machine" modal with fields for Machine Type, Model, and Serial Number.
Data Attributes	• Asset_ID, UUID, Internal System ID.
• Machine_Type, Enum, [Brake Tester, Gas Analyzer, Side Slip].
• Serial_Number, String, Unique Manufacturer ID.
• Assigned_Center_ID, Integer, Foreign Key.
• Asset_Status, Enum, [Active, Maintenance, Retired].
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Centers -> Assets'.
2. Clicks 'Register New Machine'.
3. Selects Type 'Gas Analyzer'.
4. Types Serial Number 'GA-2025-X99'.
5. Assigns to 'Adama Center'.
6. Clicks 'Register'.
Notes / Assumptions	Source: Functional Requirements Category 1 & 3 (Data Handling/Security) and Meeting Notes (Dec 10) regarding identifying models for mass rollout.
1.3.	Master Configuration Engine
User Story ID	Admin-005
User Story	As a Super Administrator, I want to dynamically configure Pass/Fail thresholds for machine tests based on Vehicle Class, so that I can update national safety standards (e.g., Emissions limits) instantly without code deployment.
Acceptance Criteria	• Given the "Test Standards" configuration screen, When I select a Vehicle Class (e.g., "Heavy Truck"), Then I must be able to edit the threshold values for specific tests (e.g., "Max Brake Imbalance").
• Given a change is saved (e.g., changing Max CO% from 0.5 to 0.4), When I click "Publish", Then the new rule must be versioned and pushed to all Center Clients.
• UI/UX: A hierarchical tree view: Vehicle Class -> Test Category -> Parameter. Input fields should be numeric with clear unit labels (%, kN, ppm). A "History" link should show previous values.
Data Attributes	• Rule_ID, Integer, Unique.
• Vehicle_Class_ID, Integer, Linked to Class table.
• Test_Parameter, Enum, [CO_Level, Brake_Efficiency, Headlight_Lux].
• Threshold_Value, Decimal, The limit value.
• Operator, Enum, [Less_Than, Greater_Than].
• Effective_Date, Date, When the rule starts.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Configuration -> Test Standards'.
2. Expands 'Commercial Vehicles' -> 'Heavy Truck'.
3. Selects 'Emissions Test'.
4. Changes 'Max CO' value from '4.5' to '4.0'.
5. Clicks 'Save & Publish'.
Notes / Assumptions	Source: Functional Requirements Category 2 (Inspection Management - Dynamic customization) & Category 9 (Scalability - Role/result configuration dynamic).
User Story ID	Admin-006
User Story	As a Finance Officer, I want to configure a "Partial Payment" logic for Re-inspections, so that vehicle owners are automatically charged a reduced fee when testing only failed components (e.g., Brakes only).
Acceptance Criteria	• Given the "Fee Configuration" screen, When I define a rule for "Re-test", Then I must be able to set a specific percentage of the base fee OR a flat fee per component.
• Given a configured rule, When a vehicle returns for a re-test within the allowed window (e.g., 15 days), Then the system must calculate the fee based on only the failed items from the previous inspection.
• UI/UX: A rule builder interface: "IF [Inspection Type] IS [Retest] AND [Failed Component] IS [Brakes], THEN FEE = [Fixed Amount] OR [% of Base]."
Data Attributes	• Fee_Config_ID, Integer, Unique.
• Service_Type, Enum, [Initial, Retest, Certificate_Print].
• Retest_Window_Days, Integer, e.g., 15.
• Pricing_Model, Enum, [Flat_Rate, Percentage, Per_Component].
• Amount, Decimal, Currency value.
• Tax_Rate, Decimal, % VAT.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Configuration -> Fees'.
2. Clicks 'Add Pricing Rule'.
3. Selects Condition: 'Retest (Brake System Only)'.
4. Inputs Price: '200 ETB'.
5. Toggles 'Apply VAT'.
6. Clicks 'Save'.
Notes / Assumptions	Source: Functional Requirements Category 7 (Payment & Billing - Allow partial payments) and Meeting Notes (Dec 10) regarding retest problems.
1.4.	Reporting & Analytics Configuration
User Story ID	Admin-007
User Story	As a Regional Administrator, I want to customize the Inspection Certificate Template for my specific region, so that printed reports display the correct Regional Logo, Header, and Authorized Signature.
Acceptance Criteria	• Given the "Report Template Manager", When I select my region (e.g., Oromia), Then I must be able to upload a specific image file for the Header Logo and a digital signature image for the Footer.
• Given a template is saved, When a PDF is generated for a center in that region, Then it must strictly use that specific layout.
• UI/UX: A WYSIWYG (What You See Is What You Get) editor or a form with file uploaders for "Header Image", "Watermark", and "Footer Signature". A "Preview PDF" button is essential.
Data Attributes	• Template_ID, Integer, Unique.
• Region_ID, Integer, Linked to Region table.
• Header_Logo_URL, String, Path to image.
• Footer_Signature_URL, String, Path to image.
• Disclaimer_Text, String, Localized legal text.
• Is_Active, Boolean, True/False.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Configuration -> Report Templates'.
2. Selects Region 'Oromia Transport Bureau'.
3. Clicks 'Upload Logo' and selects a file.
4. Edits the 'Legal Disclaimer' text field.
5. Clicks 'Preview' to check the PDF look.
6. Clicks 'Publish Template'.
Notes / Assumptions	Source: Meeting Notes (Dec 10) - "The report should not be generic - it should be customized to the specific region, city and the bolo issuer."
User Story ID	Admin-008
User Story	As a Super Administrator, I want to configure automated email schedules for specific reports, so that stakeholders (e.g., Minister, Finance Head) receive critical data (Revenue, Fraud Alerts) without logging in.
Acceptance Criteria	• Given the "Scheduled Exports" interface, When I create a new schedule, Then I must be able to select a Report Type (e.g., Weekly Revenue), a Recipient Email List, and a Frequency (Daily/Weekly).
• Given the scheduled time arrives, Then the system must generate the report based on the latest data and email it as a secured PDF/Excel attachment.
• UI/UX: A list of active schedules. "Create Schedule" modal with a cron-style frequency picker (e.g., "Every Monday at 08:00") and a multi-select box for Recipients.
Data Attributes	• Schedule_ID, UUID, Unique.
• Report_Type, Enum, [Revenue, Fraud_Audit, Ops_Summary].
• Frequency, Enum, [Daily, Weekly, Monthly].
• Recipients, Array, List of email addresses.
• Format, Enum, [PDF, Excel, CSV].
• Last_Run_Status, Enum, [Success, Failed].
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Reports -> Schedules'.
2. Clicks 'New Schedule'.
3. Selects Report: 'Weekly Fraud Alert Summary'.
4. Enters email: 'minister@transport.gov.et'.
5. Sets Time: 'Friday 17:00'.
6. Clicks 'Activate'.
Notes / Assumptions	Source: Functional Requirements Category 4 (Reporting - Auto-notify stakeholders) and Blueprint (Module C - Export Wizard).
		
1.5.	System Monitoring (The "Watchtower")
User Story ID	Admin-009
User Story	As a Support Administrator, I want to view a real-time "Connectivity Matrix" of all 120 centers, so that I can instantly identify which centers or specific machines are offline and require technical intervention.
Acceptance Criteria	• Given the "System Health" dashboard, When I view the Center Matrix, Then I must see a grid of all centers color-coded by status (Green=Online, Red=Offline, Yellow=Syncing).
• Given I click on a specific center (e.g., "Center #12"), When the detail view opens, Then I must see the connection status of each individual machine (e.g., "Brake Tester: Disconnected").
• Given a center has been offline for > 1 hour, When the threshold is crossed, Then the system must auto-generate a support ticket/alert.
• UI/UX: A high-density grid view. Tooltips on hover showing "Last Heartbeat" timestamp. A "Filter by Status" dropdown (e.g., Show only Offline).
Data Attributes	• Center_ID, Integer, Unique.
• Connectivity_Status, Enum, [Online, Offline, Unstable].
• Last_Heartbeat, Timestamp, UTC.
• Machine_Status_Map, JSON, {MachineID: Status}.
• Offline_Duration, TimeDelta, Calculated duration.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> System Health'.
2. Observes the 'Connectivity Matrix'.
3. Filters view to 'Offline Centers'.
4. Clicks on 'Bahir Dar Center'.
5. Sees 'Gas Analyzer' is offline.
Notes / Assumptions	Source: Functional Requirements Category 5 (System Monitoring - Real-time dashboard) & Meeting Notes (Monitoring system requirements).

User Story ID	Admin-010
User Story	As a Moderator/Auditor, I want to receive automated "Fraud Alerts" triggered by Geo-Fencing or Time-Travel anomalies, so that I can investigate potential "Ghost Inspections" immediately.
Acceptance Criteria	• Given an inspection is submitted, When the Tablet GPS coordinates are > 50m from the Center's registered Geo-Fence, Then the system must trigger a "High Priority Fraud Alert".
• Given an alert is triggered, When I view the "Live Alert Feed", Then I must see the Inspector Name, Vehicle Plate, and the specific reason (e.g., "Location Mismatch").
• UI/UX: A notification bell icon in the header with a counter. Clicking it opens a dropdown of recent alerts. A dedicated "Fraud Alerts" page lists alerts in a table with "Resolve/Dismiss" actions.
Data Attributes	• Alert_ID, UUID, Unique.
• Alert_Type, Enum, [GeoFence_Breach, Time_Mismatch, Rapid_Pass].
• Severity, Enum, [High, Medium, Low].
• Inspection_ID, UUID, Link to record.
• Variance_Data, String, e.g., "Distance: 5km".
UX Flow & Navigation	1. System detects anomaly -> 'Fraud Alert' counter increments.
2. User clicks the Notification Bell.
3. Clicks 'View All Alerts'.
4. Reviews alert: 'Distance Variance: 5km'.
5. Clicks 'Investigate' to open the Inspection Detail view.
Notes / Assumptions	Source: Functional Requirements Category 5 (Alerts on system misuse) & Meeting Notes (Dec 10) emphasizing "Ghost Inspections" and GeoReference.
1.6.	Security & Audit
User Story ID	Admin-011
User Story	As a Security Officer, I want to search the Global Audit Trail for specific user actions, so that I can trace who made configuration changes (e.g., changing pass/fail thresholds) or accessed sensitive data.
Acceptance Criteria	• Given the "Audit Log" interface, When I search for a User ID or Event Type (e.g., "Config Change"), Then the system must display a chronological list of matching events.
• Given a "Critical Event" (like changing a fee or threshold), When I expand the log entry, Then I must see the "Before" value and the "After" value.
• UI/UX: A search bar with advanced filters (Date Range, User, Event Category). Results displayed in a table. Critical changes highlighted in yellow.
Data Attributes	• Log_ID, UUID, Unique.
• User_ID, String, Actor.
• Event_Type, Enum, [Login, Config_Change, Data_Export, User_Edit].
• Target_Entity, String, e.g., "Fee Rule #45".
• Old_Value, JSON, Snapshot before change.
• New_Value, JSON, Snapshot after change.
• IP_Address, String, Source IP.
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Security -> Audit Logs'.
2. Sets filter: Event Type = 'Config_Change'.
3. Searches.
4. Expands row: 'User Admin_01 changed Brake Threshold from 50% to 55%'.
Notes / Assumptions	Source: Functional Requirements Category 6 (All user actions must be timestamped and tracked) & Category 1 (Auditable, searchable data).

User Story ID	Admin-012
User Story	As a Super Administrator, I want to initiate a "One-Click Restore" from a cloud backup, so that I can quickly recover the system state in the event of data corruption or a bad update.
Acceptance Criteria	• Given the "Backup Manager" screen, When I select a previous backup file from the list, Then I must see a "Restore" button.
• Given I click "Restore", When the confirmation prompt ("Are you sure? This will overwrite current data") is accepted, Then the system must rollback the database to that snapshot.
• UI/UX: A list of available backups with Date, Size, and Status. The "Restore" action must be protected by a secondary confirmation modal (and potentially MFA).
Data Attributes	• Backup_ID, UUID, Unique.
• Snapshot_Date, DateTime, UTC.
• Size, Integer, Bytes.
• Backup_Type, Enum, [Full, Incremental].
• Restore_Status, Enum, [Pending, In_Progress, Completed, Failed].
UX Flow & Navigation	1. User navigates to 'Admin Sidebar -> Maintenance -> Backups'.
2. Identifies the last healthy backup (e.g., 'Daily_Backup_2025-10-10').
3. Clicks 'Restore'.
4. Enters Admin Password to confirm.
5. System shows progress bar 'Restoring Database...'.
Notes / Assumptions	Source: Functional Requirements Category 10 (Support & Maintenance) & Category 3 (Data Handling - Owned/Controlled by RSIFS).



--------------------------------------------------------------------------------------------------------------------------------------------

Sitemap & Navigation Structure
1. Dashboard (Home)
Command Center: High-level KPIs (Total Inspections, Pass/Fail Rate, Revenue).
Live Map: Geospatial view of all 120 centers.
2. System Monitoring (The "Watchtower")
Connectivity Matrix: Real-time Online/Offline status grid of Centers & Machines.
Fraud Alerts: Live feed of Geo-fence breaches and "Ghost Inspection" flags.
Video Surveillance: Access to live camera feeds and VMS integration.
3. Inspection Operations
Inspection Repository: Searchable history of all vehicle inspections (Search by Plate/VIN).
Verification Queue: Manual review queue for flagged/suspicious inspections.
4. Center & Asset Management
Center Registry: List of all centers, profiles, and contact info.
Geo-Fence Configuration: Map tool to set valid inspection zones per center.
Asset Whitelist: Registry of authorized Machine Serial Numbers.
5. Reports & Analytics
Operational Reports: Inspector performance, Center throughput.
Financial Reports: Revenue reconciliation (Telebirr), Partial payment logs.
Strategic Trends: Failure heatmaps (by Vehicle Model/Region).
Scheduled Exports: Manager for auto-emailing reports.
6. Master Configuration (Business Rules)
Test Standards: Dynamic editor for Pass/Fail thresholds (e.g., Emissions limits).
Vehicle Classes: Definition of vehicle categories.
Fee Structure: Configuration of Base Fees, Taxes, and Retest logic.
Report Templates: Regional customization for printed certificates (Logos/Signatures).
7. Administration (IAM)
User Management: Create/Edit users (Admin, Inspector, Viewer).
Roles & Permissions: Matrix to assign Read/Write/Export rights.
8. Security & Maintenance
Audit Logs: Searchable global trail of all user actions.
Backups: Cloud backup scheduler and "One-Click Restore".
Client Updates: Version control for pushing updates to Desktop Clients.