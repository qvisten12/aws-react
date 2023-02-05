import { useState, useEffect, FormEvent } from 'react'
import './App.css'
import '@aws-amplify/ui-react/styles.css'
import { API, Storage } from 'aws-amplify'
import { Button, Flex, Heading, Image, Text, TextField, View, withAuthenticator } from '@aws-amplify/ui-react'
import { listTodos } from './graphql/queries'
import { createTodo as createNoteMutation, deleteTodo as deleteNoteMutation } from './graphql/mutations'

interface AppProps {
  signOut?: any
}

const App = ({ signOut }: AppProps) => {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const apiData: any = await API.graphql({ query: listTodos })
    const notesFromAPI = apiData.data.listTodos.items
    await Promise.all(
      notesFromAPI.map(async (note: any) => {
        if (note.image) {
          const url = await Storage.get(note.id)
          note.image = url
        }
        return note
      })
    )
    setNotes(notesFromAPI)
  }

  async function createNote(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    const image: any = form.get('image')
    const data = {
      name: form.get('name'),
      description: form.get('description'),
      image: image.name,
    }
    if (!!data.image && data.name) await Storage.put(data.name.toString(), image)
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    })
    fetchNotes()
    event?.target?.reset()
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)
    await Storage.remove(name)
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    })
  }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField name="name" placeholder="Note Name" label="Note Name" labelHidden variation="quiet" required />
          <TextField name="description" placeholder="Note Description" label="Note Description" labelHidden variation="quiet" required />
          <View name="image" as="input" type="file" style={{ alignSelf: 'end' }} />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note: any) => (
          <Flex key={note.id || note.name} direction="row" justifyContent="center" alignItems="center">
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            {note.image && <Image src={note.image} alt={`visual aid for ${note.name}`} style={{ width: 400 }} />}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  )
}

export default withAuthenticator(App)
