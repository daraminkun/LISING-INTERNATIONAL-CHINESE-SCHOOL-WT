import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  ScanFace,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  SwitchCamera,
  Loader2,
  User,
} from 'lucide-react';
import { UploadedDocument, Language } from '../types';
import { compressUploadedDocumentFile, isValidDataUrl } from '../utils/cloudDocSyncUtils';
import { generateStandardDocFilename } from '../utils/documentDownloadUtils';
import { getFirstDocPage } from '../utils/documentUtils';

interface StudentPhotoCaptureProps {
  photoDoc?: UploadedDocument | UploadedDocument[];
  onChangePhoto: (pages: UploadedDocument[] | undefined) => void;
  onPreviewPhoto?: (doc: UploadedDocument, title: string) => void;
  studentId?: string;
  maskStudentId?: boolean;
  studentName?: string;
  language: Language;
}

type CaptureMode = 'photo' | 'face_scan';

function isFrameCameraPolicyBlocked(): boolean {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    if (window.self === window.top) return false;
    const docAny = document as any;
    const policy = docAny.permissionsPolicy || docAny.featurePolicy;
    if (policy && typeof policy.allowsFeature === 'function') {
      return policy.allowsFeature('camera') === false;
    }
  } catch {
    // Cross-origin frame check fallback
  }
  return false;
}

function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );
}

async function smartAutoCropPortraitFromDataUrl(
  sourceDataUrl: string,
  enableFaceCentering: boolean
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) {
          resolve(sourceDataUrl);
          return;
        }

        const targetAspect = 3 / 4;
        let centerXRatio = 0.5;
        let centerYRatio = 0.45;
        let cropHeightRatio = 1;

        if (enableFaceCentering) {
          let detectedBox: { x: number; y: number; width: number; height: number } | null = null;
          if (typeof window !== 'undefined' && 'FaceDetector' in window) {
            try {
              const detector = new (window as any).FaceDetector({
                fastMode: true,
                maxDetectedFaces: 1,
              });
              const faces = await detector.detect(img);
              if (faces && faces.length > 0 && faces[0].boundingBox) {
                detectedBox = faces[0].boundingBox;
              }
            } catch {
              detectedBox = null;
            }
          }

          if (detectedBox) {
            centerXRatio = (detectedBox.x + detectedBox.width / 2) / iw;
            // Shift slightly downward from eye/nose box to include chin & shoulders for 4x6 ID portrait
            centerYRatio = (detectedBox.y + detectedBox.height * 0.58) / ih;
            const idealPortraitHeight = (detectedBox.height * 2.35) / ih;
            cropHeightRatio = Math.min(1, Math.max(0.45, idealPortraitHeight));
          } else {
            // Lightweight skin-tone centroid fallback for Safari / iOS / Android WebView
            const sampleSize = 72;
            const sampleCanvas = document.createElement('canvas');
            sampleCanvas.width = sampleSize;
            sampleCanvas.height = sampleSize;
            const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
            if (sCtx) {
              sCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
              const px = sCtx.getImageData(0, 0, sampleSize, sampleSize).data;
              let sumX = 0;
              let sumY = 0;
              let weightTotal = 0;
              for (let y = 8; y < 58; y++) {
                for (let x = 12; x < 60; x++) {
                  const idx = (y * sampleSize + x) * 4;
                  const r = px[idx];
                  const g = px[idx + 1];
                  const b = px[idx + 2];
                  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                  const maxRgb = Math.max(r, g, b);
                  const minRgb = Math.min(r, g, b);
                  if (
                    luma > 42 &&
                    luma < 242 &&
                    r >= g * 0.92 &&
                    g >= b * 0.85 &&
                    maxRgb - minRgb > 12
                  ) {
                    sumX += x + 0.5;
                    sumY += y + 0.5;
                    weightTotal += 1;
                  }
                }
              }
              if (weightTotal >= 28) {
                centerXRatio = sumX / weightTotal / sampleSize;
                centerYRatio = Math.min(0.62, sumY / weightTotal / sampleSize + 0.04);
              }
            }
            sampleCanvas.width = 1;
            sampleCanvas.height = 1;
          }
        }

        let sh = Math.round(ih * cropHeightRatio);
        let sw = Math.round(sh * targetAspect);
        if (sw > iw) {
          sw = iw;
          sh = Math.round(sw / targetAspect);
        }
        if (sh > ih) {
          sh = ih;
          sw = Math.round(sh * targetAspect);
        }

        const cx = Math.round(centerXRatio * iw);
        const cy = Math.round(centerYRatio * ih);
        const sx = Math.max(0, Math.min(iw - sw, Math.round(cx - sw / 2)));
        const sy = Math.max(0, Math.min(ih - sh, Math.round(cy - sh / 2)));

        const outW = 720;
        const outH = 960;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = outW;
        outCanvas.height = outH;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) {
          resolve(sourceDataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

        let croppedUrl = outCanvas.toDataURL('image/webp', 0.88);
        if (!croppedUrl.startsWith('data:image/webp')) {
          croppedUrl = outCanvas.toDataURL('image/jpeg', 0.88);
        }
        outCanvas.width = 1;
        outCanvas.height = 1;
        resolve(croppedUrl);
      } catch {
        resolve(sourceDataUrl);
      }
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}

export const StudentPhotoCapture: React.FC<StudentPhotoCaptureProps> = ({
  photoDoc,
  onChangePhoto,
  onPreviewPhoto,
  studentId,
  maskStudentId = false,
  studentName,
  language,
}) => {
  const currentPhoto = getFirstDocPage(photoDoc);
  const hasPhoto = Boolean(currentPhoto && isValidDataUrl(currentPhoto.dataUrl));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const pendingSmartFaceCropRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevCenterLumaRef = useRef<number[] | null>(null);
  const alignedStreakRef = useRef<number>(0);

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Face Scan live state
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [faceStatus, setFaceStatus] = useState<'searching' | 'centering' | 'aligned' | 'capturing'>('searching');
  const [countdown, setCountdown] = useState<number | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    alignedStreakRef.current = 0;
    prevCenterLumaRef.current = null;
    setCountdown(null);
  }, []);

  const startCameraStream = useCallback(
    async (targetFacing: 'user' | 'environment') => {
      stopCameraStream();
      setIsStartingCamera(true);
      setCameraError(null);
      setFaceStatus('searching');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || isFrameCameraPolicyBlocked()) {
        setIsStartingCamera(false);
        setCameraError(
          language === 'zh-TW'
            ? '目前預覽視窗限制直接開啟網頁攝影機，請點選下方按鈕開啟手機相機或選擇照片（支援自動人臉裁切 4×6）。'
            : language === 'en'
            ? 'Direct webcam is restricted in this preview frame. Use "Open Device Camera" or "Choose Photo" below (with automatic 4×6 face framing).'
            : 'ផ្ទាំងមើលជាមុននេះមិនចាំបាច់សុំសិទ្ធិកាមេរ៉ាជាមុនទេ — សូមចុច «បើកកាមេរ៉ាទូរស័ព្ទ» ឬ «ជ្រើសរើសរូបថត» ខាងក្រោម (មានមុខងារស្គេនតម្រឹមមុខ 4×6 ស្វ័យប្រវត្តិ)។'
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any available video input device
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Camera permission/access notice:', err);
        setCameraError(
          language === 'zh-TW'
            ? '無法直接開啟攝影機，請點選下方「開啟手機相機拍照」或「從裝置選擇照片上傳」。'
            : language === 'en'
            ? 'Direct camera is unavailable here. Use "Open Device Camera" or "Choose Photo File" below.'
            : 'មិនអាចបើកកាមេរ៉ាផ្ទាល់លើផ្ទាំងនេះទេ សូមចុច «បើកកាមេរ៉ាទូរស័ព្ទផ្ទាល់» ឬ «ជ្រើសរូបថតពីឧបករណ៍» ខាងក្រោម។'
        );
      } finally {
        setIsStartingCamera(false);
      }
    },
    [language, stopCameraStream]
  );

  // Clean up webcam stream on unmount or modal close
  useEffect(() => {
    if (!isCameraModalOpen) {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isCameraModalOpen, stopCameraStream]);

  const openCameraWithMode = (mode: CaptureMode) => {
    setCaptureMode(mode);
    // On mobile/tablet inside an embedded frame where getUserMedia is restricted,
    // launch the phone's native camera directly without any browser permission error!
    if (isFrameCameraPolicyBlocked() && isMobileOrTabletDevice()) {
      pendingSmartFaceCropRef.current = mode === 'face_scan';
      nativeCameraInputRef.current?.click();
      return;
    }
    setFacingMode('user');
    setIsCameraModalOpen(true);
    setTimeout(() => {
      void startCameraStream('user');
    }, 60);
  };

  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    void startCameraStream(nextFacing);
  };

  const saveCapturedDataUrl = useCallback(
    (dataUrl: string, byteSizeEstimate?: number) => {
      const stdName = generateStandardDocFilename(
        { studentId: maskStudentId ? '••••' : studentId, nameKhmer: studentName },
        'photo',
        0,
        'student_portrait.jpg',
        'image/jpeg'
      );

      const approxBytes =
        byteSizeEstimate || Math.round((dataUrl.length * 3) / 4);

      const newPhotoDoc: UploadedDocument = {
        name: stdName,
        size: approxBytes,
        type: dataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
        dataUrl,
        uploadedAt: new Date().toISOString(),
        pageNumber: 1,
      };

      onChangePhoto([newPhotoDoc]);
      setIsCameraModalOpen(false);
      stopCameraStream();
    },
    [maskStudentId, onChangePhoto, stopCameraStream, studentId, studentName]
  );

  const captureFrameFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    setFaceStatus('capturing');
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Crop centered 3:4 portrait ID photo frame
    const targetAspect = 3 / 4;
    const currentAspect = vw / vh;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (currentAspect > targetAspect) {
      sw = Math.round(vh * targetAspect);
      sx = Math.round((vw - sw) / 2);
    } else {
      sh = Math.round(vw / targetAspect);
      sy = Math.round((vh - sh) / 2);
    }

    const outW = 720;
    const outH = 960;
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Mirror selfie camera horizontally so it matches live preview naturally
    if (facingMode === 'user') {
      ctx.save();
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    }

    let dataUrl = canvas.toDataURL('image/webp', 0.88);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    }

    saveCapturedDataUrl(dataUrl);
  }, [facingMode, saveCapturedDataUrl]);

  // Real-time Face Scan & Alignment Detection Loop
  useEffect(() => {
    if (!isCameraModalOpen || captureMode !== 'face_scan' || isStartingCamera || cameraError) {
      return;
    }

    let cancelled = false;
    let nativeDetector: any = null;
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        nativeDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch {
        nativeDetector = null;
      }
    }

    const analyzeFrame = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        return;
      }

      let isWellAligned = false;
      let isPartiallyPresent = false;

      // 1. Try Native Chromium FaceDetector first if supported
      if (nativeDetector) {
        try {
          const faces = await nativeDetector.detect(video);
          if (faces && faces.length > 0) {
            isPartiallyPresent = true;
            const box = faces[0].boundingBox;
            const faceCenterX = (box.x + box.width / 2) / video.videoWidth;
            const faceCenterY = (box.y + box.height / 2) / video.videoHeight;
            const faceHeightRatio = box.height / video.videoHeight;

            if (
              faceCenterX >= 0.32 &&
              faceCenterX <= 0.68 &&
              faceCenterY >= 0.24 &&
              faceCenterY <= 0.72 &&
              faceHeightRatio >= 0.22 &&
              faceHeightRatio <= 0.82
            ) {
              isWellAligned = true;
            }
          }
        } catch {
          nativeDetector = null;
        }
      }

      // 2. Universal Canvas Biometric Region & Stability Fallback (Safari, Firefox, iOS, Android, Chrome)
      if (!nativeDetector) {
        let canvas = analysisCanvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          analysisCanvasRef.current = canvas;
        }
        const sampleW = 64;
        const sampleH = 64;
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, sampleW, sampleH);
          const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data;

          let skinOrWarmPixels = 0;
          let centerPixels = 0;
          let lumaSum = 0;
          let lumaSqSum = 0;
          const currentLumaSamples: number[] = [];

          for (let y = 14; y < 50; y += 2) {
            for (let x = 18; x < 46; x += 2) {
              const idx = (y * sampleW + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const luma = 0.299 * r + 0.587 * g + 0.114 * b;

              centerPixels++;
              lumaSum += luma;
              lumaSqSum += luma * luma;
              currentLumaSamples.push(luma);

              // Broad human skin-tone & portrait illumination heuristic across diverse lighting
              const maxRgb = Math.max(r, g, b);
              const minRgb = Math.min(r, g, b);
              if (
                luma > 42 &&
                luma < 242 &&
                r >= g * 0.92 &&
                g >= b * 0.85 &&
                maxRgb - minRgb > 10
              ) {
                skinOrWarmPixels++;
              }
            }
          }

          const meanLuma = lumaSum / Math.max(1, centerPixels);
          const variance = lumaSqSum / Math.max(1, centerPixels) - meanLuma * meanLuma;
          const stdDev = Math.sqrt(Math.max(0, variance));
          const warmRatio = skinOrWarmPixels / Math.max(1, centerPixels);

          // Motion stability check so it only auto-captures when subject holds still
          let avgMotionDiff = 0;
          if (
            prevCenterLumaRef.current &&
            prevCenterLumaRef.current.length === currentLumaSamples.length
          ) {
            let diffSum = 0;
            for (let i = 0; i < currentLumaSamples.length; i++) {
              diffSum += Math.abs(currentLumaSamples[i] - prevCenterLumaRef.current[i]);
            }
            avgMotionDiff = diffSum / currentLumaSamples.length;
          }
          prevCenterLumaRef.current = currentLumaSamples;

          // Subject present in center oval with natural facial contrast and steady pose
          if (meanLuma > 45 && meanLuma < 238 && stdDev > 16) {
            isPartiallyPresent = true;
            if (warmRatio >= 0.22 && avgMotionDiff < 9.5) {
              isWellAligned = true;
            }
          }
        }
      }

      if (cancelled) return;

      if (isWellAligned) {
        alignedStreakRef.current += 1;
        setFaceStatus('aligned');

        if (autoCaptureEnabled) {
          if (alignedStreakRef.current >= 2 && alignedStreakRef.current < 5) {
            setCountdown(3);
          } else if (alignedStreakRef.current >= 5 && alignedStreakRef.current < 8) {
            setCountdown(2);
          } else if (alignedStreakRef.current >= 8 && alignedStreakRef.current < 11) {
            setCountdown(1);
          } else if (alignedStreakRef.current >= 11) {
            setCountdown(null);
            alignedStreakRef.current = 0;
            captureFrameFromVideo();
          }
        } else {
          setCountdown(null);
        }
      } else {
        alignedStreakRef.current = Math.max(0, alignedStreakRef.current - 1);
        setCountdown(null);
        setFaceStatus(isPartiallyPresent ? 'centering' : 'searching');
      }
    };

    const intervalId = window.setInterval(() => {
      void analyzeFrame();
    }, 260);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    autoCaptureEnabled,
    cameraError,
    captureFrameFromVideo,
    captureMode,
    isCameraModalOpen,
    isStartingCamera,
  ]);

  const handleFileUpload = async (files: FileList | File[] | null, forceFaceCrop?: boolean) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|bmp|heic)$/i.test(file.name)) {
      return;
    }

    const shouldFaceCrop = Boolean(forceFaceCrop || pendingSmartFaceCropRef.current);
    pendingSmartFaceCropRef.current = false;

    setIsProcessing(true);
    try {
      const { dataUrl } = await compressUploadedDocumentFile(file, 1280, 0.88);
      const finalDataUrl = shouldFaceCrop
        ? await smartAutoCropPortraitFromDataUrl(dataUrl, true)
        : dataUrl;
      saveCapturedDataUrl(finalDataUrl, file.size);
    } catch (err) {
      console.error('Photo upload processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const photoTitle =
    language === 'zh-TW'
      ? '學生證件照 / 人臉掃描'
      : language === 'en'
      ? 'Student Portrait Photo & Face Scan'
      : 'រូបថតសិស្ស • ថតរូប / ស្គេនមុខ / Upload រូបថត';

  return (
    <>
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            void handleFileUpload(e.dataTransfer.files);
          }
        }}
        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
          isDragging
            ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20'
            : hasPhoto
            ? 'bg-emerald-50/45 border-emerald-300/90'
            : 'bg-slate-50/75 border-slate-200'
        }`}
      >
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            void handleFileUpload(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={e => {
            void handleFileUpload(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Portrait 3:4 Photo Frame */}
          <div className="relative w-28 h-36 sm:w-30 sm:h-38 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden shrink-0 flex flex-col items-center justify-center shadow-2xs group">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-1.5 text-indigo-600 p-2 text-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-semibold">
                  {language === 'zh-TW' ? '處理中...' : language === 'en' ? 'Processing...' : 'កំពុងដំណើរការ...'}
                </span>
              </div>
            ) : hasPhoto && currentPhoto?.dataUrl ? (
              <>
                <img
                  src={currentPhoto.dataUrl}
                  alt={studentName || 'Student Photo'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => onPreviewPhoto?.(currentPhoto, photoTitle)}
                />
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/75 via-black/40 to-transparent flex items-center justify-center gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {onPreviewPhoto && (
                    <button
                      type="button"
                      onClick={() => onPreviewPhoto(currentPhoto, photoTitle)}
                      className="p-1 rounded-md bg-white/90 text-slate-800 hover:bg-white transition-colors cursor-pointer"
                      title={language === 'km' ? 'មើលរូបថតធំ' : 'Preview Photo'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChangePhoto(undefined)}
                    className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    title={language === 'km' ? 'លុបរូបថត' : 'Remove Photo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-slate-50 w-full h-full transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {language === 'zh-TW' ? '學生照片' : language === 'en' ? 'Photo 4×6' : 'រូបថត 4×6'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'zh-TW' ? '點擊或拖放' : language === 'en' ? 'Click / Drop' : 'ចុច ឬ ទម្លាក់រូប'}
                </span>
              </div>
            )}
          </div>

          {/* Controls & Instructions */}
          <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{photoTitle}</span>
              </div>
              {hasPhoto && (
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'zh-TW'
                      ? '已附加學生照片'
                      : language === 'en'
                      ? 'Photo Attached'
                      : 'បានបញ្ចូលរូបថតរួចរាល់'}
                  </span>
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              {language === 'zh-TW'
                ? '可使用相機直接拍照、開啟人臉掃描對準框自動擷取，或從電腦／手機相簿上傳證件照。'
                : language === 'en'
                ? 'Take a live photo with your camera, use Face Scan with alignment guide, or upload an image file from your device.'
                : 'អាចថតរូបផ្ទាល់តាមកាមេរ៉ា ប្រើមុខងារស្គេនមុខឱ្យចំរង្វង់ស្វ័យប្រវត្តិ ឬ Upload រូបថត 4×6 ពីទូរស័ព្ទ និងកុំព្យូទ័រ។'}
            </p>

            {/* 3 Primary Action Buttons: Take Photo | Face Scan | Upload Photo */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => openCameraWithMode('photo')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'zh-TW' ? '拍照' : language === 'en' ? 'Take Photo' : 'ថតរូប'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openCameraWithMode('face_scan')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ScanFace className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'zh-TW' ? '人臉掃描' : language === 'en' ? 'Face Scan' : 'ស្គេនមុខ'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {language === 'zh-TW' ? '上傳照片' : language === 'en' ? 'Upload Photo' : 'Upload រូបថត'}
                </span>
              </button>

              {hasPhoto && (
                <button
                  type="button"
                  onClick={() => onChangePhoto(undefined)}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'zh-TW' ? '移除' : language === 'en' ? 'Remove' : 'លុបរូប'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Camera & Biometric Face Scan Modal */}
      {isCameraModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsCameraModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Camera Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {captureMode === 'face_scan' ? (
                  <ScanFace className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Camera className="w-5 h-5 text-indigo-600 shrink-0" />
                )}
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {captureMode === 'face_scan'
                    ? language === 'zh-TW'
                      ? '智慧人臉掃描拍攝 (Face Scan)'
                      : language === 'en'
                      ? 'Biometric Face Scan Capture'
                      : 'ស្គេនមុខថតរូបសិស្ស (Face Scan)'
                    : language === 'zh-TW'
                    ? '拍攝學生證件照 (Take Photo)'
                    : language === 'en'
                    ? 'Take Student Portrait Photo'
                    : 'ថតរូបសិស្សផ្ទាល់ (Take Photo)'}
                </h4>
              </div>

              {/* Mode Switch Tabs inside Camera */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCaptureMode('photo')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    captureMode === 'photo'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'zh-TW' ? '一般拍照' : language === 'en' ? 'Photo' : 'ថតរូប'}
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode('face_scan')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    captureMode === 'face_scan'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'zh-TW' ? '人臉掃描' : language === 'en' ? 'Face Scan' : 'ស្គេនមុខ'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCameraModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewport (3:4 Portrait Aspect Frame) */}
            <div className="p-4 bg-slate-900 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[310px] aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {isStartingCamera && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-slate-950/90 text-white text-xs">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                    <span>
                      {language === 'zh-TW'
                        ? '正在啟動相機...'
                        : language === 'en'
                        ? 'Starting camera...'
                        : 'កំពុងបើកកាមេរ៉ា...'}
                    </span>
                  </div>
                )}

                {cameraError ? (
                  <div className="p-5 text-center space-y-3 text-white z-20">
                    <AlertCircle className="w-9 h-9 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-200 leading-relaxed">{cameraError}</p>
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          pendingSmartFaceCropRef.current = captureMode === 'face_scan';
                          setIsCameraModalOpen(false);
                          nativeCameraInputRef.current?.click();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {language === 'zh-TW'
                          ? '開啟手機相機拍照'
                          : language === 'en'
                          ? 'Open Device Camera'
                          : 'បើកកាមេរ៉ាទូរស័ព្ទផ្ទាល់'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          pendingSmartFaceCropRef.current = captureMode === 'face_scan';
                          setIsCameraModalOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        {language === 'zh-TW'
                          ? '從裝置選擇照片上傳'
                          : language === 'en'
                          ? 'Choose Photo File Instead'
                          : 'ជ្រើសរើសរូបថតពីឧបករណ៍'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${
                        facingMode === 'user' ? '-scale-x-100' : ''
                      }`}
                    />

                    {/* Framing Overlay */}
                    {captureMode === 'face_scan' ? (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        {/* Biometric Face Oval */}
                        <div
                          className={`relative w-[68%] h-[66%] rounded-[50%] border-2 transition-colors duration-200 shadow-[0_0_0_9999px_rgba(2,6,23,0.48)] ${
                            faceStatus === 'aligned'
                              ? 'border-emerald-400'
                              : faceStatus === 'centering'
                              ? 'border-amber-300'
                              : 'border-sky-400/85'
                          }`}
                        >
                          {/* Corner Biometric Brackets */}
                          <div className="absolute -top-2 -left-2 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-md" />
                          <div className="absolute -top-2 -right-2 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-md" />
                          <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-md" />
                          <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-md" />

                          {/* Countdown Number Overlay */}
                          {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="w-14 h-14 rounded-full bg-emerald-600/90 text-white font-black text-2xl flex items-center justify-center shadow-lg tabular-nums">
                                {countdown}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Live Face Scan Status Text */}
                        <div className="mt-3 px-3 py-1 rounded-lg bg-slate-950/85 text-white text-[11px] font-semibold border border-white/15">
                          {faceStatus === 'aligned'
                            ? language === 'zh-TW'
                              ? '臉部位置正確！保持穩定...'
                              : language === 'en'
                              ? 'Face aligned! Hold steady...'
                              : 'មុខចំទីតាំងល្អ! សូមរក្សាលំនឹងបន្តិច...'
                            : faceStatus === 'centering'
                            ? language === 'zh-TW'
                              ? '請將臉部置於橢圓框中央'
                              : language === 'en'
                              ? 'Center your face inside the oval'
                              : 'សូមដាក់មុខឱ្យចំកណ្តាលរង្វង់ស្គេន'
                            : language === 'zh-TW'
                            ? '正在偵測人臉位置...'
                            : language === 'en'
                            ? 'Position face inside scan frame...'
                            : 'សូមដាក់មុខចូលក្នុងរង្វង់ស្គេន...'}
                        </div>
                      </div>
                    ) : (
                      /* Standard ID Photo Framing Grid */
                      <div className="pointer-events-none absolute inset-4 border border-white/35 rounded-xl flex items-end justify-center pb-2">
                        <span className="text-[10px] text-white/80 bg-black/45 px-2 py-0.5 rounded">
                          {language === 'zh-TW'
                            ? '4×6 證件照比例框'
                            : language === 'en'
                            ? '4×6 Portrait Guide'
                            : 'ស៊ុមរូបថតស្តង់ដារ 4×6'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Auto-capture option when in Face Scan mode */}
              {captureMode === 'face_scan' && !cameraError && (
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoCaptureEnabled}
                    onChange={e => setAutoCaptureEnabled(e.target.checked)}
                    className="rounded border-slate-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>
                    {language === 'zh-TW'
                      ? '對準後自動倒數拍照 (Auto-Capture)'
                      : language === 'en'
                      ? 'Auto-capture when face is aligned'
                      : 'ថតស្វ័យប្រវត្តិនៅពេលដាក់មុខចំរង្វង់ (Auto-Capture)'}
                  </span>
                </label>
              )}
            </div>

            {/* Camera Footer Controls */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  disabled={isStartingCamera || !!cameraError}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <SwitchCamera className="w-4 h-4 text-slate-600" />
                  <span>
                    {language === 'zh-TW' ? '切換鏡頭' : language === 'en' ? 'Flip Camera' : 'ប្តូរកាមេរ៉ា'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void startCameraStream(facingMode)}
                  disabled={isStartingCamera}
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title={language === 'km' ? 'បើកកាមេរ៉ាឡើងវិញ' : 'Retry Camera'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  {language === 'zh-TW' ? '取消' : language === 'en' ? 'Cancel' : 'បោះបង់'}
                </button>

                <button
                  type="button"
                  onClick={captureFrameFromVideo}
                  disabled={isStartingCamera || !!cameraError}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer ${
                    captureMode === 'face_scan'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {captureMode === 'face_scan' ? (
                    <ScanFace className="w-4 h-4" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>
                    {captureMode === 'face_scan'
                      ? language === 'zh-TW'
                        ? '立即掃描擷取'
                        : language === 'en'
                        ? 'Scan & Capture'
                        : 'ស្គេន និងថតឥឡូវនេះ'
                      : language === 'zh-TW'
                      ? '立即拍照'
                      : language === 'en'
                      ? 'Capture Photo'
                      : 'ចុចថតរូប'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
