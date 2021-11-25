

<template>
  <div class="app-container">
    <div class="filter-container">
        <el-input placeholder="Cari" style="width: 200px; margin-right:10px" class="filter-item" />

        <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
            Tambah
        </el-button>
        <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
            Export
        </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :default-sort = "{prop: 'date', order: 'descending', prop:'cashin'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Nama" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.user.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Produk" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.product == null ? 'produk sudah dihapu' : row.product.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Domain" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.dns }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Lisensi" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.licence }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Date" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.due }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleReload(row)">
            Reload
          </el-button>
           <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button :loading="loading" type="danger" size="mini" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top" label-width="150px" >
        <el-form-item label="Produk">
        <el-select v-model="product_id" >
          <el-option v-for="product in products" :value="product.id" :label="product.name">{{product.name}}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Pembeli">
        <el-select v-model="user_id" >
          <el-option v-for="user in users" :value="user.id" :label="user.name">{{user.name}}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="domain">
        <el-input v-model="dns" placeholder="Domain" />
      </el-form-item>
      <el-form-item label="Due">
        <el-date-picker  v-model="due" class="filter-item" type="date" placeholder="Due">
        </el-date-picker>
      </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
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
import {
    mapGetters
} from 'vuex'
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
  data() {
    return {
      due : '',
      dns : '',
      code : '',
      products : [],
      user_id : '',
      product_id : '',
      roles : '',
      role_akun : [],
      users : [],
      name : '',
      desc : '',
      loading : false,
      unit : '',
      from: '',
      to_item: '',
      email : '',
      total_kasIn: '',
      pengeluaran : '',
      keterangan : '',
      kasIn: {
        all: [{ biaya: '', total: '', desc: '' }]
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
      biaya: [],
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
        create: 'Satuan'
      },
      satuan : '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },

   computed: {
    ...mapGetters([
      'token'
    ])
  },  
  methods: {
    getList() {
      this.listLoading = true
      axios.get('/licence').then(response => {
        console.log(response)
        this.list = response.data.licence.data
        this.total = response.data.licence.data.length
          this.listLoading = false
      })
      axios.get('/product', {
       headers: {
        Authorization: `Bearer ${this.token}` 
      }
     }).then(response => {

        this.products = response.data.product.data
      })

      axios.get('/user', {
       headers: {
        Authorization: `Bearer ${this.token}` 
      }
     }).then(response => {

        this.users = response.data.user.data
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
    },
    createData() {
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
      //     this.temp.author = 'vue-element-admin'
      //     createArticle(this.temp).then(() => {
      //

      const data = {
       user_id : this.user_id,
       due : this.due,
       product_id : this.product_id,
       dns : this.dns

      }

      axios.post('/licence', data)
        .then((response) => {
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
          this.listLoading = false
           this.$notify({
              title: 'Gagal',
              message: 'Anda Belum Melengkapi Data',
              type: 'warning',
              duration: 2000
            })
        })
      // }
      // })
    },
    handleUpdate(row) {
      this.id = row.id
      this.user_id = row.user_id
      this.product_id = row.product_id
      this.due = row.due
      this.dns = row.dns
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleReload(row){
      this.listLoading = true
        await axios.put('/licence/reload/'+row.id)
            this.$notify({
            title: 'Success',
            message: 'Reload Successfully',
            type: 'success',
            duration: 2000
          })
        this.getList()
      this.listLoading = false
    },
    updateData() {
      this.listLoading = true
      const data = {
       user_id : this.user_id,
       due : this.due,
       product_id : this.product_id,
       dns : this.dns,
      }
      console.log(data)
      axios.put(`/licence/${this.id}`, data)
        .then((response) => {
          this.getList()
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Update Successfully',
            type: 'success',
            duration: 2000
          })
        })
        .catch((err) => err)
    },
    handleDelete(row, index) {
      
      this.listLoading = true
      axios.delete(`/licence/${row.id}`)
        .then((response) => {
          this.listLoading = false
          console.log(response)
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
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
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
      this.kasIn.all.push({ biaya: '', desc: '', total: '' })
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
    }

  }
}
</script>
