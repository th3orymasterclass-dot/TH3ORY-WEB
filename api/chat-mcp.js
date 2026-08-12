import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Knowledge base rules for TH3ORY Masterclass AI Assistant
const TH3ORY_KNOWLEDGE_BASE = {
  'general-lounge': `You are the TH3ORY AI Assistant (powered by ChatMCP). You provide encouraging, high-level feedback to students in the TH3ORY Masterclass of Influencing. Emphasize growth mindset, daily video reflections, and building magnetic personal presence.`,
  'level-1-presence': `Focus on Level 1 concepts: Vocal Tonality (downward inflections), Strategic Micro-Pauses (1.5-second silences before key statements), Unshakable Room Presence, Eye Contact, and Body Language Anchoring.`,
  'level-2-power': `Focus on Level 2 concepts: Laws of High-Stakes Persuasion, Value Framing, Frame Control in Negotiations, Emotional Reciprocity, and Ethical Influence Strategies.`,
  'capstone-showcase': `Focus on Capstone Assignments: Provide constructive, actionable feedback on students' 5 Weekly Capstone Video Submissions. Highlight vocal clarity, pacing, posture, and closing impact.`,
  'q-and-a-instructor': `Act as Mentalist Sravan's AI Co-Instructor. Answer technical course questions directly, accurately, and concisely. Keep your tone authoritative yet inspiring.`
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { channel, userMessage, senderName } = req.body || {};
  if (!userMessage) {
    return res.status(400).json({ success: false, error: 'Missing userMessage in request payload' });
  }

  const activeChannel = channel || 'general-lounge';
  const systemContext = TH3ORY_KNOWLEDGE_BASE[activeChannel] || TH3ORY_KNOWLEDGE_BASE['general-lounge'];

  try {
    // Generate ChatMCP response
    let aiResponseText = '';
    const queryLower = userMessage.toLowerCase();

    if (queryLower.includes('tonality') || queryLower.includes('voice') || queryLower.includes('pause')) {
      aiResponseText = `💡 **Vocal Command Insight**: Master downward inflections at the end of sentences to convey unwavering authority. Pair this with a deliberate 1.5-second micro-pause right before your core point to lock the audience's full focus.`;
    } else if (queryLower.includes('presence') || queryLower.includes('eye contact') || queryLower.includes('body language')) {
      aiResponseText = `👁️ **Room Presence Protocol**: Maintain steady, unbroken eye contact for 3-4 seconds per individual. Avoid fidgeting or unnecessary micro-gestures — still posture radiates calm dominance in any high-stakes room.`;
    } else if (queryLower.includes('persuasion') || queryLower.includes('negotiation') || queryLower.includes('deal')) {
      aiResponseText = `⚡ **Frame Control Strategy**: In high-stakes negotiations, never defend your value — frame the conversation so the other party evaluates how their goals align with your standard. Reciprocity starts with offering perceived high-value insights first.`;
    } else if (queryLower.includes('capstone') || queryLower.includes('video') || queryLower.includes('assignment')) {
      aiResponseText = `🏆 **Capstone Review Guide**: Excellent effort! For your next video submission, focus on: (1) Framing your shoulders squarely to camera, (2) Eliminating filler words like "um/ah", and (3) Ending with a crisp call-to-action.`;
    } else {
      aiResponseText = `🤖 **ChatMCP Insight for ${senderName || 'Student'}**: Great reflection in #${activeChannel}! Applying these TH3ORY principles consistently in your daily interactions is what transforms knowledge into magnetic influence. Keep pushing!`;
    }

    const aiMessagePayload = {
      channel: activeChannel,
      sender_name: 'TH3ORY AI Assistant (ChatMCP)',
      sender_email: 'chatmcp@th3ory.online',
      sender_role: 'ai_bot',
      message: aiResponseText,
      created_at: new Date().toISOString()
    };

    // If Supabase credentials present, insert directly into database
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await supabase.from('community_messages').insert([aiMessagePayload]);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: `ai_${Date.now()}`,
        channel: activeChannel,
        senderName: 'TH3ORY AI Assistant (ChatMCP)',
        senderRole: 'ai_bot',
        senderEmail: 'chatmcp@th3ory.online',
        message: aiResponseText,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[ChatMCP API] Exception generating response:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}
