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
        <span>{{handleCurrency(scope.row.total)}}</span>
      </template>
    </el-table-column>
  </el-table>
  <h4>Total : {{handleCurrency(total)}}</h4>
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
      total: "", 

    }
  },
  created() {
    this.fetchData()
  },
  methods: {
        handleCurrency(number){
     const idr = new Intl.NumberFormat('in-IN', { style: 'currency', currency: 'IDR' }).format(number)
     return idr
   },
    fetchData() {
      axios.get('/akun/iscash').then(response => {
        this.list = response.data.akun.filter((val) => val.name == 'Kas Besar'|| val.name == 'Kas Kecil')
        console.log(response)

        // Just to simulate the time of the request
        const total = this.list.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue.total;
        }, 0);


        this.total = total

      

      })
    }
  }
}
</script>
