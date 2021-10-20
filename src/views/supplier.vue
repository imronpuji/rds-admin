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

    <el-table :key="tableKey" v-loading="listLoading" :data="list.filter(({name}) => !search || name.toLowerCase().includes(search.toLowerCase()))" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
        <el-table-column label="ID" prop="cashin" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
            <template slot-scope="{row}">
                <span>{{ row.id }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="cashin" sortable label="Nama" min-width="150px">
            <template slot-scope="{row}">
                <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
            </template>
        </el-table-column>
        <el-table-column label="No. Telepon" width="150px" align="center" sortable prop="cashin">
            <template slot-scope="{row}">
                <span>{{ row.contact }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Alamat" width="150px" align="center" sortable prop="date">
            <template slot-scope="{row}">
                <span>{{ row.address }}</span>
            </template>
        </el-table-column>
        <el-table-column label="deskripsi" width="150px" align="center" sortable prop="date">
            <template slot-scope="{row}">
                <span>{{ row.desc }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Tipe Kontak" width="150px" align="center" prop="cashin" sortable>
            <template slot-scope="{row}">
                <span>{{ row.type != null ? row.type.name : 'tipe belum disetting' }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Date" width="150px" align="center" sortable prop="date">
            <template slot-scope="{row}">
                <span>{{ row.created_at }}</span>
            </template>
        </el-table-column>

        </el-table-column>
        <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
                <el-button size="mini" type="primary" @click="handleUpdate(row)">
                    Edit
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form label-position="top" :inline="true" ref="dataForm" :rules="rules" :model="temp" label-width="180px" style="width: 100%; margin-left:50px;">
            <el-form-item class="k" label="Nama">
                <el-input v-model="name" placeholder="Nama" />
            </el-form-item>
            <el-form-item class="k" label="Alamat">
                <el-input v-model="address" placeholder="Alamat" />
            </el-form-item>
            <el-form-item class="k" label="No. Telepon">
                <el-input v-model="contact" placeholder="No. Telepon" type="number" />
            </el-form-item>
            <el-form-item class="k" label="Deskripsi">
                <el-input v-model="desc" placeholder="desc" />
            </el-form-item>
            <el-form-item class="k" label="Tipe Kontak">
                <el-select v-model="tipe">
                    <el-option v-for="item in kontak" :label="item.name" :value="item.id" />
                </el-select>
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
            <el-button :loading="loading" type="primary" @click="dialogPvVisible = false">Konfirmasi</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
import {
    fetchList,
    fetchPv,
    createArticle,
    updateArticle
} from '@/api/article'
import waves from '@/directive/waves' // waves directive
import {
    parseTime
} from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from '@/api/axios'
import qs from 'qs'

const calendarTypeOptions = [{
        key: 'cash',
        display_name: 'cash'
    },
    {
        key: 'modal',
        display_name: 'modal'
    }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
    acc[cur.key] = cur.display_name
    return acc
}, {})

export default {
    name: 'ComplexTable',
    components: {
        Pagination
    },
    directives: {
        waves
    },
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
            search: '',
            category: '',
            tipe: '',
            keterangan: '',
            name: '',
            selling_price: '',
            address: '',
            contact: '',
            desc: '',
            from: '',
            to_item: '',
            total_kasIn: '',
            pemasukan: '',
            kasIn: {
                all: [{
                    modal: '',
                    total: '',
                    desc: ''
                }]
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
            sortOptions: [{
                label: 'ID Ascending',
                key: '+id'
            }, {
                label: 'ID Descending',
                key: '-id'
            }],
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
                create: 'Kontak'
            },
            dialogPvVisible: false,
            pvData: [],
            loading: false,
            rules: {
                type: [{
                    required: true,
                    message: 'type is required',
                    trigger: 'change'
                }],
                // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
                title: [{
                    required: true,
                    message: 'title is required',
                    trigger: 'blur'
                }]
            },
            downloadLoading: false,
            kontak: '',
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            axios.get('/contact').then(response => {
                this.list = response.data.contact.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                console.log(this.list)
                this.total = response.data.contact.length

                // Just to simulate the time of the request
                setTimeout(() => {
                    this.listLoading = false
                }, 1.5 * 1000)
            })

            axios.get('/contacttype').then((response) => this.kontak = response.data.contacttype)

        },
        handleCurrency(number) {
            const idr = new Intl.NumberFormat('in-IN', {
                style: 'currency',
                currency: 'IDR'
            }).format(number)
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
            const {
                prop,
                order
            } = data
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
                name: this.name,
                address: this.address,
                desc: this.desc,
                contact: this.contact,
                type: this.tipe,
            }
            this.loading = true

            axios.post('/contact/create', data)
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
            this.name = row.name
            this.tipe = row.type
            this.id = row.id
            this.address = row.address
            this.desc = row.desc
            this.contact = row.contact
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {
            this.listLoading = true
            const data = {
                name: this.name,
                address: this.address,
                desc: this.desc,
                contact: this.contact,
                type: this.tipe,
            }
            this.loading = true

            axios.put(`/contact/edit/${this.id}`, data)
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
            this.loading = true

            axios.delete(`/contact/delete/${row.id}`)
                .then((response) => {
                    this.listLoading = false
                    this.loading = false

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
                    this.loading = false

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
                const tHeader = ['id', 'Nama', 'Kontak', 'Alamat', 'Deskripsi', 'Tipe Kontak']
                const filterVal = ['id', 'name', 'contact', 'address', 'desc', 'type']
                const data = this.formatJson(filterVal)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: 'kontak'
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal) {
            return this.list.map(v => filterVal.map(j => {

                return v[j]
            }))
        },
        getSortClass: function (key) {
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
            this.kasIn.all.push({
                modal: '',
                desc: '',
                total: ''
            })

            console.log(this.kasIn, this.to_item, this.from)
        },
        onChangeTotal() {
            const total = this.kasIn.all.reduce(function (accumulator, item) {
                console.log(item.total)
                return accumulator + parseInt(item.total)
            }, 0)
            this.total_kasIn = total
        }

    }
}
</script>
