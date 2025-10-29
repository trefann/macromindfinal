import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export type ExerciseType = 
  | 'squat' 
  | 'push-up' 
  | 'plank' 
  | 'lunge' 
  | 'jumping-jack'
  | 'burpee'
  | 'mountain-climber'
  | 'high-knee'
  | 'standing'
  | 'unknown';

export interface PoseAnalysis {
  timestamp: number;
  landmarks: any[];
  feedback: FormFeedback[];
  detectedExercise: ExerciseType;
  confidence: number;
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
      const exercise = this.detectExercise(landmarks);
      const feedback = this.analyzePose(landmarks, exercise.type);

      return {
        timestamp,
        landmarks,
        feedback,
        detectedExercise: exercise.type,
        confidence: exercise.confidence
      };
    } catch (error) {
      console.error("Error detecting pose:", error);
      return null;
    }
  }

  private detectExercise(landmarks: any[]): { type: ExerciseType; confidence: number } {
    if (landmarks.length < 33) {
      return { type: 'unknown', confidence: 0 };
    }

    // Key landmarks
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Calculate key angles and positions
    const hipKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const shoulderHipAngle = this.calculateAngle(leftShoulder, leftHip, leftKnee);
    const elbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;
    
    // Body horizontalness (0 = vertical, 1 = horizontal)
    const bodyHorizontalness = Math.abs(avgShoulderY - avgHipY);

    // Push-up detection: body horizontal, arms bent/extended
    if (bodyHorizontalness < 0.15 && avgWristY > avgShoulderY - 0.1) {
      return { type: 'push-up', confidence: 0.9 };
    }

    // Plank detection: body horizontal and straight
    if (bodyHorizontalness < 0.15 && Math.abs(avgHipY - avgShoulderY) < 0.08) {
      if (elbowAngle < 100) {
        return { type: 'plank', confidence: 0.85 };
      }
    }

    // Squat detection: knees bent, hips lowered
    if (hipKneeAngle < 130 && avgKneeY > avgHipY) {
      return { type: 'squat', confidence: 0.9 };
    }

    // Lunge detection: one knee significantly lower than other
    const kneeDiff = Math.abs(leftKnee.y - rightKnee.y);
    if (kneeDiff > 0.1 && (hipKneeAngle < 130 || this.calculateAngle(rightHip, rightKnee, rightAnkle) < 130)) {
      return { type: 'lunge', confidence: 0.85 };
    }

    // Jumping jack detection: arms raised, legs apart
    const armRaised = avgWristY < avgShoulderY - 0.2;
    const legsApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.15;
    if (armRaised && legsApart) {
      return { type: 'jumping-jack', confidence: 0.8 };
    }

    // Mountain climber: horizontal body, one knee up
    if (bodyHorizontalness < 0.2 && kneeDiff > 0.15) {
      return { type: 'mountain-climber', confidence: 0.75 };
    }

    // High knees: standing, one knee raised high
    if (bodyHorizontalness > 0.15 && (leftKnee.y < avgHipY - 0.1 || rightKnee.y < avgHipY - 0.1)) {
      return { type: 'high-knee', confidence: 0.8 };
    }

    // Standing position
    if (bodyHorizontalness > 0.15 && hipKneeAngle > 160) {
      return { type: 'standing', confidence: 0.7 };
    }

    return { type: 'unknown', confidence: 0.5 };
  }

  private analyzePose(landmarks: any[], exerciseType: ExerciseType): FormFeedback[] {
    const feedback: FormFeedback[] = [];

    if (landmarks.length < 33) return feedback;

    switch (exerciseType) {
      case 'squat':
        return this.analyzeSquat(landmarks);
      case 'push-up':
        return this.analyzePushUp(landmarks);
      case 'plank':
        return this.analyzePlank(landmarks);
      case 'lunge':
        return this.analyzeLunge(landmarks);
      case 'jumping-jack':
        return this.analyzeJumpingJack(landmarks);
      case 'mountain-climber':
        return this.analyzeMountainClimber(landmarks);
      case 'high-knee':
        return this.analyzeHighKnee(landmarks);
      default:
        return [{
          type: 'warning',
          title: 'Exercise Detection',
          message: 'Position yourself to perform a recognized exercise'
        }];
    }
  }

  private analyzeSquat(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightKnee = landmarks[26];

    // Back alignment
    const backAngle = this.calculateAngle(
      leftShoulder,
      leftHip,
      { x: leftHip.x, y: leftHip.y + 0.1, z: leftHip.z }
    );

    if (backAngle > 75 && backAngle < 105) {
      feedback.push({
        type: 'good',
        title: 'Excellent Back Position',
        message: 'Your spine is properly aligned'
      });
    } else if (backAngle < 60) {
      feedback.push({
        type: 'error',
        title: 'Back Too Far Forward',
        message: 'Keep your chest up and back straighter'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Back Alignment',
        message: 'Try to maintain a more neutral spine'
      });
    }

    // Knee tracking
    const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const kneeOverToe = leftKnee.x - leftAnkle.x;

    if (Math.abs(kneeOverToe) < 0.05) {
      feedback.push({
        type: 'good',
        title: 'Perfect Knee Tracking',
        message: 'Knees aligned properly over toes'
      });
    } else if (Math.abs(kneeOverToe) > 0.1) {
      feedback.push({
        type: 'error',
        title: 'Knee Tracking Issue',
        message: 'Keep knees aligned with toes, not caving in or out'
      });
    }

    // Squat depth
    if (leftKnee.y > leftHip.y + 0.08) {
      feedback.push({
        type: 'good',
        title: 'Great Depth',
        message: 'Excellent squat depth achieved'
      });
    } else if (leftKnee.y > leftHip.y + 0.03) {
      feedback.push({
        type: 'warning',
        title: 'Moderate Depth',
        message: 'Try to squat a bit lower for full range of motion'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Shallow Squat',
        message: 'Lower your hips to at least parallel with knees'
      });
    }

    // Symmetry
    const kneeDiff = Math.abs(leftKnee.y - rightKnee.y);
    if (kneeDiff < 0.03) {
      feedback.push({
        type: 'good',
        title: 'Balanced Form',
        message: 'Both sides moving symmetrically'
      });
    }

    return feedback;
  }

  private analyzePushUp(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    // Body alignment (straight line from shoulders to ankles)
    const bodyAngle = this.calculateAngle(leftShoulder, leftHip, leftAnkle);
    
    if (bodyAngle > 160 && bodyAngle < 200) {
      feedback.push({
        type: 'good',
        title: 'Excellent Body Alignment',
        message: 'Maintaining a straight plank position'
      });
    } else if (bodyAngle < 150) {
      feedback.push({
        type: 'error',
        title: 'Hips Too High',
        message: 'Lower your hips to form a straight line'
      });
    } else {
      feedback.push({
        type: 'error',
        title: 'Hips Sagging',
        message: 'Engage your core to keep hips up'
      });
    }

    // Elbow angle (for depth)
    const elbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    
    if (elbowAngle < 90) {
      feedback.push({
        type: 'good',
        title: 'Full Range of Motion',
        message: 'Great depth on your push-up'
      });
    } else if (elbowAngle < 120) {
      feedback.push({
        type: 'warning',
        title: 'Partial Range',
        message: 'Try to lower your chest closer to the ground'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Limited Depth',
        message: 'Bend your elbows more for a full push-up'
      });
    }

    // Hand position relative to shoulders
    const handShoulderDist = Math.abs(leftWrist.x - leftShoulder.x);
    if (handShoulderDist < 0.15) {
      feedback.push({
        type: 'good',
        title: 'Good Hand Position',
        message: 'Hands properly positioned under shoulders'
      });
    }

    return feedback;
  }

  private analyzePlank(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    // Body alignment
    const bodyAngle = this.calculateAngle(leftShoulder, leftHip, leftKnee);
    
    if (bodyAngle > 165 && bodyAngle < 195) {
      feedback.push({
        type: 'good',
        title: 'Perfect Plank Form',
        message: 'Body is forming a straight line'
      });
    } else if (bodyAngle < 160) {
      feedback.push({
        type: 'error',
        title: 'Hips Too High',
        message: 'Lower your hips to align with your body'
      });
    } else {
      feedback.push({
        type: 'error',
        title: 'Hips Sagging',
        message: 'Engage core muscles to lift hips'
      });
    }

    // Shoulder position
    const shoulderHipDiff = Math.abs(leftShoulder.y - leftHip.y);
    if (shoulderHipDiff < 0.1) {
      feedback.push({
        type: 'good',
        title: 'Good Shoulder Position',
        message: 'Shoulders aligned with body'
      });
    }

    return feedback;
  }

  private analyzeLunge(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Determine front leg (lower knee)
    const frontKnee = leftKnee.y > rightKnee.y ? leftKnee : rightKnee;
    const frontAnkle = leftKnee.y > rightKnee.y ? leftAnkle : rightAnkle;
    const frontHip = leftKnee.y > rightKnee.y ? leftHip : rightHip;

    // Front knee angle
    const frontKneeAngle = this.calculateAngle(frontHip, frontKnee, frontAnkle);
    
    if (frontKneeAngle > 80 && frontKneeAngle < 100) {
      feedback.push({
        type: 'good',
        title: 'Perfect Lunge Depth',
        message: 'Front knee at ideal 90-degree angle'
      });
    } else if (frontKneeAngle > 100) {
      feedback.push({
        type: 'warning',
        title: 'Lunge Deeper',
        message: 'Lower your body until front knee is at 90 degrees'
      });
    }

    // Knee over toe alignment
    const kneeOverToe = frontKnee.x - frontAnkle.x;
    if (Math.abs(kneeOverToe) < 0.05) {
      feedback.push({
        type: 'good',
        title: 'Excellent Knee Position',
        message: 'Front knee properly aligned over ankle'
      });
    } else if (kneeOverToe > 0.08) {
      feedback.push({
        type: 'error',
        title: 'Knee Too Far Forward',
        message: 'Keep front knee behind your toes'
      });
    }

    // Torso upright
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const leftShoulder = landmarks[11];
    const shoulderHipDiff = leftShoulder.x - avgHipY;
    
    if (Math.abs(shoulderHipDiff) < 0.05) {
      feedback.push({
        type: 'good',
        title: 'Upright Torso',
        message: 'Upper body properly aligned'
      });
    }

    return feedback;
  }

  private analyzeJumpingJack(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftShoulder = landmarks[11];

    // Arms overhead
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;
    if (avgWristY < leftShoulder.y - 0.3) {
      feedback.push({
        type: 'good',
        title: 'Arms Fully Extended',
        message: 'Great arm extension overhead'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Raise Arms Higher',
        message: 'Bring arms all the way up over your head'
      });
    }

    // Legs apart
    const legSpread = Math.abs(leftAnkle.x - rightAnkle.x);
    if (legSpread > 0.2) {
      feedback.push({
        type: 'good',
        title: 'Good Leg Spread',
        message: 'Legs properly spread apart'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Spread Legs Wider',
        message: 'Jump with legs wider apart'
      });
    }

    return feedback;
  }

  private analyzeMountainClimber(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftWrist = landmarks[15];

    // Plank position
    const shoulderHipDiff = Math.abs(leftShoulder.y - leftHip.y);
    if (shoulderHipDiff < 0.12) {
      feedback.push({
        type: 'good',
        title: 'Good Plank Position',
        message: 'Maintaining proper base position'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Keep Hips Level',
        message: 'Maintain plank position with hips aligned'
      });
    }

    // Knee drive
    const kneeDiff = Math.abs(leftKnee.y - rightKnee.y);
    if (kneeDiff > 0.15) {
      feedback.push({
        type: 'good',
        title: 'Good Knee Drive',
        message: 'Driving knees up effectively'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Drive Knees Higher',
        message: 'Bring knees closer to chest'
      });
    }

    return feedback;
  }

  private analyzeHighKnee(landmarks: any[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const maxKneeHeight = Math.min(leftKnee.y, rightKnee.y);

    // Knee height
    const kneeLift = avgHipY - maxKneeHeight;
    if (kneeLift > 0.15) {
      feedback.push({
        type: 'good',
        title: 'Excellent Knee Lift',
        message: 'Knees raised to ideal height'
      });
    } else if (kneeLift > 0.08) {
      feedback.push({
        type: 'warning',
        title: 'Moderate Knee Lift',
        message: 'Try to bring knees higher towards chest'
      });
    } else {
      feedback.push({
        type: 'warning',
        title: 'Low Knee Lift',
        message: 'Lift knees higher for better effectiveness'
      });
    }

    // Posture
    const leftShoulder = landmarks[11];
    const shoulderHipDiff = Math.abs(leftShoulder.x - leftHip.x);
    if (shoulderHipDiff < 0.05) {
      feedback.push({
        type: 'good',
        title: 'Upright Posture',
        message: 'Maintaining good upper body position'
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
