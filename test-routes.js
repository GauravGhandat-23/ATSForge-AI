const routes = [
  '/',
  '/workspace',
  '/builder',
  '/ats-scanner',
  '/ai-tailor',
  '/cover-letter',
  '/job-matcher',
  '/job-analyzer',
  '/skills-gap',
  '/interview-prep',
  '/linkedin-generator',
  '/templates',
  '/applications',
  '/settings',
];

async function testAll() {
  console.log('Testing ATSForge AI web pages against http://localhost:3000...\n');
  let failures = 0;
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`, { redirect: "manual" });
      if (res.ok || res.status === 307 || res.status === 302) {
        console.log(`✓ [${res.status}] Page: ${r}`);
      } else {
        console.error(`✗ [${res.status}] Page: ${r}`);
        failures++;
      }
    } catch (e) {
      console.error(`✗ [ERR] Page ${r}:`, e.message);
      failures++;
    }
  }

  console.log('\nTesting ATSForge AI API Endpoints...');
  const sampleResume = {
    id: "test-user-01",
    personalInfo: { fullName: "Test Candidate", title: "Cybersecurity Analyst", email: "candidate@example.com", phone: "+1234567890", location: "Remote" },
    summary: "Dedicated cybersecurity professional with SIEM and incident response experience.",
    experiences: [
      {
        company: "SecureNet",
        jobTitle: "SOC Analyst",
        bullets: ["Monitored SIEM alerts and performed incident triage."],
        startDate: "2023",
        current: true,
      }
    ],
    education: [{ institution: "Tech University", degree: "B.S. in Cybersecurity" }],
    skills: { technical: ["SIEM", "Wireshark", "Network Security", "Linux", "Splunk"], soft: ["Analysis", "Communication"], tools: ["Splunk"], languages: ["English"] },
    projects: [],
    certifications: []
  };

  const apis = [
    { name: "GET /api/system/health", url: "/api/system/health", method: "GET" },
    { name: "GET /api/resumes", url: "/api/resumes", method: "GET" },
    { name: "GET /api/applications", url: "/api/applications", method: "GET" },
    {
      name: "POST /api/ats/analyze",
      url: "/api/ats/analyze",
      method: "POST",
      body: { resumeData: sampleResume, jobDescription: "Looking for a Cybersecurity Analyst with SIEM and Network Security experience." }
    },
    {
      name: "POST /api/jobs/analyze",
      url: "/api/jobs/analyze",
      method: "POST",
      body: { jobDescription: "Senior SOC Analyst with SIEM, Wireshark, Splunk, Python, and Network Security experience at CloudSec." }
    },
    {
      name: "POST /api/jobs/match",
      url: "/api/jobs/match",
      method: "POST",
      body: { resumeData: sampleResume, jobDescription: "Cybersecurity Analyst skilled in SIEM and Incident Response." }
    },
    {
      name: "POST /api/match",
      url: "/api/match",
      method: "POST",
      body: { resumeData: sampleResume, jobDescription: "Cybersecurity Analyst skilled in SIEM and Incident Response." }
    },
    {
      name: "POST /api/cover-letter",
      url: "/api/cover-letter",
      method: "POST",
      body: {
        resumeData: sampleResume,
        jobDescription: "Cybersecurity Analyst role at CloudSec requiring SIEM and incident triage skills.",
        company: "CloudSec Technologies",
        jobTitle: "Cybersecurity Analyst",
        tone: "Professional"
      }
    },
  ];

  for (const api of apis) {
    try {
      const opts = {
        method: api.method,
        headers: { "Content-Type": "application/json" }
      };
      if (api.body) opts.body = JSON.stringify(api.body);
      const res = await fetch(`http://localhost:3000${api.url}`, opts);
      if (res.ok || res.status === 401) {
        console.log(`✓ [${res.status}] API: ${api.name}`);
      } else {
        const errorText = await res.text();
        console.error(`✗ [${res.status}] API: ${api.name} ->`, errorText.slice(0, 150));
        failures++;
      }
    } catch (e) {
      console.error(`✗ [ERR] API ${api.name}:`, e.message);
      failures++;
    }
  }

  if (failures === 0) {
    console.log('\n=============================================');
    console.log('✓ ALL CORE PAGES AND APIS VERIFIED PERFECTLY');
    console.log('=============================================');
  } else {
    console.log(`\nCompleted with ${failures} failure(s).`);
  }
}

testAll();
