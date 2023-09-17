import { useRouter } from 'next/router'
import { useState } from 'react'
import { Grid, Paper, Stack, Title, Text, TextInput, Button, Loader, Flex } from '@mantine/core'
import { api } from '~/utils/api'
import { useUser } from '@clerk/nextjs'
import { set, string } from 'zod'

const Transcript: React.FC = () => {

    const user = useUser()

    const router = useRouter()
    const { mutateAsync } = api.appointmentDetails.updateAppointmentDetails.useMutation();
    const { id } = router.query
    const ctx = api.useContext();

    const [data, setData] = useState()
    const [transName, setTransName] = useState<string>()
    const [curTransName, setCurTransName] = useState<string>()
    const [appointmentType, setAppointmentType] = useState<string>()
    const [drName, setDrName] = useState<string>()
    const [text, setText] = useState<string>()
    const [date, setDate] = useState<string>()
    const [userId, setUserId] = useState<string>()
    const [numChangeName, setNumChangeName] = useState<number>(0)
    const [numChangeType, setNumChangeType] = useState<number>(0)
    const [numChangeDr, setNumChangeDr] = useState<number>(0)

    const {data: mydata, isLoading, isError} = api.transcription.getTranscription.useQuery({
        id: id as string,
    },
    {onSuccess: (data) => {
        if (data) {
            setTransName(data.appointmentDetails ? data.appointmentDetails.name : '')
            setCurTransName(data.appointmentDetails ? data.appointmentDetails.name : '')
            setAppointmentType(data.appointmentDetails ? data.appointmentDetails.type : '')
            setDrName(data.appointmentDetails ? data.appointmentDetails.DoctorName : '')
            const dateStr = new Date(data.createdAt).toLocaleDateString()
            setDate(dateStr)
            setText(data.data ? data.data : '')
            setUserId(data.userId ? data.userId : '')
        }
    }})


    
    if (!mydata || isLoading ) {
        return (
            <Flex justify="center" align="center">
                <Loader />
            </Flex>
        )
    }

    const onClick = async () => {
        await mutateAsync({
            id: mydata.appointmentDetailsId,
            recName: curTransName ? curTransName : '',
            aptType: appointmentType ? appointmentType : '',
            drName: drName ? drName : '',
        })
        ctx.transcription.getTranscription.invalidate({id: id as string});
    }
    
    const onClickMedslate = async () => {
        setText('This is the medslated version of the transcript')
    }

    return (
        <Grid grow gutter='md'>
            <Grid.Col span={4}>
                    <Stack> 
                        <Title>{transName}</Title>
                        <Button variant='outline' w={100} onClick={onClickMedslate}>Medslate</Button>
                        <Paper shadow="lg" radius="lg" p="md"> 
                            <Text>
                                {text}
                            </Text>
                        </Paper>
                    </Stack>
            </Grid.Col>
            <Grid.Col offset={1} span={2}>
                <Stack>
                        <TextInput value={curTransName || numChangeName > 0 ? curTransName : 'Name'} label="Recording Name" withAsterisk onChange={(event) => {
                            setCurTransName(event.currentTarget.value) 
                            setNumChangeName(n => n + 1)
                        } 
                        }/>
                        <TextInput value={appointmentType || numChangeType > 0 ? appointmentType : 'Appointment Type'} label="Appointment Type" withAsterisk onChange={(event) => {
                            setAppointmentType(event.currentTarget.value)
                            setNumChangeType(n => n + 1)
                        }} />
                        <TextInput value={drName || numChangeDr > 0 ? drName : 'Doctor Name'} label="Doctor Name" withAsterisk onChange={(event) => {
                            setDrName(event.currentTarget.value)
                            setNumChangeDr(n => n + 1)
                        }} />
                        <Text> Appointment Date: {date} </Text>
                        <Button variant='outline' onClick={onClick}> Save </Button>
                </Stack>
            </Grid.Col>
            <Grid.Col span = {1}></Grid.Col>
        </Grid>
    )
}

export default Transcript