import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

export interface YouTubeVideoResult {
  name: string;
  duration: string;
  link: string;
  stream: AudioResource;
}

const fetchYouTubeVideo = async (url: string): Promise<YouTubeVideoResult> => {
  const info = await ytdl.getBasicInfo(url);
  const stream = ytdl(url, {
    filter: "audioonly",
    highWaterMark: 1 << 25,
    quality: "highestaudio",
  });
  const audioResource = createAudioResource(stream);

  return {
    name: info.videoDetails.title,
    duration: info.videoDetails.lengthSeconds,
    link: url,
    stream: audioResource,
  };
};

export default fetchYouTubeVideo;
