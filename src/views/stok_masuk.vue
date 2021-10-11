<template>
  <div class="app-container">
    <div class="filter-container">
        <el-input v-model="search" placeholder="Cari" style="width: 200px;" class="filter-item" />

      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Tambah
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table
    :key="tableKey"
    v-loading="listLoading"
    :data="list.filter(({contact}) => !search || contact.name.toLowerCase().includes(search.toLowerCase()))"
    border
    fit
    highlight-current-row
    style="width: 100%;"
    @sort-change="sortChange"
    >
    <el-table-column sortable label="ID" prop="cashin" align="center" width="80" >
      <template slot-scope="{row}">
        <span>{{ row.id }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Supplier" min-width="150px" sortable>
      <template slot-scope="{row}">
        <span class="link-type" @click="handleUpdate(row)">{{ row.contact.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Pembayaran" width="150px" align="center" sortable prop="cashin">
      <template slot-scope="{row}">
        <span>{{ handleCurrency(row.total) }}</span>
      </template>
    </el-table-column>
      <el-table-column label="Staff" width="150px" align="center" sortable prop="cashin">
      <template slot-scope="{row}">
        <span>{{ row.staff }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Date" width="150px" align="center" sortable prop="cashin">
      <template slot-scope="{row}">
        <span>{{ row.date }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
      <template slot-scope="{row,$index}">
       <el-button type="danger" size="mini" @click="handleDelete(row, $index)">
        Delete
      </el-button>
      <el-button size="mini" type="primary">
        <router-link :to="'/stok/masuk/detail/' + row.id">Detail</router-link>
      </el-button>
    </template>
  </el-table-column>
</el-table>

<pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
    <el-form label-position="top"
:inline="true" ref="dataForm" :rules="rules" :model="temp" label-width="180px" style="width: 100%; margin-left:50px;">
     <el-form-item class="k" label="Supplier">
      <el-select filterable v-model="contact_id" required class="filter-item" placeholder="Please select">
        <el-option v-for="item in kontak" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item class="k" label="Bayar Dengan">
      <el-select v-model="cashout_id" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
        <el-option v-for="item in kas" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item class="k" label="Tgl Transaksi">
      <el-date-picker
        v-model="dates"
        type="date"
        placeholder="Tanggal Transaksi">
      </el-date-picker>
    </el-form-item>
    <div v-for="(all, index) in kasIn.all" style="width:100%; padding-left:4px; display:flex; flex-wrap:wrap">
      <el-form-item class="k" label="Barang">
        <el-select v-model="all.product_id" filterable placeholder="Select" @change="onChangeProduct(index)">
          <el-option
          v-for="item in product"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item class="k" label="Jumlah Barang">
      <el-input v-model="all.qty" :value="all.qty" required type="text" placeholder="Jumlah Barang" @change="onChangeQty(index)" />
    </el-form-item>
    <el-form-item class="k" label="Harga Satuan">
        <v-money-spinner v-bind="config" v-model="all.harga" required type="text" placeholder="Harga Satuan" @change="onChangeQty(index)"></v-money-spinner>
      </el-form-item>
      <el-form-item class="k" label="Sub Total">
        <v-money-spinner v-bind="config" disabled v-model="all.total" type="numeric" min="0.01" step="0.01" max="2500" placeholder="Please input" @change="onChangeTotal()" ></v-money-spinner>
      </el-form-item>
    </el-form-item>
  </div>


  <h3 v-if="total_kasIn != ''"> Total : {{ handleCurrency(total_kasIn) }}</h3>
</el-form>

<div slot="footer" class="dialog-footer" style="display:flex; flex-wrap:wrap; justify-content:center">
    <el-button style="margin:20px 10px" type="primary" @click="addFind">
    Tambah Produk
  </el-button>   
  <el-button style="margin:20px 10px" v-if="kasIn.all.length > 1" type="primary" @click="deleteFind">
    Hapus Produk
  </el-button>
  <el-button style="margin:20px 10px" @click="dialogFormVisible = false">
    Cancel
  </el-button>
  <el-button style="margin:20px 10px" :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">
    Simpan
  </el-button>
</div>
</el-dialog>

<el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
  <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
    <el-table-column prop="key" label="Channel" />
    <el-table-column prop="pv" label="Pv" />
  </el-table>
  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from '@/api/axios'
import qs from 'qs'
import { mapGetters } from 'vuex'

const calendarTypeOptions = [
{ key: 'cash', display_name: 'cash' },
{ key: 'modal', display_name: 'modal' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
     computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },

  data() {
    return {
      dates : '',
      category : '',
      kontak : [],
      kas :[],
      search : '',
      product :[],
      contact_id :"",
      cashout_id:"",
      satuan : '',
      producttype : '',
      jenis_barang : '',
      keterangan : '',
      selling_price : '',
      purchase_price : '',
      qty : '',
      unit : '',
      from: '',
      to_item: '',
      total_kasIn: '',
      pemasukan : '',
       config: {
        spinner: false,
        step: 10,
        prefix: "Rp ",
        precision: 0,
        decimal: ',',
        thousands: '.',
        bootstrap: true,
        amend: false,
        masked: false,
      },
      kasIn: {
        all: [{product_id: '', total: '', qty: '', harga: '' }]
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      cash: [],
      modal: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        code: '',
        date: '',
        timestamp: new Date(),
        title: '',
        to: '',
        chasin: '',
        total: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      loading : false,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      axios.get('/stock/in').then(response => {
        console.log(response)
        this.list = response.data.stocktransaction.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)) 
        this.total = response.data.stocktransaction.length

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      axios.get('/akun/iscash').then(response => {
      	console.log(response)
       this.kas = response.data.akun
     })

      axios.get('/contact').then(response => {
       console.log(response)
       this.kontak = response.data.contact.filter((val) => val.type == 'supplier')
     })

      axios.get('/product').then(response => {
      	console.log(response)
       this.product = response.data.product
     })
    },
    handleCurrency(number){
     const idr = new Intl.NumberFormat('in-IN', { style: 'currency', currency: 'IDR' }).format(number)
     return idr
   },
   handleFilter() {
    this.listQuery.page = 1
    this.getList()
  },
  handleModifyStatus(row, status) {
    this.$message({
      message: '操作Success',
      type: 'success'
    })
    row.status = status
  },
  sortChange(data) {
    const { prop, order } = data
    if (prop === 'id') {
      this.sortByID(order)
    }
  },
  sortByID(order) {
    if (order === 'ascending') {
      this.listQuery.sort = '+id'
    } else {
      this.listQuery.sort = '-id'
    }
    this.handleFilter()
  },
  resetTemp() {
    this.temp = {
      id: undefined,
      importance: 1,
      remark: '',
      timestamp: new Date(),
      title: '',
      status: 'published',
      type: ''
    }
  },
  handleCreate() {
    this.resetTemp()
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
    this.$nextTick(() => {
      this.$refs['dataForm'].clearValidate()
    })
    this.kasIn.all = [{product_id: '', total: '', qty: '', harga: '' }]
    this.total_kasIn = ''
  },
  createData() {
    this.loading = true
    const total = []
    const qty = []
    const product_id = []
    const purchase_price = []
    this.kasIn.all.map((val, index) => {
      qty.push(val.qty)
      total.push(parseInt(val.total))
      purchase_price.push(parseInt(val.harga))
      product_id.push(val.product_id)
    })
    const data = {
     contact_id : this.contact_id,
     cashout_id : this.cashout_id,
     product_id,
     qty,
     total,
     purchase_price, 
     date : this.dates,
     staff : this.name
   }
   console.log(data)
   var encodedValues = qs.stringify(
    data,
    { allowDots: true }
    )
   axios.post('/stock/in/create', encodedValues)
   .then((response) => {
    this.loading = false

    this.getList()
    this.dialogFormVisible = false
    this.$notify({
      title: 'Success',
      message: 'Created Successfully',
      type: 'success',
      duration: 2000
    })
  })
   .catch((err) => {
    this.loading = false

    this.listLoading = false
    this.$notify({
      title: 'Error',
      message: 'Server Error',
      type: 'warning',
      duration: 2000
    })
  })
      // }
      // })
    },
    handleUpdate(row) {
      this.name = row.cashout.name
      this.id = row.id
      this.selling_price = row.selling_price
      this.purchase_price = row.purchase_price
      this.unit = row.unit
      this.producttype = row.producttype.id == '' ? row.producttype : row.producttype.id
      this.qty = row.qty
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
     this.listLoading = true
     this.loading = true
     const data = {
      name : this.name,
      selling_price : this.selling_price,
      purchase_price : this.purchase_price,
      unit : this.unit,
      producttype : this.producttype
    }

    axios.put(`/product/edit/${this.id}`, data)
    .then((response) => {
    this.loading = false

      this.getList()
      this.dialogFormVisible = false
      this.$notify({
        title: 'Success',
        message: 'Update Successfully',
        type: 'success',
        duration: 2000
      })
      throw new Error('Something went badly wrong!')
    })
    .catch((err) => {
    this.loading = false

    })
  },
  handleDelete(row, index) {
    this.listLoading = true

    this.$confirm('Apakah anda serius mau menghapus ?', 'Warning', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      axios.delete(`/stock/transaction/delete/${row.id}`)
      .then((response) => {
        this.listLoading = false

        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
      .catch((err) => {
        this.listLoading = false
        this.$notify({
          title: 'Error',
          message: 'Server Error',
          type: 'warning',
          duration: 2000
        })
      })
    }).catch(() => {
      this.listLoading = false
      this.$message({
        type: 'info',
        message: 'Delete canceled'
      });          
    });

  },
  handleFetchPv(pv) {
    fetchPv(pv).then(response => {
      this.pvData = response.data.pvData
      this.dialogPvVisible = true
    })
  },
  handleDownload() {
    this.downloadLoading = true
    import('@/vendor/Export2Excel').then(excel => {
      const tHeader = ['id','supplier', 'pembayaran', 'staff', 'date']
      const filterVal = ['id','name', 'total', 'staff', 'created_at']
      const data = this.formatJson(filterVal)
      excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: 'pembelian'
      })
      this.downloadLoading = false
    })
  },
  formatJson(filterVal) {
    return this.list.map(v => filterVal.map(j => {
      v['name'] = v.contact.name
      return v[j]
    }))
  },
  getSortClass: function(key) {
    const sort = this.listQuery.sort
    return sort === `+${key}` ? 'ascending' : 'descending'
  },
  onChangeCash(event) {
    console.log(event)
  },
  onChangeModal(event) {
    console.log(event)
  },
  addFind() {
    console.log(this.kasIn.all)
    this.kasIn.all.push({product_id: '', total: '', qty: '', harga: '' })
  },
  deleteFind() {
    this.kasIn.all.pop();
  },
  onChangeTotal() {
    const total = this.kasIn.all.reduce(function(accumulator, item) {
      console.log(item.total)
      return accumulator + parseInt(item.total)
    }, 0)
    this.total_kasIn = total
  },
  onChangeProduct(index){
   const produk = this.product.filter((val) => {
    if(val.id == this.kasIn.all[index]['product_id']) {
     return val
   }
 })	
   this.kasIn.all[index]['qty'] = 0;
   this.kasIn.all[index]['harga'] = produk[0]['purchase_price']
   this.kasIn.all[index]['total'] = 0;
   // parseInt(produk[0]['purchase_price']) > 0 && parseInt(produk[0]['qty']) > 0 ? parseInt(produk[0]['purchase_price']) *  parseInt(produk[0]['qty']) : 0
 }, 
 onChangeQty(index){

  let qty = parseFloat(
        this.kasIn.all[index]['qty'].replace(/,/g, ".")
  ).toFixed(2);
  this.kasIn.all[index]['qty'] = parseFloat(
        this.kasIn.all[index]['qty'].replace(/,/g, ".")
  ).toFixed(2)
   const result = qty * parseInt(this.kasIn.all[index]['harga'])
   this.kasIn.all[index]['total'] = result
   const total = this.kasIn.all.reduce(function(accumulator, item) {
    console.log(item.total)
    return accumulator + parseInt(item.total)
  }, 0)
   this.total_kasIn = total
 }

}
}
</script>
