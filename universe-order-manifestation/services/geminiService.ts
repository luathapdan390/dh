import { GoogleGenAI, Modality } from "@google/genai";
import { ManifestationInputs } from "../types";
import { decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Generate the Manifestation Script
export const generateManifestationText = async (
  inputs: ManifestationInputs
): Promise<string> => {
  // Format date to DD/MM/YYYY for better Vietnamese natural language
  const dateObj = new Date(inputs.date);
  const formattedDate = `${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;

  const prompt = `
    Bạn là một chuyên gia về lập trình ngôn ngữ tư duy (NLP) và Luật Hấp Dẫn. Nhiệm vụ của bạn là viết một "Đơn Đặt Hàng Vũ Trụ" (Universe Order) ở thì HIỆN TẠI (Present Tense) dựa trên các thông tin sau:

    - Họ và tên: ${inputs.name}
    - Thời gian hiện tại: Hôm nay, ngày ${formattedDate}, lúc ${inputs.time}.
    - Sức khỏe: ${inputs.healthGoal}
    - Phong cách sống/Thời gian: ${inputs.timeGoal}
    - Cống hiến: ${inputs.contributionGoal}
    - Phát triển bản thân: ${inputs.growthGoal}
    - Tài chính: ${inputs.financialGoal}
    - Đọc sách/Trí tuệ: ${inputs.readingGoal}

    Yêu cầu viết:
    1. **Ngôi kể:** Ngôi thứ nhất ("Tôi", xưng tên là ${inputs.name} nếu cần thiết để khẳng định danh tính).
    2. **Thì:** TUYỆT ĐỐI dùng thì HIỆN TẠI hoặc HIỆN TẠI HOÀN THÀNH. Viết như thể hôm nay LÀ ngày ${formattedDate} và tôi ĐANG tận hưởng những điều này. KHÔNG dùng "sẽ", "mong muốn". Hãy dùng "Tôi đang", "Tôi có", "Tôi cảm thấy", "Tôi biết ơn vì đã...".
    3. **Mở đầu:** Bắt đầu bằng câu: "Hôm nay, ngày ${formattedDate}, tôi là ${inputs.name}..."
    4. **Cấu trúc 6 Nhu cầu Tony Robbins:**
       - **Chắc chắn:** Khẳng định sự an toàn, sức khoẻ tuyệt vời đang diễn ra.
       - **Đa dạng:** Sự thú vị, mới mẻ tôi đang trải nghiệm.
       - **Quan trọng (Significance):** Cảm giác thành tựu tôi đang có.
       - **Kết nối/Yêu thương:** Tôi đang chia sẻ niềm vui với người khác (bạn bè, cộng đồng).
       - **Phát triển:** Tôi đang học tập và thông minh hơn.
       - **Cống hiến:** Tôi đang giúp đỡ người khác ngay lúc này.
    5. **Sử dụng đa giác quan (VAK) cực mạnh:**
       - **Thị giác (Visual):** "Tôi nhìn thấy...", "Trước mắt tôi là..."
       - **Thính giác (Auditory):** "Tôi nghe thấy...", "Âm thanh của..."
       - **Xúc giác (Kinesthetic):** "Tôi cảm thấy...", "Cảm xúc trong tôi là..."
    6. **Giọng văn:** Hào hứng, biết ơn, mạnh mẽ, thôi miên, khẳng định quyền lực của người kiến tạo.

    Hãy viết thành một đoạn văn liền mạch, giàu cảm xúc để tôi nghe và cài đặt vào tiềm thức.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.8,
    },
  });

  return response.text || "";
};

// 2. Generate Audio from Text
export const generateAudioFromText = async (
  text: string
): Promise<AudioBuffer> => {
  // TTS Request
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" }, // Kore usually sounds calm/deep
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data returned from Gemini.");
  }

  // Use a temporary AudioContext to decode the raw PCM
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 24000,
  });

  return await decodeAudioData(base64Audio, audioContext, 24000);
};