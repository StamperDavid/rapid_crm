interface ContentGenerationRequest {
  type: 'social_media' | 'blog' | 'video_script' | 'email' | 'newsletter';
  prompt: string;
  platform?: string;
  contentType?: string;
  length?: 'short' | 'medium' | 'long';
  style?: 'professional' | 'casual' | 'educational' | 'promotional';
  targetAudience?: string;
  brandVoice?: string;
  keywords?: string[];
  hashtags?: string[];
}

interface ContentGenerationResponse {
  success: boolean;
  content: string;
  title?: string;
  excerpt?: string;
  hashtags?: string[];
  keywords?: string[];
  wordCount?: number;
  readingTime?: number;
  suggestions?: string[];
  error?: string;
}

interface SocialMediaPost {
  platform: string;
  contentType: string;
  content: string;
  hashtags: string[];
  mentions: string[];
  callToAction: string;
  engagementPrediction: number;
  optimalPostingTime?: string;
}

interface BlogArticle {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  wordCount: number;
  readingTime: number;
  featuredImage?: string;
}

interface VideoScript {
  title: string;
  script: string;
  scenes: Array<{
    sceneNumber: number;
    duration: number;
    description: string;
    dialogue?: string;
    visualCues: string[];
    audioCues: string[];
  }>;
  totalDuration: number;
  style: string;
  targetAudience: string;
}

class AIContentGenerationService {
  private apiKey: string | null = null;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      
      if (data.success) {
        const openRouterKey = data.keys.find((key: any) => key.platform === 'openrouter');
        if (openRouterKey) {
          this.apiKey = openRouterKey.key;
        }
      }
    } catch (error) {
      console.error('Error initializing API key:', error);
    }
  }

  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      const prompt = this.buildPrompt(request);
      const response = await this.callOpenAI(prompt, request.type);

      return this.parseResponse(response, request);

    } catch (error) {
      console.error('Error generating content:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    const basePrompt = `You are a professional content creator specializing in transportation and logistics industry content. Create high-quality, engaging content that resonates with transportation professionals, fleet managers, and logistics companies.`;

    switch (request.type) {
      case 'social_media':
        return this.buildSocialMediaPrompt(request, basePrompt);
      case 'blog':
        return this.buildBlogPrompt(request, basePrompt);
      case 'video_script':
        return this.buildVideoScriptPrompt(request, basePrompt);
      case 'email':
        return this.buildEmailPrompt(request, basePrompt);
      case 'newsletter':
        return this.buildNewsletterPrompt(request, basePrompt);
      default:
        return `${basePrompt}\n\nCreate content based on: ${request.prompt}`;
    }
  }

  private buildSocialMediaPrompt(request: ContentGenerationRequest, basePrompt: string): string {
    const platform = request.platform || 'general';
    const contentType = request.contentType || 'post';
    const style = request.style || 'professional';
    const targetAudience = request.targetAudience || 'transportation professionals';

    return `${basePrompt}

Create a ${contentType} for ${platform} that:
- Targets: ${targetAudience}
- Style: ${style}
- Topic: ${request.prompt}
- Length: ${request.length || 'medium'}

Requirements:
- Include relevant hashtags (5-10)
- Add a compelling call-to-action
- Optimize for engagement
- Use industry-specific terminology appropriately
- Include emojis sparingly and professionally

Format the response as JSON with:
{
  "content": "main post content",
  "hashtags": ["array", "of", "hashtags"],
  "callToAction": "call to action text",
  "engagementPrediction": 85
}`;
  }

  private buildBlogPrompt(request: ContentGenerationRequest, basePrompt: string): string {
    const length = request.length || 'medium';
    const style = request.style || 'professional';
    const targetAudience = request.targetAudience || 'transportation professionals';

    const wordCounts = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words'
    };

    return `${basePrompt}

Create a comprehensive blog article that:
- Topic: ${request.prompt}
- Target Audience: ${targetAudience}
- Style: ${style}
- Length: ${wordCounts[length]}
- Category: Transportation/Logistics

Requirements:
- Compelling headline
- SEO-optimized title and meta description
- Well-structured with headings and subheadings
- Include practical tips and actionable advice
- Use industry examples and case studies
- Include relevant keywords naturally
- Add a strong conclusion with next steps

Format the response as JSON with:
{
  "title": "compelling headline",
  "content": "full article content with HTML formatting",
  "excerpt": "brief summary (150-200 words)",
  "category": "Transportation",
  "tags": ["array", "of", "relevant", "tags"],
  "seoTitle": "SEO optimized title",
  "seoDescription": "meta description (150-160 chars)",
  "seoKeywords": ["array", "of", "keywords"],
  "wordCount": 1200,
  "readingTime": 5
}`;
  }

  private buildVideoScriptPrompt(request: ContentGenerationRequest, basePrompt: string): string {
    const duration = request.length === 'short' ? '30-60 seconds' : 
                    request.length === 'medium' ? '1-2 minutes' : '2-3 minutes';
    const style = request.style || 'professional';
    const targetAudience = request.targetAudience || 'transportation professionals';

    return `${basePrompt}

Create a video script that:
- Topic: ${request.prompt}
- Duration: ${duration}
- Style: ${style}
- Target Audience: ${targetAudience}

Requirements:
- Break into clear scenes with timing
- Include visual and audio cues
- Add engaging dialogue or narration
- Include call-to-action
- Optimize for social media platforms
- Use transportation industry context

Format the response as JSON with:
{
  "title": "video title",
  "script": "overall script description",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 15,
      "description": "scene description",
      "dialogue": "spoken content",
      "visualCues": ["visual", "elements"],
      "audioCues": ["audio", "elements"]
    }
  ],
  "totalDuration": 60,
  "style": "${style}",
  "targetAudience": "${targetAudience}"
}`;
  }

  private buildEmailPrompt(request: ContentGenerationRequest, basePrompt: string): string {
    const style = request.style || 'professional';
    const targetAudience = request.targetAudience || 'transportation professionals';

    return `${basePrompt}

Create an email that:
- Topic: ${request.prompt}
- Style: ${style}
- Target Audience: ${targetAudience}
- Length: ${request.length || 'medium'}

Requirements:
- Compelling subject line
- Clear value proposition
- Professional but engaging tone
- Include call-to-action
- Mobile-friendly formatting
- Transportation industry focus

Format the response as JSON with:
{
  "subject": "email subject line",
  "content": "email body content",
  "callToAction": "call to action text"
}`;
  }

  private buildNewsletterPrompt(request: ContentGenerationRequest, basePrompt: string): string {
    return `${basePrompt}

Create a newsletter that:
- Topic: ${request.prompt}
- Style: ${request.style || 'professional'}
- Target Audience: ${request.targetAudience || 'transportation professionals'}

Requirements:
- Engaging subject line
- Multiple sections with clear headings
- Mix of content types (news, tips, case studies)
- Include relevant links and CTAs
- Professional formatting
- Industry insights and updates

Format the response as JSON with:
{
  "subject": "newsletter subject",
  "content": "newsletter content with sections",
  "sections": ["array", "of", "section", "titles"]
}`;
  }

  private async callOpenAI(prompt: string, contentType: string): Promise<any> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Rapid CRM Content Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator specializing in transportation and logistics. Always respond with valid JSON format as requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseResponse(response: string, request: ContentGenerationRequest): ContentGenerationResponse {
    try {
      const parsed = JSON.parse(response);
      
      return {
        success: true,
        content: parsed.content || parsed.script || '',
        title: parsed.title,
        excerpt: parsed.excerpt,
        hashtags: parsed.hashtags,
        keywords: parsed.seoKeywords || parsed.keywords,
        wordCount: parsed.wordCount,
        readingTime: parsed.readingTime,
        suggestions: parsed.suggestions
      };
    } catch (error) {
      // If JSON parsing fails, return the raw response
      return {
        success: true,
        content: response,
        wordCount: response.split(' ').length,
        readingTime: Math.ceil(response.split(' ').length / 200)
      };
    }
  }

  // Specialized methods for different content types
  async generateSocialMediaPost(
    topic: string,
    platform: string,
    contentType: string = 'post'
  ): Promise<SocialMediaPost> {
    const response = await this.generateContent({
      type: 'social_media',
      prompt: topic,
      platform,
      contentType,
      length: 'short',
      style: 'professional'
    });

    return {
      platform,
      contentType,
      content: response.content,
      hashtags: response.hashtags || [],
      mentions: [],
      callToAction: 'Learn more about our transportation solutions',
      engagementPrediction: 85
    };
  }

  async generateBlogArticle(
    topic: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<BlogArticle> {
    const response = await this.generateContent({
      type: 'blog',
      prompt: topic,
      length,
      style: 'professional'
    });

    return {
      title: response.title || topic,
      content: response.content,
      excerpt: response.excerpt || '',
      category: 'Transportation',
      tags: response.keywords || [],
      seoTitle: response.title || topic,
      seoDescription: response.excerpt || '',
      seoKeywords: response.keywords || [],
      wordCount: response.wordCount || 0,
      readingTime: response.readingTime || 0
    };
  }

  async generateVideoScript(
    topic: string,
    duration: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<VideoScript> {
    const response = await this.generateContent({
      type: 'video_script',
      prompt: topic,
      length: duration,
      style: 'professional'
    });

    return {
      title: response.title || topic,
      script: response.content,
      scenes: [],
      totalDuration: 60,
      style: 'professional',
      targetAudience: 'transportation professionals'
    };
  }

  // Content optimization methods
  async optimizeForSEO(content: string, keywords: string[]): Promise<string> {
    const prompt = `Optimize this content for SEO by naturally incorporating these keywords: ${keywords.join(', ')}. 
    Keep the content engaging and readable while improving SEO performance.

    Content to optimize:
    ${content}`;

    const response = await this.callOpenAI(prompt, 'seo_optimization');
    return response;
  }

  async generateContentVariations(originalContent: string, count: number = 3): Promise<string[]> {
    const variations: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const prompt = `Create a variation of this content with a different tone or approach while maintaining the same core message:

      Original content:
      ${originalContent}

      Variation ${i + 1}:`;

      const response = await this.callOpenAI(prompt, 'content_variation');
      variations.push(response);
    }

    return variations;
  }

  // Industry-specific content generation
  async generateComplianceContent(topic: string): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'blog',
      prompt: `ELD/HOS compliance: ${topic}`,
      style: 'educational',
      targetAudience: 'fleet managers and drivers',
      keywords: ['ELD', 'HOS', 'compliance', 'DOT', 'fleet management']
    });
  }

  async generateSafetyContent(topic: string): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'blog',
      prompt: `Transportation safety: ${topic}`,
      style: 'educational',
      targetAudience: 'drivers and safety managers',
      keywords: ['safety', 'transportation', 'fleet safety', 'driver training']
    });
  }

  async generateTechnologyContent(topic: string): Promise<ContentGenerationResponse> {
    return this.generateContent({
      type: 'blog',
      prompt: `Transportation technology: ${topic}`,
      style: 'professional',
      targetAudience: 'fleet managers and technology decision makers',
      keywords: ['fleet technology', 'transportation tech', 'automation', 'telematics']
    });
  }
}

export const aiContentGenerationService = new AIContentGenerationService();
export default aiContentGenerationService;








