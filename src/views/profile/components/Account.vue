<template>
  <el-form>
    <el-form-item label="Name">
      <el-input v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model.trim="user.email" />
    </el-form-item>
    <el-form-item label="Phone">
      <el-input v-model.trim="user.phone" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import axios from '@/api/axios'
import { mapGetters } from 'vuex'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          password : '',
          id : '',
          phone:''
        }
      }
    }
  },
   computed: {
    ...mapGetters([
      'token'
    ])
  },
  methods: {
    submit() {
      console.log(this.token)

     axios.put(`/profile/${this.user.id}`, {name : this.user.name, email : this.user.email, phone :this.user.phone }, {
       headers: {
        Authorization: `Bearer ${this.token}` 
      }
     })
     .then((response) => {
      this.$notify({
        title: 'Success',
        message: 'Update Successfully',
        type: 'success',
        duration: 2000
      })
    })
     .catch((err) => {
      this.$notify({
      message: 'server error',
      type: 'warning',
      duration: 5 * 1000
    })
     })
     

     this.$store.dispatch('user/getInfo')
   }
 }
}
</script>
