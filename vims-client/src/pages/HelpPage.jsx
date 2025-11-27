import { useState } from 'react';

const HELP_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    content: [
      { q: 'How do I start a new inspection?', a: 'Click "New Inspection" from the Dashboard or use the keyboard shortcut Ctrl+N. You will be guided through vehicle registration, visual inspection, and machine tests.' },
      { q: 'What are the inspection stages?', a: '1. Vehicle Registration - Enter vehicle details\n2. Visual Inspection - 30-point checklist\n3. Machine Tests - Alignment, Suspension, Brakes, Emissions\n4. Results & Certificate - Generate report and print certificate' },
      { q: 'How do I resume an incomplete inspection?', a: 'Go to Inspections → Active Inspections to see all in-progress inspections. Click "Continue" to resume from where you left off.' },
    ],
  },
  {
    id: 'visual-inspection',
    title: 'Visual Inspection',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    content: [
      { q: 'How do I mark items as correct or defective?', a: 'Each checklist item has three options: Correct (green), Not Correct (red), or N/A (gray). Tap/click the appropriate button for each item.' },
      { q: 'What happens when I mark an item as "Not Correct"?', a: 'A modal will appear asking you to select a defect reason from a dropdown and capture a photo as evidence. Both are required before proceeding.' },
      { q: 'Can I mark all items in a zone as correct at once?', a: 'Yes! Each zone has a "Mark All Correct" button that will set all items in that zone to Correct status.' },
    ],
  },
  {
    id: 'machine-tests',
    title: 'Machine Tests',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    content: [
      { q: 'How do machine tests work?', a: 'Machine tests are automatically captured from connected inspection equipment. The system reads data from alignment, suspension, brake, and emission testing machines.' },
      { q: 'What if a test fails?', a: 'Failed tests are highlighted in red. You can re-test up to 2 times per test type. All re-tests are logged for audit purposes.' },
      { q: 'How are pass/fail thresholds determined?', a: 'Thresholds are set according to Ethiopian Transport Authority regulations. For example, brake efficiency must be ≥50%, and CO emissions must be ≤4.5%.' },
    ],
  },
  {
    id: 'reports-certificates',
    title: 'Reports & Certificates',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    content: [
      { q: 'How do I print a certificate?', a: 'After completing all inspection stages, go to the Results page. Click "Print Certificate" to open the print dialog. Enter the sticker number when prompted.' },
      { q: 'What reports are available?', a: 'Two reports are generated: 1) Technical Inspection Report (detailed machine test results) and 2) Annual Technical Inspection Certificate (official certificate for the vehicle owner).' },
      { q: 'Can I reprint a certificate?', a: 'Yes, go to Inspections → Completed Inspections, find the inspection, and click "Print" to reprint the certificate.' },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8" />
      </svg>
    ),
    content: [
      { q: 'Ctrl + N', a: 'Start a new inspection' },
      { q: 'Ctrl + D', a: 'Go to Dashboard' },
      { q: 'Ctrl + P', a: 'Print current page/report' },
      { q: 'Ctrl + F', a: 'Search' },
      { q: 'Escape', a: 'Close modals and dropdowns' },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    content: [
      { q: 'Machine not connecting?', a: 'Check that the machine is powered on and connected to the network. Verify the machine status on Centers → Machine Status page. Contact IT support if the issue persists.' },
      { q: 'Sync failed?', a: 'Check your internet connection. The system will automatically retry syncing when connection is restored. You can also manually trigger sync from the status indicator.' },
      { q: 'Print not working?', a: 'Ensure your printer is connected and has paper. Try the browser print function (Ctrl+P) as an alternative.' },
    ],
  },
];

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSection = HELP_SECTIONS.find(s => s.id === activeSection);

  const filteredContent = searchQuery
    ? HELP_SECTIONS.flatMap(s => 
        s.content.filter(item => 
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(item => ({ ...item, section: s.title }))
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Help & User Guide</h1>
        <input
          type="text"
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
        />
      </div>

      {searchQuery ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results for "{searchQuery}"
          </h2>
          {filteredContent.length === 0 ? (
            <p className="text-gray-500">No results found.</p>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-xs text-[#009639] font-medium mb-1">{item.section}</p>
                  <p className="font-medium text-gray-900">{item.q}</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-2">
              {HELP_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition ${
                    activeSection === section.id
                      ? 'bg-[#009639] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-white' : 'text-gray-400'}>
                    {section.icon}
                  </span>
                  {section.title}
                </button>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4">
              <h3 className="font-semibold text-blue-900 text-sm">Need more help?</h3>
              <p className="text-xs text-blue-700 mt-1">Contact IT Support</p>
              <p className="text-xs text-blue-600 mt-2">
                Email: support@ethiotelecom.et<br />
                Phone: +251 11 551 0000
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#009639]">{currentSection?.icon}</span>
                <h2 className="text-lg font-semibold text-gray-900">{currentSection?.title}</h2>
              </div>
              <div className="space-y-4">
                {currentSection?.content.map((item, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-medium text-gray-900">{item.q}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-r from-[#009639] to-[#007c2d] rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-3">Quick Reference</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium opacity-80">Inspection Flow</p>
            <p className="mt-1">Registration → Visual → Machine → Results</p>
          </div>
          <div>
            <p className="font-medium opacity-80">Pass Criteria</p>
            <p className="mt-1">All visual items correct + All machine tests pass</p>
          </div>
          <div>
            <p className="font-medium opacity-80">Certificate Validity</p>
            <p className="mt-1">1 year from inspection date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

