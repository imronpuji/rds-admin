import axios from 'axios'
// 'https://cors-anywhere.herokuapp.com/apisiakad.hilmimubarok.com'
export default axios.create({
  baseURL: 'https://d75d59946237.ngrok.io/api'
  // baseURL: 'https://1571156cb4fc.ngrok.io'

})
