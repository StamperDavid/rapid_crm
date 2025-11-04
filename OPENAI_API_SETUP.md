# OpenAI API Setup for TRUE Intelligent RPA Agent

## Required for TRUE Intelligence

The RPA agent uses OpenAI's GPT-4 for actual semantic understanding of questions, not pattern matching.

---

## Setup Steps

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Add to Environment Variables

Create a `.env` file in the project root:

```env
VITE_OPENAI_API_KEY=sk-your-actual-key-here
VITE_OPENAI_MODEL=gpt-4
VITE_RPA_INTELLIGENCE_MODE=llm
```

### 3. Restart Servers

```powershell
# Stop both servers (Ctrl+C)

# Restart backend
cd C:\Users\David\PycharmProjects\Rapid_CRM
node server.js

# Restart frontend (new terminal)
cd C:\Users\David\PycharmProjects\Rapid_CRM
npm run dev
```

---

## How It Works

**With API Key (TRUE Intelligence):**
```
Question: "Are you a 3rd Party Service provider?"
  ↓
GPT-4 analyzes question semantically
  ↓
Understands: Asking if applicant is intermediary service provider
  ↓
Checks client data: Has own fleet, not providing services to others
  ↓
Answer: "No" (confidence: 1.0)
  ↓
Reasoning: "Client operates own fleet, registering for themselves"
```

**Without API Key (Pattern Matching Fallback):**
```
Question: "Are you a 3rd Party Service provider?"
  ↓
Pattern matching: looks for keywords
  ↓
May fail if wording is unusual
  ↓
Falls back to conservative answer or alerts human
```

---

## Cost Estimate

**Per application (77 pages, ~30-40 questions):**
- GPT-4: ~$0.15 - $0.30 per application
- GPT-3.5-turbo: ~$0.02 - $0.05 per application

**For 918 training scenarios:**
- GPT-4: ~$140 - $275 total
- GPT-3.5-turbo: ~$18 - $45 total

**Recommended:**
- Use GPT-4 for training (best accuracy)
- Can use GPT-3.5-turbo for production (cheaper, still intelligent)

---

## Testing Without API Key

The agent will work without an API key using pattern matching fallback, but it's NOT truly intelligent. It will:
- Work for common question phrasings
- May fail on unusual wordings
- Alert you when uncertain

---

## Verification

After setting up, check the console:
- ✅ "🤖 OpenAI API key detected - forcing LLM mode for true intelligence"
- ✅ "🤖 Using LLM for true intelligence..."
- ✅ "🤖 LLM Decision: {answer, reasoning, confidence}"

If you see:
- ⚠️ "LLM unavailable, using pattern matching fallback"
→ API key not set or invalid

---

## Alternative: Use Anthropic Claude

If you prefer Claude over GPT:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_RPA_LLM_PROVIDER=anthropic
```

Code will be updated to support both providers.

