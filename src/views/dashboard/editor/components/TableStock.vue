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
        {{ scope.row.qty }} {{ scope.row.unit.name }} 
      </template>
    </el-table-column>
  </el-table>
  <br>
  <el-button type="primary">
    <router-link to="/produk">Lihat Produk Lainya</router-link>
  </el-button>

  <br>
  <br>
  <h4>Data Piutang</h4>
  <el-table :data="list_piutang" style="width: 100%;padding-top: 15px;">
     <el-table-column label="ID" min-width="36">
      <template slot-scope="scope">
        {{ scope.row.id }}
      </template>
    </el-table-column>
    <el-table-column label="Nama" min-width="100">
      <template slot-scope="scope">
        {{ scope.row.contact.name }}
      </template>
    </el-table-column>
    <el-table-column label="Jumlah Piutang" min-width="100">
      <template slot-scope="scope">
        {{ handleCurrency(scope.row.debt) }}
      </template>
    </el-table-column>
    <el-table-column label="Jatuh Tempo" min-width="100">
      <template slot-scope="scope">
        {{ scope.row.payment_due }}
      </template>
    </el-table-column>
  </el-table> <br>
  <el-button type="primary">
    <router-link to="/laporan/piutang/beredar">Lihat Piutang Lainya</router-link>
  </el-button>
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
      list: null,
      llist_piutang : '',
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
       axios.get('/stock/out/debt/due').then(response => {
          console.log(response)
        let data  = response.data.stocktransaction.map(val => {
          val['debt'] = val.total - val.paid - val.discount
          return val
        })

        this.list_piutang = data.slice(0,4)
        });

        axios.get('/product').then(response => {
          console.log(response)
       let data = response.data.product.sort(function(a, b) {
    return parseFloat(a.qty) - parseFloat(b.qty);
});
this.list = data.slice(0,4)
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
