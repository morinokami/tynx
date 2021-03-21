import axios from 'axios'
import meow from 'meow'

const cli = meow()

const url = cli.input[0]
axios.get(url).then((response) => console.log(response.data))
