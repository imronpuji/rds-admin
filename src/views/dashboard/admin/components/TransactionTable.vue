<template>
  <div>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Kas" width="195" align="center">
      <template slot-scope="scope">
        <span v-if="scope.row.cashin != null">{{ scope.row.to.name }}</span>
        <span v-else>{{ scope.row.from.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Jumlah" min-width="300">
      <template slot-scope="scope">
        <span v-if="scope.row.cashin != null">Rp{{ scope.row.cashin | toThousandFilter }}</span>
        <span v-else>Rp{{ scope.row.cashout | toThousandFilter }}</span>
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
      axios.get('/cash').then(response => {
        console.log(response)
        this.list = response.data.cashtransaction

        // Just to simulate the time of the request
        const cashin = response.data.cashtransaction.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue.cashin;
        }, 0);

        const cashout = response.data.cashtransaction.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue.cashout;
        }, 0);
        
        this.total = cashout + cashin

      })
    }
  }
}
</script>
