import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Play, Square, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PoseDetectionService, type FormFeedback } from "@/utils/poseDetection";

const FormChecker = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseServiceRef = useRef<PoseDetectionService | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnalyzingRef = useRef(false); // Use ref for animation loop

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    // Initialize pose detection service
    poseServiceRef.current = new PoseDetectionService();

    return () => {
      stopFormCheck();
      poseServiceRef.current?.cleanup();
    };
  }, []);

  const startFormCheck = async () => {
    setIsLoading(true);
    setFeedback([]);

    try {
      // Initialize pose detection
      if (!poseServiceRef.current) {
        throw new Error("Pose detection service not available");
      }
      await poseServiceRef.current.initialize();

      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: "user"
        }
      });

      streamRef.current = stream;

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.onloadedmetadata = () => {
          videoElementRef.current?.play();
          setIsAnalyzing(true);
          isAnalyzingRef.current = true;
          setIsLoading(false);
          detectPose();
        };
      }

      toast({
        title: "Camera Started",
        description: "Analyzing your form in real-time",
      });
    } catch (error) {
      console.error("Error starting form check:", error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const detectPose = async () => {
    if (!isAnalyzingRef.current || !videoElementRef.current || !canvasRef.current || !poseServiceRef.current) {
      return;
    }

    const video = videoElementRef.current;
    const canvas = canvasRef.current;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const detect = async () => {
      if (!isAnalyzingRef.current || !video || !canvas || !poseServiceRef.current) {
        return;
      }

      const timestamp = performance.now();
      const analysis = await poseServiceRef.current.detectPose(video, timestamp);

      if (analysis && analysis.landmarks) {
        // Draw pose on canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          poseServiceRef.current.drawLandmarks(
            canvas,
            analysis.landmarks,
            []
          );
        }

        // Update feedback in real-time
        setFeedback(prevFeedback => {
          // Only update if feedback has changed to prevent unnecessary re-renders
          if (JSON.stringify(prevFeedback) !== JSON.stringify(analysis.feedback)) {
            return analysis.feedback;
          }
          return prevFeedback;
        });
      }

      // Continue the loop
      if (isAnalyzingRef.current) {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();
  };

  const stopFormCheck = () => {
    setIsAnalyzing(false);
    isAnalyzingRef.current = false;

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Reset feedback
    setFeedback([]);

    toast({
      title: "Analysis Stopped",
      description: "Form check session ended",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            AI Form Checker
          </h1>
          <p className="text-muted-foreground">
            Real-time exercise form analysis powered by AI computer vision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div
                  ref={containerRef}
                  className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4"
                >
                  {/* Video element */}
                  <video
                    ref={videoElementRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                  />
                  
                  {/* Canvas for pose overlay */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />

                  {/* Placeholder */}
                  {!isAnalyzing && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click "Start Form Check" to begin
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Loading state */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <p className="text-xl font-semibold gradient-text">
                          Initializing camera...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recording indicator */}
                  {isAnalyzing && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass backdrop-blur-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Analyzing</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isAnalyzing ? (
                    <Button
                      size="lg"
                      onClick={startFormCheck}
                      disabled={isLoading}
                      className="bg-gradient-neon hover:shadow-glow transition-all"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {isLoading ? "Initializing..." : "Start Form Check"}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={stopFormCheck}
                      variant="destructive"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Analysis
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Panel */}
          <div className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Start form check to receive real-time feedback</p>
                  </div>
                ) : (
                  <>
                    {feedback.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${
                          item.type === 'good'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : item.type === 'warning'
                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {item.type === 'good' ? (
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                item.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                              }`}
                            />
                          )}
                          <div>
                            <p
                              className={`font-semibold mb-1 ${
                                item.type === 'good'
                                  ? 'text-green-400'
                                  : item.type === 'warning'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  1. Position yourself in frame doing an exercise
                </p>
                <p>
                  2. Click "Start Form Check" to begin recording
                </p>
                <p>
                  3. AI analyzes your movement patterns in real-time
                </p>
                <p>
                  4. Receive instant feedback on form and technique
                </p>
                <p className="mt-4 pt-4 border-t border-white/10">
                  💡 <strong>Live AI-powered form analysis</strong> using Google MediaPipe. 
                  Position yourself doing squats for best results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormChecker;
