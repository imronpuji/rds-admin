

<template>
  <div class="app-container">
   
    
    <GChart
      type="PieChart"
      :options="options"
      :data="data"
    />  

     <div class="block"></div>
    <el-date-picker v-model="start" class="filter-item" type="date" format="dd-MM-yyyy" placeholder="Dari">
    </el-date-picker>
    <el-date-picker style="margin-left:8px" v-model="end" class="filter-item" type="date" format="dd-MM-yyyy" placeholder="Sampai">
    </el-date-picker>
    <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="filterReportByDate">
        Filter
    </el-button>  
     <el-button class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
            Export
        </el-button>
    <el-table
     
      :data="list"
      
    >
     <el-table-column label="ID" prop="id"  align="center" width="80" >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Nama" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>  
      <el-table-column label="Total Barang" min-width="150px">
        <template slot-scope="{row}">
          <span >{{row.substocktransaction_sum_total }}</span>
        </template>
      </el-table-column> 
      <el-table-column label="Total Penjualan" min-width="150px">
        <template slot-scope="{row}">
          <span >{{ handleCurrency(row.substocktransaction_sum_qty) }}</span>
        </template>
      </el-table-column>     
    </el-table>
  </div>
</template>
<script>
import { GChart } from "vue-google-charts";
import axios from '@/api/axios'

export default {
  name: "App",
  components: {
    GChart
  },

  created(){
    axios.get('/stock/out/report').then(response => {
      this.list = response.data.stock
      console.log(this.list)
      response.data.stock.map((val) => {
        this.data.push([val.name, val.substocktransaction_sum_total])
      })
      

    })
  },

  methods : {
    handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['id', 'Customer', 'Total Barang', 'Total Penjualan']
            const filterVal = ['id', 'name', 'substocktransaction_sum_qty', 'substocktransaction_sum_total']
            const data = this.formatJson(filterVal)
            excel.export_json_to_excel({
                header: tHeader,
                data,
                filename: 'laporan_penjualan'
            })
            this.downloadLoading = false
        })
    },

     formatJson(filterVal) {
            return this.list.map(v => filterVal.map(j => {
                return v[j]
            }))
        },

    filterReportByDate(){
      this.listLoading = true
      let data = {
        start_date: this.start.toISOString().split('T')[0],
        end_date: this.end.toISOString().split('T')[0]
      }
      axios.post(`/stock/out/report`, data).then(response => {
          console.log(response)
          this.list = response.data.stock
          response.data.stock.map((val) => {
            this.data = [['laporan', 'penjualan'], [val.name, val.substocktransaction_sum_total]]
          })

          // Just to simulate the time of the request
          setTimeout(() => {
              this.listLoading = false
          }, 1.5 * 1000)
      })
    },

    handleCurrency(number) {
            const idr = new Intl.NumberFormat('in-IN', {
                style: 'currency',
                currency: 'IDR'
            }).format(number)
            return idr
        },
  },

  data() {
    return {
      start : '',
      end : '',
      list : '',
      data: [['laporan', 'penjualan']],
      options: {
        width: 1100,
        height: 400
      }
    };
  }
};
</script>