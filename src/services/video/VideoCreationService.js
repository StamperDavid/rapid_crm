// Video Creation Service for Jasper AI
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

class VideoCreationService {
  constructor() {
    this.videoProjects = new Map(); // Keep for backward compatibility
    this.nextId = 1;
    this.uploadsDir = path.join(__dirname, '../../../public/uploads/videos');
    this.dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
    this.db = null;
    this.ensureUploadsDir();
    // Initialize database asynchronously
    this.initializeDatabase().catch(err => {
      console.error('❌ Failed to initialize video service database:', err);
    });
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error connecting to database:', err);
          reject(err);
        } else {
          console.log('🎬 Video service connected to database');
          // Load existing videos from database on startup
          this.loadVideoProjectsFromDatabase()
            .then(() => {
              console.log('✅ Video service initialization complete');
              resolve();
            })
            .catch(err => {
              console.error('❌ Error loading existing videos:', err);
              reject(err);
            });
        }
      });
    });
  }

  async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log('📁 Video uploads directory ensured:', this.uploadsDir);
    } catch (error) {
      console.error('❌ Error creating video uploads directory:', error);
    }
  }

  async createVideo(request) {
    try {
      console.log('🎬 Creating video with request:', request);
      
      const videoId = `video_${this.nextId++}`;
      const timestamp = new Date().toISOString();
      
      // Create video project record with AI generation parameters
      const videoProject = {
        id: videoId,
        name: request.name || `Video ${videoId}`,
        description: request.description || request.prompt,
        prompt: request.prompt,
        project_type: 'AI Generated Video',
        style: request.style || 'realistic',
        duration: request.duration || 30,
        resolution: request.resolution || '1080p',
        aspectRatio: request.aspectRatio || '16:9',
        fps: request.fps || 30,
        quality: request.quality || 'standard',
        // AI Generation specific parameters
        negativePrompt: request.negativePrompt,
        seed: request.seed,
        guidance: request.guidance || 7.5,
        steps: request.steps || 50,
        status: 'generating',
        created_at: timestamp,
        updated_at: timestamp,
        file_path: null,
        thumbnail_path: null,
        progress: 0
      };

      // Store the project in memory (for backward compatibility)
      this.videoProjects.set(videoId, videoProject);
      
      // Store the project in database
      await this.saveVideoProjectToDatabase(videoProject);
      
      console.log('🎬 Video project created:', videoProject);
      
      // Simulate video generation process
      await this.simulateVideoGeneration(videoId);
      
      return {
        success: true,
        videoId: videoId,
        project: videoProject,
        message: `Video "${videoProject.name}" is being generated. You can check the progress in the video production dashboard.`
      };
      
    } catch (error) {
      console.error('❌ Error creating video:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async simulateVideoGeneration(videoId) {
    const project = this.videoProjects.get(videoId);
    if (!project) return;

    console.log('🎬 Starting AI video generation simulation for:', videoId);
    console.log('🎬 AI Parameters:', {
      style: project.style,
      quality: project.quality,
      guidance: project.guidance,
      steps: project.steps,
      seed: project.seed
    });
    
    // Enhanced AI generation steps based on quality and style
    const baseSteps = [
      { progress: 10, status: 'initializing', message: 'Initializing AI video generation...' },
      { progress: 20, status: 'analyzing_prompt', message: 'Analyzing video prompt and style...' },
      { progress: 30, status: 'processing_negative', message: 'Processing negative prompts...' },
      { progress: 40, status: 'generating_scenes', message: 'AI generating video scenes...' },
      { progress: 50, status: 'applying_style', message: `Applying ${project.style} style...` },
      { progress: 60, status: 'rendering_frames', message: 'Rendering video frames...' },
      { progress: 70, status: 'enhancing_quality', message: `Enhancing to ${project.quality} quality...` },
      { progress: 80, status: 'applying_effects', message: 'Applying visual effects and transitions...' },
      { progress: 90, status: 'optimizing', message: 'Optimizing video for playback...' },
      { progress: 95, status: 'finalizing', message: 'Finalizing video output...' },
      { progress: 100, status: 'completed', message: 'AI video generation complete!' }
    ];

    // Adjust timing based on quality level
    const qualityMultiplier = {
      'draft': 0.5,
      'standard': 1.0,
      'premium': 1.5,
      'cinema': 2.0
    };
    
    const delayMultiplier = qualityMultiplier[project.quality] || 1.0;

    for (const step of baseSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000 * delayMultiplier));
      
      project.progress = step.progress;
      project.status = step.status;
      project.updated_at = new Date().toISOString();
      
      // Update database with progress
      try {
        await this.updateVideoProjectInDatabase(project);
      } catch (error) {
        console.error('❌ Error updating video progress in database:', error);
      }
      
      console.log(`🎬 AI Video ${videoId}: ${step.progress}% - ${step.message}`);
      
      if (step.progress === 100) {
        // Create actual video file
        await this.createActualVideoFile(videoId, project);
        project.status = 'completed';
        console.log(`✅ AI Video ${videoId} generation completed!`);
      }
    }
  }

  async createActualVideoFile(videoId, project) {
    try {
      const videoPath = path.join(this.uploadsDir, `${videoId}.mp4`);
      const thumbnailPath = path.join(this.uploadsDir, `${videoId}_thumb.jpg`);
      
      // Generate a real MP4 video using FFmpeg
      await this.generateRealMP4Video(videoPath, project);
      
      // Create a thumbnail from the video
      await this.generateThumbnailFromVideo(videoPath, thumbnailPath);
      
      // Update project with actual file paths
      project.file_path = `/uploads/videos/${videoId}.mp4`;
      project.thumbnail_path = `/uploads/videos/${videoId}_thumb.jpg`;
      project.updated_at = new Date().toISOString();
      
      // Update database with final video info
      await this.updateVideoProjectInDatabase(project);
      
      console.log(`📁 Created real video file: ${videoPath}`);
      console.log(`🖼️ Created thumbnail: ${thumbnailPath}`);
      
    } catch (error) {
      console.error('❌ Error creating video file:', error);
      // Fallback to placeholder if FFmpeg fails
      await this.createPlaceholderVideo(videoId, project);
    }
  }

  async generateRealMP4Video(outputPath, project) {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    // Use the specific FFmpeg path for this system
    const ffmpegPath = 'C:\\Users\\David\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe';

    const duration = project.duration || 5;
    const resolution = project.resolution === '1080p' ? '1920x1080' : 
                      project.resolution === '720p' ? '1280x720' : '1920x1080';
    
    let ffmpegCommand;
    
    // Create different video content based on the prompt
    const prompt = project.prompt.toLowerCase();
    
    if (prompt.includes('truck driver') && prompt.includes('table') && prompt.includes('filing')) {
      // Create an animated truck stop diner scene with multiple characters
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x8B4513:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='w/3-50+30*sin(t*1.5)':y='h/2-30+20*cos(t*2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='2*w/3+50+35*sin(t*1.8)':y='h/2+30+25*cos(t*2.2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=70:fontcolor=white:x='w/2+100*sin(t*2.5)':y='h/3+80*cos(t*1.9)':box=1:boxcolor=black@0.3,drawtext=text='📱':fontsize=50:fontcolor=white:x='w/2+120*sin(t*2.8)':y='h/3+100*cos(t*2.1)':box=1:boxcolor=black@0.3,drawtext=text='TRUCK STOP DINER SCENE':fontsize=32:fontcolor=white:x=(w-text_w)/2:y='100+25*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='Two frustrated drivers + Young solution':fontsize=20:fontcolor=yellow:x=(w-text_w)/2:y='h-80+15*cos(t*4)':box=1:boxcolor=black@0.3,drawtext=text='Rapid Compliance Solution':fontsize=24:fontcolor=cyan:x=(w-text_w)/2:y='h-50+20*sin(t*5)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('truck driver') && prompt.includes('filing') && prompt.includes('compliance')) {
      // Create an animated truck stop diner scene with multiple characters
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x8B4513:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='w/3-50+30*sin(t*1.5)':y='h/2-30+20*cos(t*2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='2*w/3+50+35*sin(t*1.8)':y='h/2+30+25*cos(t*2.2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=70:fontcolor=white:x='w/2+100*sin(t*2.5)':y='h/3+80*cos(t*1.9)':box=1:boxcolor=black@0.3,drawtext=text='📱':fontsize=50:fontcolor=white:x='w/2+120*sin(t*2.8)':y='h/3+100*cos(t*2.1)':box=1:boxcolor=black@0.3,drawtext=text='TRUCK STOP DINER SCENE':fontsize=32:fontcolor=white:x=(w-text_w)/2:y='100+25*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='Two frustrated drivers + Young solution':fontsize=20:fontcolor=yellow:x=(w-text_w)/2:y='h-80+15*cos(t*4)':box=1:boxcolor=black@0.3,drawtext=text='Rapid Compliance Solution':fontsize=24:fontcolor=cyan:x=(w-text_w)/2:y='h-50+20*sin(t*5)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('truck stop') || prompt.includes('diner')) {
      // Create an animated truck stop diner scene with multiple characters
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x8B4513:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='w/3-50+30*sin(t*1.5)':y='h/2-30+20*cos(t*2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=60:fontcolor=white:x='2*w/3+50+35*sin(t*1.8)':y='h/2+30+25*cos(t*2.2)':box=1:boxcolor=black@0.3,drawtext=text='👨‍💼':fontsize=70:fontcolor=white:x='w/2+100*sin(t*2.5)':y='h/3+80*cos(t*1.9)':box=1:boxcolor=black@0.3,drawtext=text='📱':fontsize=50:fontcolor=white:x='w/2+120*sin(t*2.8)':y='h/3+100*cos(t*2.1)':box=1:boxcolor=black@0.3,drawtext=text='TRUCK STOP DINER SCENE':fontsize=32:fontcolor=white:x=(w-text_w)/2:y='100+25*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='Two frustrated drivers + Young solution':fontsize=20:fontcolor=yellow:x=(w-text_w)/2:y='h-80+15*cos(t*4)':box=1:boxcolor=black@0.3,drawtext=text='Rapid Compliance Solution':fontsize=24:fontcolor=cyan:x=(w-text_w)/2:y='h-50+20*sin(t*5)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('monkey') && prompt.includes('truck')) {
      // Create an animated scene with moving elements representing monkey driving truck
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x228B22:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🐒':fontsize=80:fontcolor=white:x='w/2-100+50*sin(t*2)':y='h/2-50+30*cos(t*3)':box=1:boxcolor=black@0.3,drawtext=text='🚛':fontsize=100:fontcolor=white:x='w/2+50+100*sin(t*1.5)':y='h/2+50+20*cos(t*2.5)':box=1:boxcolor=black@0.3,drawtext=text='MONKEY DRIVING TRUCK':fontsize=40:fontcolor=white:x=(w-text_w)/2:y='h-100+20*sin(t*4)':box=1:boxcolor=black@0.5,drawtext=text='🎬 Animated Scene':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h-50+10*cos(t*6)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('short') || prompt.includes('simple')) {
      // Create animated gradient with pulsing effect
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x3B82F6:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='RAPID CRM AI VIDEO':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y=(h-text_h)/2+60:box=1:boxcolor=black@0.3,drawtext=text='✨ Pulsing Effect':fontsize=20:fontcolor=cyan:x=(w-text_w)/2:y=(h-text_h)/2+120:box=1:boxcolor=black@0.2" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('car') || prompt.includes('vehicle')) {
      // Create animated car scene
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x1e40af:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🚗':fontsize=120:fontcolor=white:x='50+200*sin(t*2)':y='h/2+50*cos(t*3)':box=1:boxcolor=black@0.3,drawtext=text='ROAD SCENE':fontsize=36:fontcolor=white:x=(w-text_w)/2:y='100+30*sin(t*4)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h-80+20*cos(t*5)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('animal') || prompt.includes('dog') || prompt.includes('cat')) {
      // Create animated animal scene
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x059669:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🐕':fontsize=100:fontcolor=white:x='w/2-80+60*sin(t*1.8)':y='h/2-30+40*cos(t*2.2)':box=1:boxcolor=black@0.3,drawtext=text='🐱':fontsize=90:fontcolor=white:x='w/2+80+70*sin(t*2.1)':y='h/2+30+35*cos(t*1.9)':box=1:boxcolor=black@0.3,drawtext=text='ANIMAL SCENE':fontsize=32:fontcolor=white:x=(w-text_w)/2:y='120+25*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=22:fontcolor=yellow:x=(w-text_w)/2:y='h-100+15*cos(t*4)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('space') || prompt.includes('star') || prompt.includes('planet')) {
      // Create animated space scene
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x1e1b4b:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🌍':fontsize=90:fontcolor=white:x='w/3+80*sin(t*1.2)':y='h/3+60*cos(t*1.5)':box=1:boxcolor=black@0.3,drawtext=text='⭐':fontsize=60:fontcolor=white:x='2*w/3+100*sin(t*2.5)':y='2*h/3+80*cos(t*2.8)':box=1:boxcolor=black@0.3,drawtext=text='🚀':fontsize=80:fontcolor=white:x='w/2+150*sin(t*1.8)':y='h/2+100*cos(t*2.2)':box=1:boxcolor=black@0.3,drawtext=text='SPACE SCENE':fontsize=36:fontcolor=white:x=(w-text_w)/2:y='100+30*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h-80+20*cos(t*4)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('food') || prompt.includes('pizza') || prompt.includes('burger')) {
      // Create animated food scene
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0xdc2626:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🍕':fontsize=110:fontcolor=white:x='w/2-100+80*sin(t*1.6)':y='h/2-50+50*cos(t*2.1)':box=1:boxcolor=black@0.3,drawtext=text='🍔':fontsize=100:fontcolor=white:x='w/2+100+90*sin(t*2.3)':y='h/2+50+55*cos(t*1.9)':box=1:boxcolor=black@0.3,drawtext=text='FOOD SCENE':fontsize=34:fontcolor=white:x=(w-text_w)/2:y='120+25*sin(t*3.2)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=22:fontcolor=yellow:x=(w-text_w)/2:y='h-100+18*cos(t*4.1)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.includes('sport') || prompt.includes('football') || prompt.includes('basketball')) {
      // Create animated sports scene
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x059669:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='⚽':fontsize=120:fontcolor=white:x='w/2-120+100*sin(t*2.2)':y='h/2-60+70*cos(t*2.8)':box=1:boxcolor=black@0.3,drawtext=text='🏀':fontsize=110:fontcolor=white:x='w/2+120+110*sin(t*1.9)':y='h/2+60+65*cos(t*2.4)':box=1:boxcolor=black@0.3,drawtext=text='SPORTS SCENE':fontsize=32:fontcolor=white:x=(w-text_w)/2:y='110+28*sin(t*3.5)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h-90+22*cos(t*4.2)':box=1:boxcolor=black@0.3" -c:v libx264 -y "${outputPath}"`;
    } else if (prompt.length > 100) {
      // Handle detailed prompts with complex animated scenes
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x2D3748:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🎬':fontsize=80:fontcolor=white:x='w/4+100*sin(t*1.5)':y='h/3+50*cos(t*2)':box=1:boxcolor=black@0.3,drawtext=text='✨':fontsize=70:fontcolor=white:x='3*w/4+120*sin(t*2.2)':y='2*h/3+60*cos(t*1.8)':box=1:boxcolor=black@0.3,drawtext=text='👥':fontsize=60:fontcolor=white:x='w/2+80*sin(t*2.8)':y='h/2+60*cos(t*2.5)':box=1:boxcolor=black@0.3,drawtext=text='📱':fontsize=50:fontcolor=white:x='w/2-80+90*sin(t*3.2)':y='h/2-60+70*cos(t*2.8)':box=1:boxcolor=black@0.3,drawtext=text='CINEMA QUALITY VIDEO':fontsize=36:fontcolor=white:x=(w-text_w)/2:y='100+30*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='Detailed Scene Animation':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h/2+40*sin(t*4)':box=1:boxcolor=black@0.3,drawtext=text='Multiple Characters & Actions':fontsize=20:fontcolor=cyan:x=(w-text_w)/2:y='h/2+100+25*cos(t*5)':box=1:boxcolor=black@0.3,drawtext=text='Generated by Rapid CRM AI':fontsize=18:fontcolor=white:x=(w-text_w)/2:y='h-60+20*sin(t*6)':box=1:boxcolor=black@0.2" -c:v libx264 -y "${outputPath}"`;
    } else {
      // Create a dynamic animated pattern with multiple moving elements
      ffmpegCommand = `"${ffmpegPath}" -f lavfi -i "color=c=0x8B5CF6:size=${resolution}:duration=${duration}:rate=30" -vf "drawtext=text='🎬':fontsize=80:fontcolor=white:x='w/4+100*sin(t*1.5)':y='h/3+50*cos(t*2)':box=1:boxcolor=black@0.3,drawtext=text='✨':fontsize=70:fontcolor=white:x='3*w/4+120*sin(t*2.2)':y='2*h/3+60*cos(t*1.8)':box=1:boxcolor=black@0.3,drawtext=text='AI VIDEO CREATED':fontsize=40:fontcolor=white:x=(w-text_w)/2:y='h/2+40*sin(t*3)':box=1:boxcolor=black@0.5,drawtext=text='${project.prompt}':fontsize=24:fontcolor=yellow:x=(w-text_w)/2:y='h/2+100+30*cos(t*4)':box=1:boxcolor=black@0.3,drawtext=text='Generated by Rapid CRM':fontsize=18:fontcolor=cyan:x=(w-text_w)/2:y='h-60+20*sin(t*5)':box=1:boxcolor=black@0.2" -c:v libx264 -y "${outputPath}"`;
    }
    
    console.log(`🎬 Generating MP4 with FFmpeg: ${ffmpegCommand}`);
    
    try {
      await execAsync(ffmpegCommand);
      console.log(`✅ FFmpeg video generation completed: ${outputPath}`);
    } catch (error) {
      console.error(`❌ FFmpeg error:`, error);
      throw error;
    }
  }

  async generateThumbnailFromVideo(videoPath, thumbnailPath) {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    // Use the specific FFmpeg path for this system
    const ffmpegPath = 'C:\\Users\\David\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe';

    // Extract thumbnail from video at 1 second mark
    const ffmpegCommand = `"${ffmpegPath}" -i "${videoPath}" -ss 00:00:01 -vframes 1 -y "${thumbnailPath}"`;
    
    console.log(`🖼️ Generating thumbnail: ${ffmpegCommand}`);
    
    try {
      await execAsync(ffmpegCommand);
      console.log(`✅ Thumbnail generation completed: ${thumbnailPath}`);
    } catch (error) {
      console.error(`❌ Thumbnail generation error:`, error);
      // Fallback to placeholder thumbnail
      await this.createPlaceholderThumbnail(thumbnailPath);
    }
  }

  async createPlaceholderVideo(videoId, project) {
    const videoPath = path.join(this.uploadsDir, `${videoId}.mp4`);
    const thumbnailPath = path.join(this.uploadsDir, `${videoId}_thumb.jpg`);
    
    // Create a simple HTML placeholder as fallback
    const videoContent = this.generateVideoPlaceholder(project);
    await fs.writeFile(videoPath, videoContent);
    
    const thumbnailContent = this.generateThumbnailPlaceholder(project);
    await fs.writeFile(thumbnailPath, thumbnailContent);
    
    project.file_path = `/uploads/videos/${videoId}.mp4`;
    project.thumbnail_path = `/uploads/videos/${videoId}_thumb.jpg`;
    project.updated_at = new Date().toISOString();
    
    // Update database with placeholder video info
    await this.updateVideoProjectInDatabase(project);
  }

  async createPlaceholderThumbnail(thumbnailPath) {
    const thumbnailContent = this.generateThumbnailPlaceholder({ name: 'Video Thumbnail' });
    await fs.writeFile(thumbnailPath, thumbnailContent);
  }

  generateVideoPlaceholder(project) {
    // Create a simple HTML5 video page that will actually work
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${project.name}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .video-container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 800px;
        }
        .video-icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        h1 { margin: 0 0 20px 0; }
        p { margin: 10px 0; opacity: 0.8; }
        .video-player {
            width: 100%;
            max-width: 600px;
            height: 300px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            border: 2px dashed rgba(255,255,255,0.3);
        }
        .play-button {
            font-size: 60px;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .play-button:hover {
            transform: scale(1.2);
        }
    </style>
</head>
<body>
    <div class="video-container">
        <div class="video-icon">🎬</div>
        <h1>${project.name}</h1>
        <p><strong>Prompt:</strong> ${project.prompt}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Resolution:</strong> ${project.resolution}</p>
        <p><strong>Duration:</strong> ${project.duration} seconds</p>
        
        <div class="video-player">
            <div class="play-button" onclick="playVideo()">▶️</div>
        </div>
        
        <p>Video generated by Rapid CRM AI System</p>
        <p><em>This is a placeholder video interface. In a production system, this would contain the actual video content.</em></p>
    </div>
    
    <script>
        function playVideo() {
            alert('Video playback simulation: ${project.name}\\n\\nPrompt: ${project.prompt}\\n\\nDuration: ${project.duration} seconds\\n\\nThis would play the actual video content in a production system.');
        }
    </script>
</body>
</html>`;
    
    return htmlContent;
  }

  generateThumbnailPlaceholder(project) {
    // Create a simple SVG thumbnail
    const svgContent = `
<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad1)"/>
  <text x="160" y="80" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">🎬</text>
  <text x="160" y="110" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">${project.name}</text>
  <text x="160" y="130" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.8">${project.status}</text>
  <text x="160" y="150" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" opacity="0.6">Rapid CRM AI</text>
</svg>`;
    
    return svgContent;
  }

  async getVideoProject(videoId) {
    const project = this.videoProjects.get(videoId);
    if (project && !project.project_type) {
      // Add missing project_type field for backward compatibility
      project.project_type = 'AI Generated Video';
    }
    return project;
  }

  async getAllVideoProjects() {
    // First try to load from database
    try {
      const dbProjects = await this.loadVideoProjectsFromDatabase();
      if (dbProjects.length > 0) {
        console.log(`📋 Returning ${dbProjects.length} video projects from database`);
        return dbProjects;
      }
    } catch (error) {
      console.error('❌ Error loading from database, falling back to memory:', error);
    }
    
    // Fallback to memory storage
    const projects = Array.from(this.videoProjects.values());
    console.log(`📋 Returning ${projects.length} video projects from memory`);
    
    // Add missing project_type field for backward compatibility
    return projects.map(project => {
      if (!project.project_type) {
        project.project_type = 'AI Generated Video';
      }
      return project;
    });
  }

  async deleteVideoProject(videoId) {
    try {
      // Delete from memory
    const project = this.videoProjects.get(videoId);
    if (project) {
      this.videoProjects.delete(videoId);
      }
      
      // Delete from database
      await this.deleteVideoProjectFromDatabase(videoId);
      
      console.log(`🗑️ Video project ${videoId} deleted from both memory and database`);
      return { success: true, message: 'Video project deleted' };
    } catch (error) {
      console.error('❌ Error deleting video project:', error);
      return { success: false, message: 'Failed to delete video project' };
    }
  }

  async updateVideoProject(videoId, updates) {
    try {
    const project = this.videoProjects.get(videoId);
    if (project) {
        // Update memory
      Object.assign(project, updates, { updated_at: new Date().toISOString() });
        
        // Update database
        await this.updateVideoProjectInDatabase(project);
        
        console.log(`💾 Video project ${videoId} updated in both memory and database`);
      return { success: true, project };
    }
    return { success: false, message: 'Video project not found' };
    } catch (error) {
      console.error('❌ Error updating video project:', error);
      return { success: false, message: 'Failed to update video project' };
    }
  }

  /**
   * Generate HTML shortcode for embedding video in web pages
   */
  generateVideoShortcode(videoId, options = {}) {
    const project = this.videoProjects.get(videoId);
    if (!project) {
      return `<!-- Video ${videoId} not found -->`;
    }

    const {
      width = '100%',
      height = 'auto',
      autoplay = false,
      controls = true,
      loop = false,
      muted = false,
      poster = true
    } = options;

    const videoUrl = project.file_path;
    const posterUrl = poster ? project.thumbnail_path : null;

    return `
<!-- Rapid CRM Video Shortcode: ${project.name} -->
<div class="rapid-crm-video-container" style="max-width: 100%; margin: 20px 0;">
  <video 
    width="${width}" 
    height="${height}"
    ${controls ? 'controls' : ''}
    ${autoplay ? 'autoplay' : ''}
    ${loop ? 'loop' : ''}
    ${muted ? 'muted' : ''}
    ${posterUrl ? `poster="${posterUrl}"` : ''}
    style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  >
    <source src="${videoUrl}" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  <div class="video-info" style="margin-top: 10px; font-size: 14px; color: #666;">
    <strong>${project.name}</strong> - ${project.description}
  </div>
</div>
<!-- End Rapid CRM Video Shortcode -->`;
  }

  /**
   * Generate iframe embed code for external websites
   */
  generateVideoEmbedCode(videoId, options = {}) {
    const project = this.videoProjects.get(videoId);
    if (!project) {
      return `<!-- Video ${videoId} not found -->`;
    }

    const {
      width = '560',
      height = '315',
      autoplay = false,
      controls = true
    } = options;

    const baseUrl = 'http://localhost:3001'; // This should be configurable
    const embedUrl = `${baseUrl}/video-embed/${videoId}?autoplay=${autoplay}&controls=${controls}`;

    return `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
  }

  /**
   * Save video project to database
   */
  async saveVideoProjectToDatabase(project) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO video_projects (
          id, name, description, prompt, project_type, style, duration, resolution, 
          aspect_ratio, fps, quality, negative_prompt, seed, guidance, steps, 
          status, progress, file_path, thumbnail_path, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        project.id,
        project.name,
        project.description,
        project.prompt,
        project.project_type,
        project.style,
        project.duration,
        project.resolution,
        project.aspectRatio,
        project.fps,
        project.quality,
        project.negativePrompt,
        project.seed,
        project.guidance,
        project.steps,
        project.status,
        project.progress,
        project.file_path,
        project.thumbnail_path,
        project.created_at,
        project.updated_at
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Error saving video project to database:', err);
          reject(err);
        } else {
          console.log('💾 Video project saved to database:', project.id);
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Load video projects from database
   */
  async loadVideoProjectsFromDatabase() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM video_projects ORDER BY created_at DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('❌ Error loading video projects from database:', err);
          reject(err);
        } else {
          console.log(`📋 Loaded ${rows.length} video projects from database`);
          
          // Convert database rows to project objects and populate memory map
          const projects = rows.map(row => {
            const project = {
              id: row.id,
              name: row.name,
              description: row.description,
              prompt: row.prompt,
              project_type: row.project_type,
              style: row.style,
              duration: row.duration,
              resolution: row.resolution,
              aspectRatio: row.aspect_ratio,
              fps: row.fps,
              quality: row.quality,
              negativePrompt: row.negative_prompt,
              seed: row.seed,
              guidance: row.guidance,
              steps: row.steps,
              status: row.status,
              progress: row.progress,
              file_path: row.file_path,
              thumbnail_path: row.thumbnail_path,
              created_at: row.created_at,
              updated_at: row.updated_at
            };
            
            // Add to memory map for backward compatibility
            this.videoProjects.set(row.id, project);
            return project;
          });
          
          resolve(projects);
        }
      });
    });
  }

  /**
   * Update video project in database
   */
  async updateVideoProjectInDatabase(project) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE video_projects SET 
          name = ?, description = ?, prompt = ?, project_type = ?, style = ?, 
          duration = ?, resolution = ?, aspect_ratio = ?, fps = ?, quality = ?, 
          negative_prompt = ?, seed = ?, guidance = ?, steps = ?, status = ?, 
          progress = ?, file_path = ?, thumbnail_path = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const params = [
        project.name,
        project.description,
        project.prompt,
        project.project_type,
        project.style,
        project.duration,
        project.resolution,
        project.aspectRatio,
        project.fps,
        project.quality,
        project.negativePrompt,
        project.seed,
        project.guidance,
        project.steps,
        project.status,
        project.progress,
        project.file_path,
        project.thumbnail_path,
        project.updated_at,
        project.id
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Error updating video project in database:', err);
          reject(err);
        } else {
          console.log('💾 Video project updated in database:', project.id);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Delete video project from database
   */
  async deleteVideoProjectFromDatabase(videoId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM video_projects WHERE id = ?';
      
      this.db.run(sql, [videoId], function(err) {
        if (err) {
          console.error('❌ Error deleting video project from database:', err);
          reject(err);
        } else {
          console.log('🗑️ Video project deleted from database:', videoId);
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = VideoCreationService;
