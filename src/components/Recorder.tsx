/* eslint-disable */
import {
  Button,
  Center,
  Container,
  LoadingOverlay,
  Modal,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { api } from "~/utils/api";
import { createId } from "@paralleldrive/cuid2";
import { Routes } from "~/utils/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { set } from "zod";
import { marked } from "marked";

const Recorder = () => {
  const router = useRouter();
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const { mutateAsync: fetchPresignedUrls } =
    api.s3.getStandardUploadPresignedUrl.useMutation();
  const { mutateAsync: updateTranscription } =
    api.transcription.updateTranscription.useMutation();
  api.s3.getStandardUploadPresignedUrl.useMutation();
  const { mutateAsync: fetchWhisper } = api.whisper.get.useMutation({
    onSuccess: (whisperData) => {
      handleWhisperData(whisperData);
      console.log("successfully whispered");
    },
  });
  const [myKey, setMyKey] = useState<string>("");
  const [myBlob, setMyBlob] = useState<Blob | null>(null);
  const { user } = useUser();
  const [chunks, setChunks] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  const recorderControls = useAudioRecorder();

  async function handleWhisperData(whisperData: any) {
    const response = await fetch(Routes.gpt, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: whisperData.data,
      }),
    });
    if (!response) {
      return;
    }
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data: ReadableStream<BufferSource> | null = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let total = "";

    setModalOpen(true);
    setVisible(false);
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) continue;
      const chunkValue = decoder.decode(value);
      setChunks((prev) => prev + chunkValue);
      total += chunkValue;
      setText(total);
    }
    setVisible(true);
    setModalOpen(false);

    await updateTranscription({
      id: whisperData.id,
      data: total,
    });
    setVisible(false);

    router.push("/transcript/" + whisperData.id);
  }

  if (user === undefined || user === null) {
    return <div>loading...</div>;
  }

  async function handleWhisperAudio(key: string) {
    if (user) {
      await fetchWhisper({ key: key, userId: user.id });
    }
  }

  const addAudioElement = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
    const key = createId();
    setMyKey(key);
    setMyBlob(blob);
    await fetchPresignedUrls({
      key: key,
    })
      .then((url) => {
        setPresignedUrl(url);
      })
      .catch((err) => console.error(err));
  };

  const onClick = async () => {
    if (presignedUrl && myBlob) {
      setVisible(true);
      await axios
        .put(presignedUrl, myBlob.slice(), {
          headers: { "Content-Type": myBlob.type },
        })
        .then((response) => {
          console.log(response);
          console.log("Successfully uploaded ", myBlob.name);
        })
        .catch((err) => console.error(err));
      await handleWhisperAudio(myKey);
    }
  };

  return (
    <>
      <Modal opened={modalOpen} onClose={() => setModalOpen(true)}>
        <Paper shadow="md" radius={"md"}>
          <div dangerouslySetInnerHTML={{ __html: marked(chunks) }} />
        </Paper>
      </Modal>
      <Stack>
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <Title>Record your Appointment</Title>
        <Center>
          <AudioRecorder
            onRecordingComplete={(blob) => void addAudioElement(blob)}
            recorderControls={recorderControls}
            showVisualizer={true}
          />
          {presignedUrl && myBlob && (
            <Button onClick={onClick} variant="outline">
              Save
            </Button>
          )}
        </Center>
      </Stack>
    </>
  );
};

export default Recorder;
