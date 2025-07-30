import React from 'react';
import VideoPlayer from './ui/VideoPlayer';

const VideoTest = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test du lecteur vidéo</h1>
      <div className="max-w-2xl">
        <VideoPlayer 
          src="/video-web.mp4" 
          className="w-full aspect-video"
        />
      </div>
    </div>
  );
};

export default VideoTest; 