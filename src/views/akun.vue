<template>
    <div class="app-container">
        <div class="filter-container">
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
                Add
            </el-button>
        </div>
        <el-tree :data="list" :props="defaultProps">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span style="margin-left:20px">
                    <el-button type="text" size="mini" @click="() => handleDelete(data, data)">
                        Delete
                    </el-button>
                    <el-button type="text" size="mini" @click="() => handleUpdate(data, data)">
                        Edit
                    </el-button>
                </span>
            </span>
        </el-tree>

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
                <el-form-item label="Kategori" props="category">
                    <el-select v-model="category" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
                        <el-option label="Kosong" value="" />
                        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Nama">
                    <el-input placeholder="Nama" v-model="name" />
                </el-form-item>
                <el-form-item v-if="kas != true && isCashOut != true && isCashIn != true">
                    <el-checkbox v-model="header">Header</el-checkbox>
                </el-form-item>
                <el-form-item v-if="header != true && isCashOut != true && isCashIn != true">
                    <el-checkbox v-model="kas">Bank / Kas</el-checkbox>
                </el-form-item>
                <el-form-item v-if="kas != true && header != true && isCashIn != true">
                    <el-checkbox v-model="isCashOut">Kas Keluar</el-checkbox>
                </el-form-item>
                <el-form-item v-if="kas != true && header != true && isCashOut != true">
                    <el-checkbox v-model="isCashIn">Kas Masuk</el-checkbox>
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
import 
{
    fetchList,
    fetchPv,
    createArticle,
    updateArticle
}   from '@/api/article'

    import waves from '@/directive/waves' // waves directive
    import 
    {
        parseTime
    } from '@/utils'
    import Pagination from '@/components/Pagination' // secondary package based on el-pagination
    import axios from '@/api/axios'
    import qs from 'qs'

    const calendarTypeOptions = []

    const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
        acc[cur.key] = cur.display_name
        return acc
    }, {})

    export default {
        name: 'ComplexTable',
        components: 
        {
            Pagination
        },
        
        directives: 
        {
            waves
        },
        
        filters: 
        {
            statusFilter(status) 
            {
                const statusMap = 
                {
                    published: 'success',
                    draft: 'info',
                    deleted: 'danger'
                }
                return statusMap[status]
            },
            typeFilter(type) 
            {
                return calendarTypeKeyValue[type]
            }
        },
        
        data() {
            return {
                defaultProps: 
                {
                    children: 'children',
                    label: 'name'
                },
                
                id: '',
                category: '',
                isCashOut : '',
                isCashIn : '',
                header: '',
                fullscreenLoading: false,
                name: '',
                desc: '',
                tableKey: 0,
                list: null,
                total: 0,
                kas: '',
                listLoading: true,
                
                listQuery: 
                {
                    page: 1,
                    limit: 20,
                    importance: undefined,
                    title: undefined,
                    type: undefined,
                    sort: '+id'
                },
                importanceOptions: [1, 2, 3],
                calendarTypeOptions,
                categories: [],
                modal: [],

                sortOptions: 
                [
                {
                    label: 'ID Ascending',
                    key: '+id'
                }, 
                {
                    label: 'ID Descending',
                    key: '-id'
                }
                ],
                
                statusOptions: ['published', 'draft', 'deleted'],
                showReviewer: false,
                temp: 
                {
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
                
                textMap: 
                {
                    update: 'Edit',
                    create: 'Create'
                },

                dialogPvVisible: false,
                pvData: [],
                
                rules: 
                {
                    type: 
                    [
                    {
                        required: true,
                        message: 'type is required',
                        trigger: 'change'
                    }
                    ],
                // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
                title: 
                [
                {
                    required: true,
                    message: 'title is required',
                    trigger: 'blur'
                }
                ]
            },
            downloadLoading: false
        }
    },

    created() {
        this.getList()
    },

    methods: {

        load(tree, treeNode, resolve) {
            setTimeout(() => {
                resolve(this.list)
            }, 1000)
        },

        getList() {

            this.listLoading = true
            axios.get('/akun').then(response => 
            {
                console.log(response)
                this.list = response.data.akun
                this.total = response.data.akun.length
                this.listLoading = false
            })

            axios.get('/akun/isheader').then(response => 
            {
                this.categories = response.data.akun
                this.listLoading = false
            })

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
            const data = {
                name: this.name,
                perent_id: this.category,
                iscash: this.kas == '' ? false : this.kas,
                iscashout: this.isCashOut == '' ? false : this.isCashOut,
                iscashin: this.isCashIn == '' ? false : this.isCashIn,
                isheader: this.header == '' ? false : this.header
            }
            console.log(data)
            this.listLoading = true;
            this.dialogFormVisible = false

            axios.post('/akun/create', data)
            .then((response) => 
            {
                this.getList()
                this.dialogFormVisible = false
                this.$notify({
                    title: 'Success',
                    message: 'Created Successfully',
                    type: 'success',
                    duration: 2000
                })
            })
            .catch((err) => err)

        },
        handleUpdate(row) {
            this.id = row.id
            this.name = row.name // copy obj
            this.header = row.header
            this.kas = row.iscash == 1 ? true : false
            this.isCashOut = row.iscashout == 1 ? true : false
            this.isCashIn = row.iscashin == 1 ? true : false
            this.category = row.perent_id
            this.header = row.isheader == 1 ? true : false
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {

            this.dialogFormVisible = false
            this.listLoading = true
            const data = {
                name: this.name,
                perent_id: this.category,
                iscash: this.kas,
                iscashout: this.isCashOut,
                iscashin: this.isCashIn,
                isheader: this.header

            }
            console.log(data)
            axios.put(`/akun/edit/${this.id}`, data)
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
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            axios.delete(`/akun/delete/${row.id}`)
            .then((response) => {
                this.getList()
                loading.close();
                console.log(response)
                this.$notify({
                    title: 'Success',
                    message: 'Delete Successfully',
                    type: 'success',
                    duration: 2000
                })

            })
            .catch((err) => err)
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

            console.log(this.kasIn, this.category, this.from)
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
