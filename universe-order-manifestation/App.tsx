import React, { useState, useRef } from "react";
import InputField from "./components/InputField";
import { ManifestationInputs } from "./types";
import { generateManifestationText, generateAudioFromText } from "./services/geminiService";
import { audioBufferToWav } from "./services/audioUtils";
import {
  Sparkles,
  Heart,
  Brain,
  Zap,
  DollarSign,
  BookOpen,
  Calendar,
  Clock,
  Play,
  Pause,
  Download,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";

const App: React.FC = () => {
  // State for form inputs
  const [inputs, setInputs] = useState<ManifestationInputs>({
    name: "Lê Trường",
    date: new Date().toISOString().split("T")[0], // Default to today
    time: "04:30",
    healthGoal: "Uống dinh dưỡng F1, tập gym",
    timeGoal: "Thêm 3 tiếng thưởng thức phong cách triệu phú đô la",
    contributionGoal: "Livestream bộ công thức hút nguồn lực giúp 60 người thành công",
    growthGoal: "Chép 10 trang livestream nâng chỉ số IQ về tài chính",
    financialGoal: "Tạo được một app về nâng cao chỉ số IQ tài chính và chia sẻ lên Youtube",
    readingGoal: "Tạo được một app về đọc sách sức mạnh tiềm thức và chia sẻ cho bạn tôi",
  });

  // State for logic handling
  const [generatedText, setGeneratedText] = useState<string>("");
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioGenerating, setIsAudioGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Refs for audio playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedText("");
    setAudioBuffer(null);
    stopAudio();

    try {
      const text = await generateManifestationText(inputs);
      setGeneratedText(text);
    } catch (error) {
      console.error("Error generating text:", error);
      alert("Có lỗi xảy ra khi tạo nội dung. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudio = async () => {
    if (!generatedText) return;
    setIsAudioGenerating(true);
    try {
      const buffer = await generateAudioFromText(generatedText);
      setAudioBuffer(buffer);
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("Có lỗi xảy ra khi tạo audio.");
    } finally {
      setIsAudioGenerating(false);
    }
  };

  const playAudio = () => {
    if (!audioBuffer) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // Create source
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    // Calculate start time based on pause
    const offset = pausedAtRef.current % audioBuffer.duration;
    
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime - offset;
    
    setIsPlaying(true);

    source.onended = () => {
      // Only reset if it finished naturally (not stopped by user)
    };
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    pausedAtRef.current = 0;
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!audioBuffer) return;
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universe-order-${inputs.date}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950/80 z-10" /> {/* Dark overlay for text readability */}
        <img 
          src="https://i.ibb.co/V1g2mq3/60nguoi.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Decorative Gradients overlay */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/30 rounded-full blur-[120px] z-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/30 rounded-full blur-[120px] z-20" />
      </div>

      <div className="relative z-30 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-full mb-4 ring-1 ring-slate-700 shadow-lg shadow-purple-500/10 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
              Universe Order (Thì Hiện Tại)
            </h1>
          </div>
          <p className="text-slate-300 max-w-lg mx-auto font-medium shadow-black drop-shadow-md">
            Khẳng định thực tại của bạn ngay bây giờ.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form Column */}
          <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-purple-200">
              <Calendar className="w-5 h-5 mr-2" />
              Thông Tin Đặt Hàng
            </h2>
            
            <div className="space-y-4">
              <InputField
                  label="Họ và tên"
                  name="name"
                  value={inputs.name}
                  onChange={handleInputChange}
                  icon={<User className="w-4 h-4 text-slate-300" />}
                  placeholder="Ví dụ: Lê Trường"
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Ngày hiện tại"
                  name="date"
                  type="date"
                  value={inputs.date}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Giờ"
                  name="time"
                  type="time"
                  value={inputs.time}
                  onChange={handleInputChange}
                />
              </div>

              <InputField
                label="Sức khoẻ & Cơ thể"
                name="healthGoal"
                value={inputs.healthGoal}
                onChange={handleInputChange}
                icon={<Heart className="w-4 h-4 text-red-400" />}
                placeholder="VD: Uống dinh dưỡng F1, tập gym..."
              />

              <InputField
                label="Thời gian & Phong cách"
                name="timeGoal"
                value={inputs.timeGoal}
                onChange={handleInputChange}
                icon={<Clock className="w-4 h-4 text-blue-400" />}
                placeholder="VD: 3 tiếng phong cách triệu phú..."
              />

              <InputField
                label="Cống hiến"
                name="contributionGoal"
                value={inputs.contributionGoal}
                onChange={handleInputChange}
                icon={<Zap className="w-4 h-4 text-yellow-400" />}
                type="textarea"
                placeholder="VD: Livestream giúp 60 người..."
              />

              <InputField
                label="Phát triển bản thân"
                name="growthGoal"
                value={inputs.growthGoal}
                onChange={handleInputChange}
                icon={<Brain className="w-4 h-4 text-pink-400" />}
                placeholder="VD: Chép 10 trang sách..."
              />

              <InputField
                label="Tài chính"
                name="financialGoal"
                value={inputs.financialGoal}
                onChange={handleInputChange}
                icon={<DollarSign className="w-4 h-4 text-green-400" />}
                placeholder="VD: Tạo app tài chính..."
              />

              <InputField
                label="Đọc sách & Kết nối"
                name="readingGoal"
                value={inputs.readingGoal}
                onChange={handleInputChange}
                icon={<BookOpen className="w-4 h-4 text-orange-400" />}
                placeholder="VD: Chia sẻ cho bạn tôi..."
              />

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi tín hiệu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Tạo Đơn Hàng Ngay Bây Giờ
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl flex-grow flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-200">
                <Sparkles className="w-5 h-5 mr-2" />
                Thông Điệp Từ Vũ Trụ
              </h2>
              
              <div className="flex-grow bg-slate-950/60 rounded-xl p-4 border border-slate-800/50 overflow-y-auto max-h-[500px] shadow-inner">
                {generatedText ? (
                  <p className="whitespace-pre-line text-lg leading-relaxed text-slate-200 font-medium">
                    {generatedText}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Sparkles className="w-10 h-10 opacity-20" />
                    <p className="text-center">Hãy nhập mục tiêu và ấn nút tạo<br/>để khẳng định ngày tuyệt vời của bạn.</p>
                  </div>
                )}
              </div>

              {generatedText && (
                <div className="mt-6 border-t border-slate-700 pt-6">
                  {!audioBuffer ? (
                    <button
                      onClick={handleCreateAudio}
                      disabled={isAudioGenerating}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-600 shadow-lg"
                    >
                      {isAudioGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang tạo Audio thôi miên...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Tạo Audio (Giọng đọc AI)
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-indigo-900/40 rounded-xl p-4 border border-indigo-500/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-indigo-200 font-medium">Audio Sẵn Sàng</span>
                        <div className="flex gap-2">
                           <button
                            onClick={isPlaying ? pauseAudio : playAudio}
                            className="p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full transition-colors shadow-lg shadow-indigo-500/20"
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6" fill="currentColor" />
                            ) : (
                              <Play className="w-6 h-6 pl-1" fill="currentColor" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleDownload}
                        className="w-full mt-2 text-sm text-slate-300 hover:text-white flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Tải về máy (.wav)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;