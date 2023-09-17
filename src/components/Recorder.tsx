/* eslint-disable */
import { Button, Center, Container, LoadingOverlay, Stack, Title } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { api } from "~/utils/api";
import { createId } from "@paralleldrive/cuid2";
import { Routes } from "~/utils/types";
import { useUser } from "@clerk/nextjs";

const Recorder = () => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const { mutateAsync: fetchPresignedUrls } =
    api.s3.getStandardUploadPresignedUrl.useMutation();
  const { mutateAsync: fetchWhisper } = api.whisper.get.useMutation();
  const [myKey, setMyKey] = useState<string>("");
  const [myBlob, setMyBlob] = useState<Blob | null>(null);
  const {user} = useUser();


  const recorderControls = useAudioRecorder();

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
    if(presignedUrl && myBlob) {
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
      setVisible(false);
  }
}


  return (
    <Stack>
      <LoadingOverlay visible={visible} overlayBlur={2} />
      <Title>Record your Appointment</Title>
      <Center>
        <AudioRecorder
          onRecordingComplete={(blob) => void addAudioElement(blob)}
          recorderControls={recorderControls}
          showVisualizer={true}
        />
        { presignedUrl && myBlob &&
        <Button onClick = {onClick} variant="outline">Save</Button>
}
      </Center>
    </Stack>
  );
};

export default Recorder;
