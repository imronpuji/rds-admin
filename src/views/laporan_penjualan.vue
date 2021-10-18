

<template>
  <div class="app-container">
    
    
    <GChart
      type="PieChart"
      :options="options"
      :data="data"
    />    
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
      <el-table-column label="Total Penjualan" min-width="150px">
        <template slot-scope="{row}">
          <span >{{ handleCurrency(row.substocktransaction_sum_total) }}</span>
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
      response.data.stock.map((val) => {
        this.data.push([val.name, val.substocktransaction_sum_total])
      })
      

    })
  },

  methods : {
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