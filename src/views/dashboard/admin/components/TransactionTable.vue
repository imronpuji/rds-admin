<template>
  <div>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Kas" width="195" align="center">
      <template slot-scope="scope">
        <span>{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Jumlah" min-width="300">
      <template slot-scope="scope">
        <span>Rp{{ scope.row.total | toThousandFilter }}</span>
      </template>
    </el-table-column>
  </el-table>
  <h4>Total : Rp{{total | toThousandFilter}}</h4>
  </div>
</template>

<script>
import { transactionList } from '@/api/remote-search'
import axios from '@/api/axios'
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: null,
      total: ""
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      axios.get('/akun/iscash').then(response => {
        console.log(response)
        this.list = response.data.akun

        // Just to simulate the time of the request
        const total = response.data.akun.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue.total;
        }, 0);


        
        this.total = total

      })
    }
  }
}
</script>
