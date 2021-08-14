<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
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
      <el-table-column label="Nama Barang" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="QTY" width="150px" align="center" sortable prop="cashin">
        <template slot-scope="{row}">
          <span>{{ row.qty }}</span>
        </template>
      </el-table-column>
       <el-table-column label="Harga Beli" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span>{{ handleCurrency(row.purchase_price) }}</span>
        </template>
      </el-table-column>
       <el-table-column label="Harga Jual" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span>{{ handleCurrency(row.selling_price) }}</span>
        </template>
      </el-table-column>
       <el-table-column label="Unit" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span>{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Jenis Barang" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span  v-if="row.producttype != null">{{ row.producttype.name }}</span>
        </template>
      </el-table-column>
       <el-table-column label="Date" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
    
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
           <el-button type="primary" size="mini" @click="handleDelete(row, $index)">
            Delete
          </el-button>
          <el-button size="mini" type="danger" @click="handleUpdate(row)">
            Edit
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="180px" style="width: 520px; margin-left:50px;">
        <el-form-item label="Nama Barang">
            <el-input v-model="name" placeholder="Nama Barang" />
        </el-form-item>
        <el-form-item label="Harga Beli">
            <v-money-spinner v-model="purchase_price" v-bind="config"></v-money-spinner>
        </el-form-item>
        <el-form-item label="Harga Jual">
          <v-money-spinner v-model="selling_price" v-bind="config" @change="onChangeTotal(value)"></v-money-spinner>
        </el-form-item>
        <el-form-item label="UNIT">
          <el-select v-model="unit">
            <el-option  label="m3" value="m3" />
            <el-option  label="pcs" value="pcs" />
          </el-select>
        </el-form-item>
        <el-form-item label="Jenis Barang">
          <el-select v-model="producttype" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
              <el-option v-for="item in jenis_barang" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
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
      category : '',
      producttype : '',
      jenis_barang : '',
      keterangan : '',
      name : '',
      selling_price : '',
      purchase_price : '',
      qty : '',
      unit : '',
      from: '',
      to_item: '',
      total_kasIn: '',
      pemasukan : '',
      kasIn: {
        all: [{ modal: '', total: '', desc: '' }]
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
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      axios.get('/product').then(response => {
        console.log(response)
        this.list = response.data.product
        this.total = response.data.product.length

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      axios.get('/producttype').then(response => {
       this.jenis_barang = response.data.producttype
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

      // const desc = []
      // const total = []
      // const akun_id = []
      // this.kasIn.all.map((val, index) => {
      //   desc.push(val.desc)
      //   total.push(parseInt(val.total))
      //   akun_id.push(val.modal)
      // })
      const data = {
        name : this.name,
        selling_price : this.selling_price,
        purchase_price : this.purchase_price,
        unit : this.unit,
        producttype : parseInt(this.producttype),
      }

      axios.post('/product/create', data)
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
      this.name = row.name
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
      const data = {
        name : this.name,
        selling_price : this.selling_price,
        purchase_price : this.purchase_price,
        unit : this.unit,
        producttype : this.producttype
      }

      axios.put(`/product/edit/${this.id}`, data)
        .then((response) => {
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
        .catch((err) => err)
    },
    handleDelete(row, index) {
            this.listLoading = true

   this.$confirm('Apakah anda serius mau menghapus ?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
    }).then(() => {
    axios.delete(`/product/delete/${row.id}`)
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
      this.kasIn.all.push({ modal: '', desc: '', total: '' })

      console.log(this.kasIn, this.to_item, this.from)
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
