import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export interface PoseAnalysis {
  timestamp: number;
  landmarks: any[];
  feedback: FormFeedback[];
}

export interface FormFeedback {
  type: 'good' | 'warning' | 'error';
  title: string;
  message: string;
}

export class PoseDetectionService {
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
      console.log("Pose detection initialized");
    } catch (error) {
      console.error("Failed to initialize pose detection:", error);
      throw error;
    }
  }

  async detectPose(video: HTMLVideoElement, timestamp: number): Promise<PoseAnalysis | null> {
    if (!this.poseLandmarker || !this.isInitialized) {
      console.warn("Pose detector not initialized");
      return null;
    }

    try {
      const results = this.poseLandmarker.detectForVideo(video, timestamp);
      
      if (!results.landmarks || results.landmarks.length === 0) {
        return null;
      }

      const landmarks = results.landmarks[0];
      const feedback = this.analyzePose(landmarks);

      return {
        timestamp,
        landmarks,
        feedback
      };
    } catch (error) {
      console.error("Error detecting pose:", error);
      return null;
    }
  }

  private analyzePose(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];

    // Analyze squat form (simplified example)
    // Landmarks: 11-left shoulder, 12-right shoulder, 23-left hip, 24-right hip, 25-left knee, 26-right knee

    if (landmarks.length < 33) return feedback;

    // Check back alignment
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];

    const backAngle = this.calculateAngle(
      leftShoulder,
      leftHip,
      { x: leftHip.x, y: leftHip.y + 0.1, z: leftHip.z }
    );

    if (backAngle > 70 && backAngle < 110) {
      feedback.push({
        type: 'good',
        title: 'Good Back Position',
        message: 'Your spine is properly aligned during the movement'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Back Alignment',
        message: 'Try to maintain a more neutral spine position'
      });
    }

    // Check knee alignment
    const leftAnkle = landmarks[27];
    const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);

    if (kneeAngle > 80 && kneeAngle < 120) {
      feedback.push({
        type: 'good',
        title: 'Knee Tracking',
        message: 'Knees are properly aligned over toes'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Knee Tracking',
        message: 'Try to keep knees aligned over toes'
      });
    }

    // Check squat depth
    if (leftKnee.y > leftHip.y + 0.05) {
      feedback.push({
        type: 'good',
        title: 'Depth Achieved',
        message: 'Excellent depth on your squat'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Squat Depth',
        message: 'Try to go lower for better muscle engagement'
      });
    }

    return feedback;
  }

  private calculateAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  drawLandmarks(
    canvas: HTMLCanvasElement,
    landmarks: any[],
    connections: any[]
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !landmarks) return;

    const drawingUtils = new DrawingUtils(ctx);
    
    // Draw connections
    if (connections && this.poseLandmarker) {
      drawingUtils.drawConnectors(
        landmarks,
        PoseLandmarker.POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 4 }
      );
    }
    
    // Draw landmarks
    drawingUtils.drawLandmarks(landmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 6
    });
  }

  cleanup() {
    if (this.poseLandmarker) {
      this.poseLandmarker.close();
      this.poseLandmarker = null;
      this.isInitialized = false;
    }
  }
}
