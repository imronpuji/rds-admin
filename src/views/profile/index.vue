<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Account" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane label="Setting Password" name="password">
                <setting :setting="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Activity from './components/Activity'
import Timeline from './components/Timeline'
import Account from './components/Account'
import Setting from './components/SettingPwd'

export default {
  name: 'Profile',
  components: { UserCard, Activity, Timeline, Account, Setting },
  data() {
    return {
      user: {},
      activeTab: 'account'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'email', 
      'id',
      'phone'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      console.log(this.email)
      this.user = {
        name: this.name,
        role: this.roles.join(' | '),
        avatar: this.avatar,
        email:this.email, 
        id : this.id,
        phone: this.phone
      }
    }
  }
}
</script>
