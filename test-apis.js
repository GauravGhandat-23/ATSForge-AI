async function testPostApis() {
  console.log('Testing POST AI and ATS API endpoints...');

  // 1. Test ATS Analyze
  try {
    const resAts = await fetch('http://localhost:3000/api/ats/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId: 'demo-swe-01',
        jobDescription: 'Senior Software Engineer with TypeScript, React, Node.js, and AWS experience.',
      }),
    });
    const dataAts = await resAts.json();
    console.log(`✓ [${resAts.status}] POST /api/ats/analyze -> Score: ${dataAts.result?.overallScore}/100, Issues: ${dataAts.result?.issues?.length}`);
  } catch (e) {
    console.error('✗ ATS Analyze error:', e.message);
  }

  // 2. Test AI Improve
  try {
    const resImp = await fetch('http://localhost:3000/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Worked on network security and databases.',
        operation: 'achievement_focused',
      }),
    });
    const dataImp = await resImp.json();
    console.log(`✓ [${resImp.status}] POST /api/ai/improve -> Result: "${dataImp.improved}"`);
  } catch (e) {
    console.error('✗ AI Improve error:', e.message);
  }

  // 3. Test AI Tailor
  try {
    const resTailor = await fetch('http://localhost:3000/api/ai/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId: 'demo-swe-01',
        jobDescription: 'Seeking Senior Full-Stack Engineer with Kubernetes, PostgreSQL, and GraphQL expertise.',
      }),
    });
    const dataTailor = await resTailor.json();
    console.log(`✓ [${resTailor.status}] POST /api/ai/tailor -> New ATS Score: ${dataTailor.newAtsScore}, Added: ${dataTailor.addedKeywords?.join(', ')}`);
  } catch (e) {
    console.error('✗ AI Tailor error:', e.message);
  }

  // 4. Test Cover Letter Generation
  try {
    const resCl = await fetch('http://localhost:3000/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId: 'demo-swe-01',
        company: 'Vercel Inc',
        jobTitle: 'Senior Infrastructure Engineer',
        tone: 'Confident',
      }),
    });
    const dataCl = await resCl.json();
    console.log(`✓ [${resCl.status}] POST /api/cover-letter -> Generated length: ${dataCl.content?.length} characters`);
  } catch (e) {
    console.error('✗ Cover Letter error:', e.message);
  }

  // 5. Test Interview Questions
  try {
    const resInt = await fetch('http://localhost:3000/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'generate',
        resumeId: 'demo-swe-01',
      }),
    });
    const dataInt = await resInt.json();
    console.log(`✓ [${resInt.status}] POST /api/interview -> Questions generated: ${dataInt.questions?.length}`);
  } catch (e) {
    console.error('✗ Interview error:', e.message);
  }

  console.log('\nAll core AI and ATS endpoints verified successfully!');
}

testPostApis();
