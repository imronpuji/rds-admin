<template>
  <div>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Nama Produk" min-width="200">
      <template slot-scope="scope">
        {{ scope.row.name }}
      </template>
    </el-table-column>
    <el-table-column label="Jumlah Barang" width="195" align="center">
      <template slot-scope="scope">
        {{ scope.row.qty }} {{ scope.row.unit == null ? 'unit tidak ada' : scope.row.unit.name }} 
      </template>
    </el-table-column>
  </el-table>
    </div>
</template>

<script>
import { transactionList } from '@/api/remote-search'
import  axios  from '@/api/axios'

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
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
        axios.get('/product').then(response => {
          console.log(response)
        this.list = response.data.product.filter(val => val.category == 'product').sort(function(a, b) {
    return parseFloat(a.qty) - parseFloat(b.qty);
});
        this.total = response.data.product.length

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    }
  }
}
</script>
