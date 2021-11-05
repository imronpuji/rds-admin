import axios from 'axios'
import store from '../store/index'
// 'https://cors-anywhere.herokuapp.com/apisiakad.hilmimubarok.com'
export default axios.create({
  baseURL: 'https://lisensi.kawanmama.com/api'
  // baseURL: 'https://1571156cb4fc.ngrok.io'
   // baseURL: 'https://akutansi456.herokuapp.com/api'


})
