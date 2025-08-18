"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HLSPlayerControls({ src }: { src: string }) {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    let hls: any;

    if (videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = src;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video ref={videoRef} controls className="rounded-md" preload="auto" />
  );
}
