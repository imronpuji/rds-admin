<template>
  <el-form>
    <el-form-item label="Password Lama">
      <el-input v-model.trim="user.password" />
    </el-form-item>
    <el-form-item label="Password Baru">
      <el-input v-model.trim="user.newPassword" />
    </el-form-item>
    <el-form-item label="Konfirmasi Password">
      <el-input v-model.trim="user.rePassword" />
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
          newPassword : '',
          rePassword : '',
          id : ''
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

      const data = {
        password : this.user.password,
        newPassword : this.user.newPassword,
        rePassword : this.user.rePassword
      }
     axios.put(`/edit/password/${this.user.id}`, data)
     .then((response) => {
      this.dialogFormVisible = false
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
