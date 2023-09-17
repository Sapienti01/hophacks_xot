/* eslint-disable */
import { Button, Center, Container, Stack, Title } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { api } from "~/utils/api";
import { createId } from "@paralleldrive/cuid2";
import { Routes } from "~/utils/types";

const Recorder = () => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const { mutateAsync: fetchPresignedUrls } =
    api.s3.getStandardUploadPresignedUrl.useMutation();

  const recorderControls = useAudioRecorder();
  async function handleWhisperAudio(key: string) {
    const response = await fetch("/api/getS3andWhisper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: key,
      }),
    });
    const data = await response.json();
    console.log(data);
    return data.transcript;
  }
  const addAudioElement = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
    const key = createId();

    await fetchPresignedUrls({
      key: key,
    })
      .then((url) => {
        setPresignedUrl(url);
      })
      .catch((err) => console.error(err));
    console.log(blob);
    if (presignedUrl) {
      console.log("here");
      await axios
        .put(presignedUrl, blob.slice(), {
          headers: { "Content-Type": blob.type },
        })
        .then((response) => {
          console.log(response);
          console.log("Successfully uploaded ", blob.name);
        })
        .catch((err) => console.error(err));
      console.log(key);
      const transcript = handleWhisperAudio(key);
      console.log("transcript", transcript);
    }
  };

  return (
    <Stack>
      <Title>Record your Appointment</Title>
      <Center>
        <AudioRecorder
          onRecordingComplete={(blob) => void addAudioElement(blob)}
          recorderControls={recorderControls}
          showVisualizer={true}
        />
      </Center>
    </Stack>
  );
};

export default Recorder;
