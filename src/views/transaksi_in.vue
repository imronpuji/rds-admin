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
      <el-table-column label="Masuk Ke Kas" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.to.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Total" width="150px" align="center" sortable prop="cashin">
        <template slot-scope="{row}">
          <span>{{ handleCurrency(row.cashin) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Keterangan" width="150px" align="center" sortable prop="cashin">
        <template slot-scope="{row}">
          <span>{{ row.desc }}</span>
        </template>
      </el-table-column>
       <el-table-column label="Date" width="150px" align="center" sortable prop="date">
        <template slot-scope="{row}" >
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
           <el-button type="primary" size="mini" @click="handleDelete(row, $index)">
            Delete
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger">
            <router-link :to="'/kas/detail/' + row.id">Detail</router-link>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="180px" style="width: 520px; margin-left:50px;">
        <el-form-item label="Masuk Ke Kas">
          <el-select v-model="to_item" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
            <el-option v-for="item in cash" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Keterangan">
            <el-input v-model="keterangan" placeholder="Keterangan" />
        </el-form-item>

        <!-- multiple input -->
        <div v-for="(all, index) in kasIn.all" style="padding:0px; margin:0px; border-radius:4px;">
          <el-form-item label="Sebagai Akun" style="border-left: 2px solid rgba(0,0,0,0.1); padding-left:4px">
            <el-select v-model="all.modal" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
              <el-option v-for="item in modal" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Desc">
            <el-input v-model="all.desc" required type="text" placeholder="Please input" />
          </el-form-item>
          <el-form-item label="Sub Total">
            <v-money-spinner v-model="all.total" v-bind="config" @change="onChangeTotal(value)"></v-money-spinner>
          </el-form-item>
        </div>
        <el-button type="primary" @click="addFind">
          Tambah Form
        </el-button>   
        <el-button v-if="kasIn.all.length > 1" type="primary" @click="deleteFind">
          Hapus Form
        </el-button>
        <h3 v-if="total_kasIn != ''"> Total : {{ handleCurrency(total_kasIn) }}</h3>
      </el-form>
      <!-- multiple input -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createData()">
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
      keterangan : '',
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
      axios.get('/cash/in').then(response => {
        console.log(response)
        this.list = response.data.cashtransaction
        this.total = response.data.cashtransaction.length

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      axios.get(`/akun/iscash`).then(response => {
        console.log(response)
        this.cash = response.data.akun
    }).catch(() => {
      this.listLoading = false
     this.$notify({
      title: 'Error',
      message: 'Server Error',
      type: 'warning',
      duration: 2000
      })})

      axios.get(`/akun/iscashin`).then(response => {
        console.log(response)
        this.modal = response.data.akun
      })
      .catch(() => {
        this.listLoading = false
           this.$notify({
            title: 'Error',
            message: 'Server Error',
            type: 'warning',
            duration: 2000
          })
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

      const desc = []
      const total = []
      const akun_id = []
      this.kasIn.all.map((val, index) => {
        desc.push(val.desc)
        total.push(parseInt(val.total))
        akun_id.push(val.modal)
      })
      const data = {
        to: this.to_item,
        keterangan : this.keterangan, 
        desc,
        akun_id,
        total
      }

      var encodedValues = qs.stringify(
        data,
        { allowDots: true }
      )
      console.log(encodedValues)
      axios.post('/cash/in/create', encodedValues)
        .then((response) => {
          this.getList()
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Created Successfully',
            type: 'success',
            duration: 2000
          })
          this.kasIn.all = [{ modal: '', desc: '', total: '' }]
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
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
           this.listLoading = true

   this.$confirm('Apakah anda serius mau menghapus ?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
    }).then(() => {
    axios.delete(`/cash/transaction/delete/${row.id}`)
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
