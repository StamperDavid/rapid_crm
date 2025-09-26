interface VideoGenerationRequest {
  prompt: string;
  duration: number; // in seconds
  resolution: string;
  aspect_ratio: string;
  style: string;
  camera_movement?: string;
  lighting?: string;
  characters?: any;
  environment?: string;
  provider: 'runway' | 'pika' | 'sora' | 'custom';
}

interface VideoGenerationResponse {
  success: boolean;
  job_id: string;
  video_url?: string;
  thumbnail_url?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  cost?: number;
}

interface AIProviderConfig {
  name: string;
  api_key: string;
  base_url: string;
  max_duration: number;
  supported_resolutions: string[];
  cost_per_second: number;
}

class AIVideoGenerationService {
  private providers: Map<string, AIProviderConfig> = new Map();
  private activeJobs: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Get API keys from the database
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      
      if (data.success) {
        data.keys.forEach((key: any) => {
          switch (key.platform) {
            case 'runway':
              this.providers.set('runway', {
                name: 'RunwayML',
                api_key: key.key,
                base_url: 'https://api.runwayml.com/v1',
                max_duration: 180, // 3 minutes
                supported_resolutions: ['720p', '1080p', '4K'],
                cost_per_second: 0.05
              });
              break;
            case 'openrouter':
              // Use OpenRouter for other AI services
              this.providers.set('openrouter', {
                name: 'OpenRouter',
                api_key: key.key,
                base_url: 'https://openrouter.ai/api/v1',
                max_duration: 60,
                supported_resolutions: ['720p', '1080p'],
                cost_per_second: 0.02
              });
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error initializing AI providers:', error);
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          job_id: '',
          status: 'failed',
          progress: 0,
          error: validation.error
        };
      }

      // Create generation job in database
      const jobId = await this.createGenerationJob(request);

      // Start generation process
      this.startGeneration(jobId, request);

      return {
        success: true,
        job_id: jobId,
        status: 'queued',
        progress: 0
      };

    } catch (error) {
      console.error('Error generating video:', error);
      return {
        success: false,
        job_id: '',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private validateRequest(request: VideoGenerationRequest): { valid: boolean; error?: string } {
    const provider = this.providers.get(request.provider);
    
    if (!provider) {
      return { valid: false, error: `Provider ${request.provider} not configured` };
    }

    if (request.duration > provider.max_duration) {
      return { valid: false, error: `Duration exceeds maximum of ${provider.max_duration} seconds` };
    }

    if (!provider.supported_resolutions.includes(request.resolution)) {
      return { valid: false, error: `Resolution ${request.resolution} not supported` };
    }

    if (!request.prompt || request.prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt is required' };
    }

    return { valid: true };
  }

  private async createGenerationJob(request: VideoGenerationRequest): Promise<string> {
    const jobData = {
      job_type: 'video',
      provider: request.provider,
      prompt: request.prompt,
      settings: {
        duration: request.duration,
        resolution: request.resolution,
        aspect_ratio: request.aspect_ratio,
        style: request.style,
        camera_movement: request.camera_movement,
        lighting: request.lighting,
        characters: request.characters,
        environment: request.environment
      },
      status: 'queued',
      progress: 0,
      cost: this.calculateCost(request)
    };

    const response = await fetch('/api/ai/generation-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create generation job');
    }

    return data.job_id;
  }

  private calculateCost(request: VideoGenerationRequest): number {
    const provider = this.providers.get(request.provider);
    if (!provider) return 0;
    
    return request.duration * provider.cost_per_second;
  }

  private async startGeneration(jobId: string, request: VideoGenerationRequest) {
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing', 10);

      // Simulate different generation processes based on provider
      switch (request.provider) {
        case 'runway':
          await this.generateWithRunway(jobId, request);
          break;
        case 'pika':
          await this.generateWithPika(jobId, request);
          break;
        case 'sora':
          await this.generateWithSora(jobId, request);
          break;
        default:
          await this.generateWithCustom(jobId, request);
      }

    } catch (error) {
      console.error('Error in generation process:', error);
      await this.updateJobStatus(jobId, 'failed', 0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async generateWithRunway(jobId: string, request: VideoGenerationRequest) {
    const provider = this.providers.get('runway');
    if (!provider) throw new Error('Runway provider not configured');

    try {
      // Update progress
      await this.updateJobStatus(jobId, 'processing', 25);

      // Simulate API call to RunwayML
      // In a real implementation, this would make actual API calls
      const mockResponse = {
        video_url: `/uploads/generated_videos/${jobId}_video.mp4`,
        thumbnail_url: `/uploads/generated_videos/${jobId}_thumbnail.jpg`,
        duration: request.duration,
        resolution: request.resolution
      };

      // Update progress
      await this.updateJobStatus(jobId, 'processing', 75);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete the job
      await this.updateJobStatus(jobId, 'completed', 100, undefined, mockResponse);

    } catch (error) {
      throw new Error(`Runway generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithPika(jobId: string, request: VideoGenerationRequest) {
    const provider = this.providers.get('pika');
    if (!provider) throw new Error('Pika provider not configured');

    try {
      // Similar implementation for Pika Labs
      await this.updateJobStatus(jobId, 'processing', 30);

      const mockResponse = {
        video_url: `/uploads/generated_videos/${jobId}_video.mp4`,
        thumbnail_url: `/uploads/generated_videos/${jobId}_thumbnail.jpg`,
        duration: request.duration,
        resolution: request.resolution
      };

      await this.updateJobStatus(jobId, 'processing', 80);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.updateJobStatus(jobId, 'completed', 100, undefined, mockResponse);

    } catch (error) {
      throw new Error(`Pika generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithSora(jobId: string, request: VideoGenerationRequest) {
    // Sora implementation (when available)
    await this.updateJobStatus(jobId, 'processing', 20);
    
    const mockResponse = {
      video_url: `/uploads/generated_videos/${jobId}_video.mp4`,
      thumbnail_url: `/uploads/generated_videos/${jobId}_thumbnail.jpg`,
      duration: request.duration,
      resolution: request.resolution
    };

    await this.updateJobStatus(jobId, 'processing', 90);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await this.updateJobStatus(jobId, 'completed', 100, undefined, mockResponse);
  }

  private async generateWithCustom(jobId: string, request: VideoGenerationRequest) {
    // Custom implementation for other providers
    await this.updateJobStatus(jobId, 'processing', 15);
    
    const mockResponse = {
      video_url: `/uploads/generated_videos/${jobId}_video.mp4`,
      thumbnail_url: `/uploads/generated_videos/${jobId}_thumbnail.jpg`,
      duration: request.duration,
      resolution: request.resolution
    };

    await this.updateJobStatus(jobId, 'processing', 85);
    await new Promise(resolve => setTimeout(resolve, 4000));
    await this.updateJobStatus(jobId, 'completed', 100, undefined, mockResponse);
  }

  private async updateJobStatus(
    jobId: string, 
    status: string, 
    progress: number, 
    error?: string, 
    resultData?: any
  ) {
    try {
      const updateData: any = {
        status,
        progress
      };

      if (error) {
        updateData.error_message = error;
      }

      if (resultData) {
        updateData.result_data = resultData;
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      const response = await fetch(`/api/ai/generation-jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        console.error('Failed to update job status');
      }

    } catch (error) {
      console.error('Error updating job status:', error);
    }
  }

  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await fetch(`/api/ai/generation-jobs/${jobId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.job;
      } else {
        throw new Error(data.error || 'Failed to get job status');
      }
    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  async getAvailableProviders(): Promise<AIProviderConfig[]> {
    return Array.from(this.providers.values());
  }

  async getProviderCapabilities(provider: string): Promise<any> {
    const config = this.providers.get(provider);
    if (!config) {
      throw new Error(`Provider ${provider} not found`);
    }

    return {
      name: config.name,
      max_duration: config.max_duration,
      supported_resolutions: config.supported_resolutions,
      cost_per_second: config.cost_per_second,
      estimated_cost: (duration: number) => duration * config.cost_per_second
    };
  }

  // Content generation methods for different types
  async generateSocialMediaContent(prompt: string, platform: string, contentType: string): Promise<any> {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'social_media',
          prompt,
          platform,
          content_type: contentType
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating social media content:', error);
      throw error;
    }
  }

  async generateBlogContent(topic: string, length: string, style: string): Promise<any> {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'blog',
          topic,
          length,
          style
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw error;
    }
  }

  async generateVideoScript(topic: string, duration: number, style: string): Promise<any> {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'video_script',
          topic,
          duration,
          style
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating video script:', error);
      throw error;
    }
  }
}

export const aiVideoGenerationService = new AIVideoGenerationService();
export default aiVideoGenerationService;








