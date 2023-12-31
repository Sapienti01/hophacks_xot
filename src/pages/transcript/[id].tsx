/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  Button,
  Loader,
  Flex,
  Tabs,
  Space,
} from "@mantine/core";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { Routes } from "~/utils/types";
import { marked } from "marked";

const Transcript: React.FC = () => {
  const user = useUser();

  const router = useRouter();
  const { mutateAsync } =
    api.appointmentDetails.updateAppointmentDetails.useMutation();
  const { id } = router.query;
  const ctx = api.useContext();

  const [data, setData] = useState();
  const [activeTab, setActiveTab] = useState("transciption");
  const [transName, setTransName] = useState<string>();
  const [curTransName, setCurTransName] = useState<string>();
  const [appointmentType, setAppointmentType] = useState<string>();
  const [drName, setDrName] = useState<string>();
  const [text, setText] = useState<string>("");
  const [date, setDate] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [numChangeName, setNumChangeName] = useState<number>(0);
  const [numChangeType, setNumChangeType] = useState<number>(0);
  const [numChangeDr, setNumChangeDr] = useState<number>(0);
  const [insights, setInsights] = useState<string>("");
  const [questions, setQuestions] = useState<string>("");
  const [defaultTab, setDefaultTab] = useState<string>("transcription");
  const { mutateAsync: updateTranscription } =
    api.transcription.updateTranscription.useMutation();
  const { mutateAsync: updateInsights } =
    api.transcription.updateInsights.useMutation();
  const { mutateAsync: updateQuestions } =
    api.transcription.updateQuestions.useMutation();

  const {
    data: mydata,
    isLoading,
    isError,
  } = api.transcription.getTranscription.useQuery(
    {
      id: id as string,
    },
    {
      onSuccess: (data) => {
        if (data) {
          setTransName(
            data.appointmentDetails ? data.appointmentDetails.name : "",
          );
          setCurTransName(
            data.appointmentDetails ? data.appointmentDetails.name : "",
          );
          setAppointmentType(
            data.appointmentDetails ? data.appointmentDetails.type : "",
          );
          setDrName(
            data.appointmentDetails ? data.appointmentDetails.DoctorName : "",
          );
          const dateStr = new Date(data.createdAt).toLocaleDateString();
          setDate(dateStr);
          setText(data.data ? data.data : "");
          setInsights(
            data.insights ? data.insights : "You currently have no insights.",
          );
          setQuestions(
            data.questions
              ? data.questions
              : "You currently have no questions.",
          );
          setUserId(data.userId ? data.userId : "");
        }
      },
    },
  );
  const [chunks, setChunks] = useState<string>("");

  if (!mydata || isLoading) {
    return (
      <Flex justify="center" align="center">
        <Loader />
      </Flex>
    );
  }

  const onClick = async () => {
    await mutateAsync({
      id: mydata.appointmentDetailsId,
      recName: curTransName ? curTransName : "",
      aptType: appointmentType ? appointmentType : "",
      drName: drName ? drName : "",
    });
    ctx.transcription.getTranscription.invalidate({ id: id as string });
  };

  const handleSimplifyOnClick = async () => {
    setDefaultTab("transcription");
    const response = await fetch(Routes.gpt, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
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
    setChunks("");

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) continue;
      const chunkValue = decoder.decode(value);
      setChunks((prev) => prev + chunkValue);
      total += chunkValue;
      setText(total);
    }
    await updateTranscription({
      id: id as string,
      data: total,
    });
  };

  const handleRegenInsightsOnClick = async () => {
    setDefaultTab("Insights");
    const response = await fetch("/api/insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "Please regenerate the current insights: " +
          insights +
          ". Here is the currrent transcription between patient and doctor: " +
          text +
          ".",
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
    setChunks("");
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) continue;
      const chunkValue = decoder.decode(value);
      setChunks((prev) => prev + chunkValue);
      total += chunkValue;
      setInsights(total);
    }

    await updateInsights({
      id: id as string,
      data: total,
    });
  };

  const handleSimplifyInsightsOnClick = async () => {
    setDefaultTab("Insights");
    const response = await fetch("/api/insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "Please simplify the language of the current insights for the patient: " +
          insights,
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
    setChunks("");
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) continue;
      const chunkValue = decoder.decode(value);
      setChunks((prev) => prev + chunkValue);
      total += chunkValue;
      setInsights(total);
    }

    await updateInsights({
      id: id as string,
      data: total,
    });
  };

  const handleRegenQuestionsOnClick = async () => {
    setDefaultTab("Questions");
    const response = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "Please regenerate more questions for the patient. Here are the current questions. If there are none. Please generate some questions based on the transcript " +
          questions +
          ". Here is the currrent transcription between patient and doctor: " +
          text +
          ".",
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
    setChunks("");
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!value) continue;
      const chunkValue = decoder.decode(value);
      setChunks((prev) => prev + chunkValue);
      total += chunkValue;
      setQuestions(total);
    }

    await updateQuestions({
      id: id as string,
      data: total,
    });
  };

  function MyTabs() {
    return (
      <Tabs defaultValue={defaultTab}>
        <Tabs.List>
          <Tabs.Tab value="transciption">Transciption</Tabs.Tab>
          <Tabs.Tab value="Insights">Insights</Tabs.Tab>
          <Tabs.Tab value="Questions">Questions</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="transciption">
          <Stack>
            <Space h="5" />
            <div>
              <Paper shadow="lg" radius="lg" p="md">
                <div dangerouslySetInnerHTML={{ __html: marked(text) }} />
              </Paper>
            </div>
            <Space h="5" />
            <Grid className="ml-2 space-x-4">
              <Button
                variant="outline"
                w={150}
                onClick={(e) => {
                  e.preventDefault();
                  handleSimplifyOnClick().catch((err) => console.log(err));
                }}
              >
                Simplify
              </Button>
            </Grid>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="Insights">
          <Stack>
            <Space h="5" />
            <div>
              <Paper shadow="lg" radius="lg" p="md">
                <div dangerouslySetInnerHTML={{ __html: marked(insights) }} />
              </Paper>
            </div>
            <Space h="5" />
            <Grid className="ml-2 space-x-4">
              <Button
                variant="outline"
                w={150}
                onClick={(e) => {
                  e.preventDefault();
                  handleSimplifyInsightsOnClick().catch((err) =>
                    console.log(err),
                  );
                }}
              >
                Simplify
              </Button>

              <Button
                variant="outline"
                w={150}
                onClick={(e) => {
                  e.preventDefault();
                  handleRegenInsightsOnClick().catch((err) => console.log(err));
                }}
              >
                Regenerate
              </Button>
            </Grid>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="Questions">
          <Stack>
            <Space h="5" />
            <div>
              <Paper shadow="lg" radius="lg" p="md">
                <div dangerouslySetInnerHTML={{ __html: marked(questions) }} />
              </Paper>
            </div>
            <Space h="5" />
            <Grid className="ml-2 space-x-4">
              <Button
                variant="outline"
                w={150}
                onClick={(e) => {
                  e.preventDefault();
                  handleRegenQuestionsOnClick().catch((err) =>
                    console.log(err),
                  );
                }}
              >
                Regenerate
              </Button>
            </Grid>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    );
  }

  return (
    <Grid grow gutter="md">
      <Grid.Col span={4}>
        <Stack>
          <Title>{transName}</Title>
          <MyTabs />
        </Stack>
      </Grid.Col>
      <Grid.Col offset={1} span={2}>
        <Stack>
          <TextInput
            placeholder={"Name"}
            value={curTransName}
            label="Recording Name"
            withAsterisk
            onChange={(event) => {
              setCurTransName(event.currentTarget.value);
              setNumChangeName((n) => n + 1);
            }}
          />
          <TextInput
            placeholder={"Appointment Type"}
            value={appointmentType}
            label="Appointment Type"
            withAsterisk
            onChange={(event) => {
              setAppointmentType(event.currentTarget.value);
              setNumChangeType((n) => n + 1);
            }}
          />
          <TextInput
            placeholder="Doctor's Name"
            value={drName}
            label="Doctor Name"
            withAsterisk
            onChange={(event) => {
              setDrName(event.currentTarget.value);
              setNumChangeDr((n) => n + 1);
            }}
          />
          <Text> Appointment Date: {date} </Text>
          <Button variant="outline" onClick={onClick}>
            {" "}
            Save{" "}
          </Button>
        </Stack>
      </Grid.Col>
      <Grid.Col span={1}></Grid.Col>
    </Grid>
  );
};

export default Transcript;
