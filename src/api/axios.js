import axios from 'axios'
// 'https://cors-anywhere.herokuapp.com/apisiakad.hilmimubarok.com'
export default axios.create({
    baseURL: 'http://caf483d9e247.ngrok.io/api'
    // baseURL: 'https://1571156cb4fc.ngrok.io'
 
  })