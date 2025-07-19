"use client";
import {useEffect, useRef} from "react";
import Hls from "hls.js";

export default function HlsPlayer({src}: { src: string }) {
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
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className=" absolute left-0 right-0 w-full aspect-[3/4] sm:aspect-[3/2] lg:aspect-[2/1] 2xl:aspect-[21/9] object-cover"
            poster="/first_frame.jpg"
            preload="auto"
        />
    );
}
