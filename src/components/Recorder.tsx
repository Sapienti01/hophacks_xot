import { Button, Stack } from '@mantine/core';
import axios from 'axios';
import { useState } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { api } from '~/utils/api';
import { createId } from '@paralleldrive/cuid2';

const Recorder = () => {

    const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
    const { mutateAsync: fetchPresignedUrls } =
      api.s3.getStandardUploadPresignedUrl.useMutation();


  const recorderControls = useAudioRecorder()
  const addAudioElement = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
    const key = createId()
    await fetchPresignedUrls({
        key: key,
      })
        .then((url) => {
          setPresignedUrl(url);
        })
        .catch((err) => console.error(err));
        console.log(blob)
    if (presignedUrl) {
        console.log("here")
        await axios
            .put(presignedUrl, blob.slice(), {
            headers: { "Content-Type": blob.type },
            })
            .then((response) => {
            console.log(response);
            console.log("Successfully uploaded ", blob.name);
            })
            .catch((err) => console.error(err));
    }

  };


  return (
    <Stack>
      <AudioRecorder 
        onRecordingComplete={(blob) => void addAudioElement(blob)}
        recorderControls={recorderControls}
        downloadOnSavePress={true}
      />
    </Stack>
  )
}

export default Recorder;
