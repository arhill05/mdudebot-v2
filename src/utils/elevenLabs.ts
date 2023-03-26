import axios from "axios";

import * as dotenv from "dotenv";
dotenv.config();


const { ELEVENLABS_API_KEY, ELEVENLABS_DREW_VOICE_ID, ELEVEN_LABS_API_URL } = process.env;

axios.defaults.headers.common = {
  "xi-api-key": ELEVENLABS_API_KEY ?? "",
};

const getAudioStreamForText = async (text: string) => {
  const url = `${ELEVEN_LABS_API_URL}text-to-speech/${ELEVENLABS_DREW_VOICE_ID}`;

  const stream = await axios.post(url, {
    text,
  }, {
    responseType: 'arraybuffer'
  });

  return stream.data;
};

export default getAudioStreamForText;
