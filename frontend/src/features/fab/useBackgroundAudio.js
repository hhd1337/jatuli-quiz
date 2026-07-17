import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

const WHITE_NOISE_SRC = "/audio/white-noise.mp3";

// 백색소음을 일반적으로 재생할 때의 볼륨
const NORMAL_VOLUME = 0.7;

// 정답·해설 음성을 읽는 동안의 백색소음 볼륨
const DUCKED_VOLUME = 0.08;

// 볼륨이 부드럽게 변하는 시간
const VOLUME_FADE_DURATION_MS = 250;

function clampVolume(value) {
    return Math.min(1, Math.max(0, Number(value) || 0));
}

export default function useBackgroundAudio() {
    const audioRef = useRef(null);
    const volumeAnimationFrameRef = useRef(null);
    const isDuckedRef = useRef(false);

    const [isMusicOn, setIsMusicOn] = useState(false);

    const cancelVolumeFade = useCallback(() => {
        if (volumeAnimationFrameRef.current !== null) {
            window.cancelAnimationFrame(
                volumeAnimationFrameRef.current
            );

            volumeAnimationFrameRef.current = null;
        }
    }, []);

    const fadeVolumeTo = useCallback(
        (targetVolume) => {
            const audio = audioRef.current;

            if (!audio) {
                return;
            }

            cancelVolumeFade();

            const safeTargetVolume = clampVolume(targetVolume);
            const startVolume = audio.volume;

            if (
                Math.abs(startVolume - safeTargetVolume) < 0.001
            ) {
                audio.volume = safeTargetVolume;
                return;
            }

            const startedAt = window.performance.now();

            const updateVolume = (currentTime) => {
                const elapsedTime = currentTime - startedAt;

                const progress = Math.min(
                    1,
                    elapsedTime / VOLUME_FADE_DURATION_MS
                );

                audio.volume =
                    startVolume +
                    (safeTargetVolume - startVolume) * progress;

                if (progress < 1) {
                    volumeAnimationFrameRef.current =
                        window.requestAnimationFrame(updateVolume);
                    return;
                }

                audio.volume = safeTargetVolume;
                volumeAnimationFrameRef.current = null;
            };

            volumeAnimationFrameRef.current =
                window.requestAnimationFrame(updateVolume);
        },
        [cancelVolumeFade]
    );

    useEffect(() => {
        const audio = new Audio(WHITE_NOISE_SRC);

        audio.loop = true;
        audio.preload = "auto";
        audio.volume = NORMAL_VOLUME;

        const handlePlay = () => {
            setIsMusicOn(true);
        };

        const handlePause = () => {
            setIsMusicOn(false);
        };

        const handleError = () => {
            setIsMusicOn(false);

            console.error(
                "백색소음 오디오 파일을 불러오지 못했습니다."
            );
        };

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("error", handleError);

        audioRef.current = audio;

        return () => {
            cancelVolumeFade();

            audio.pause();
            audio.currentTime = 0;

            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("error", handleError);

            audio.removeAttribute("src");
            audio.load();

            audioRef.current = null;
        };
    }, [cancelVolumeFade]);

    const toggleMusic = useCallback(async () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (!audio.paused) {
            audio.pause();
            return;
        }

        // 정답 읽기 중에 백색소음을 새로 켜면
        // 처음부터 작은 볼륨으로 재생한다.
        audio.volume = isDuckedRef.current
            ? DUCKED_VOLUME
            : NORMAL_VOLUME;

        try {
            await audio.play();
        } catch (error) {
            setIsMusicOn(false);

            console.error(
                "백색소음 재생에 실패했습니다.",
                error
            );

            window.alert(
                "백색소음을 재생하지 못했습니다. 브라우저의 미디어 재생 설정을 확인해주세요."
            );
        }
    }, []);

    const duckBackgroundAudio = useCallback(() => {
        isDuckedRef.current = true;
        fadeVolumeTo(DUCKED_VOLUME);
    }, [fadeVolumeTo]);

    const restoreBackgroundAudio = useCallback(() => {
        isDuckedRef.current = false;
        fadeVolumeTo(NORMAL_VOLUME);
    }, [fadeVolumeTo]);

    return {
        isMusicOn,
        toggleMusic,
        duckBackgroundAudio,
        restoreBackgroundAudio,
    };
}