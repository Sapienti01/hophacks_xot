import { useRouter } from 'next/router'
import { useState } from 'react'
import data from './info.json'
import { Grid, Paper, Stack, Title, Text, TextInput, Button, Space } from '@mantine/core'

const Transcript: React.FC = () => {
    const router = useRouter()
    const { id } = router.query
    const [transName, setTransName] = useState<string>(data.transcriptName)
    const [curTransName, setCurTransName] = useState<string>(data.transcriptName)
    const [appointmentType, setAppointmentType] = useState<string>(data.appointmentType)
    const [drName, setDrName] = useState<string>(data.drName)
    const date = new Date(data.appointmentDate).toLocaleDateString()


    // useEffect(() => {
    //     setTransName(data.transcriptName)
    //     setCurTransName(data.transcriptName)
    //     setAppointmentType(data.appointmentType)
    //     setDrName(data.drName)
    // })

    const onClick = () => {
        setTransName(curTransName ? curTransName : transName)
    }
    
    return (
        <Grid grow gutter='md'>
            <Grid.Col span={4}>
                    <Stack> 
                        <Title>{transName}</Title>
                        <Paper shadow="lg" radius="lg" p="md"> 
                            <Text>
                                {data.data}
                            </Text>
                        </Paper>
                    </Stack>
            </Grid.Col>
            <Grid.Col offset={1} span={2}>
                <Stack>
                        <TextInput placeholder={transName? transName : 'Name'} label="Recording Name" withAsterisk onChange={(event) => setCurTransName(event.currentTarget.value)} />
                        <TextInput placeholder={appointmentType? appointmentType : 'Appointment Type'} label="Appointment Type" withAsterisk onChange={(event) => setAppointmentType(event.currentTarget.value)} />
                        <TextInput placeholder={drName? drName : 'Doctor Name'} label="Doctor Name" withAsterisk onChange={(event) => setDrName(event.currentTarget.value)} />
                        <Text> Appointment Date: {date} </Text>
                        <Button variant='outline' onClick={onClick}> Save </Button>
                </Stack>
            </Grid.Col>
            <Grid.Col span = {1}></Grid.Col>
        </Grid>
    )
}

export default Transcript