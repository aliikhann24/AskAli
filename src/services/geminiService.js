import profile from '../data/profile';

const API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const URL = `https://api.groq.com/openai/v1/chat/completions`;

const systemContext = `
You are a helpful assistant representing ${profile.name}, a ${profile.title}.
Answer questions about him in a friendly, professional, and concise way (2-4 sentences max).
Only answer based on the information provided. If asked something not covered, say
"Ali hasn't shared that info yet — feel free to reach out at ${profile.email}".
Never make up information.

Here is everything you know about ${profile.name}:

ABOUT: ${profile.about}

LOCATION: ${profile.location}

SKILLS: ${profile.skills.join(', ')}

LANGUAGES SPOKEN: ${profile.languages.join(', ')}

PROJECTS:
${profile.projects.map(p => `- ${p.name}: ${p.description} (Tech: ${p.tech.join(', ')})`).join('\n')}

EDUCATION: ${profile.university}, ${profile.semester}

EXPERIENCE: ${profile.experience}

AVAILABILITY: ${profile.availability}

PORTFOLIO: ${profile.portfolio}

CONTACT: Email — ${profile.email} | Phone — ${profile.phone} | GitHub — ${profile.github} | LinkedIn — ${profile.linkedin}

FUN FACTS: ${profile.funFacts.join(' | ')}
`;

export async function askGemini(userMessage, chatHistory) {
  const filtered = chatHistory.filter(msg => msg.role === 'user' || msg.role === 'model');

  const validHistory = [];
  for (let i = 0; i < filtered.length; i++) {
    const msg = filtered[i];
    if (validHistory.length === 0 && msg.role !== 'user') continue;
    if (validHistory.length > 0 && msg.role === validHistory[validHistory.length - 1].role) continue;
    validHistory.push(msg);
  }

  const messages = [
    { role: 'system', content: systemContext },
    ...validHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const json = await res.json();

    if (json.error) {
      console.error('Groq error:', json.error.message);
      return `Error: ${json.error.message}`;
    }

    return json.choices?.[0]?.message?.content
      || "Sorry, I couldn't process that. Try again!";

  } catch (err) {
    console.error('Network error:', err);
    return 'Network error — check your connection and try again.';
  }
}