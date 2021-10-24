<template>
<div class="app-container" style="width:100%; box-shadow:2">

    <el-date-picker style="margin-left:20px; width:140px" width="140px" v-model="start" class="filter-item" type="date" placeholder="Dari">
        </el-date-picker>
    <el-date-picker style="margin-left:8px;width:140px;"  v-model="end" class="filter-item" type="date" placeholder="Sampai">
    </el-date-picker>
    <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleFilterByDate">
        Filter
    </el-button>

    <el-tree :data="listHarta" default-expand-all node-key="id" ref="tree" highlight-current :props="defaultProps">
        <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{data.name}}</span>
            <span v-if='data.valueTotal != 0'>{{ handleCurrency(data.valueTotal)  }}</span>
            <span v-else>{{ handleCurrency(data.total)  }}</span>
        </span>
    </el-tree>

    <div style="display:flex; justify-content:space-between; background:yellow; margin-bottom:12px">
        <h4 style="padding:0; margin:0">Total Harta</h4>
        <p style="padding:0; margin:0">{{handleCurrency(harta.valueTotal)}}</p>
    </div>

    <el-tree :data="listModal" default-expand-all node-key="id" ref="tree" highlight-current :props="defaultProps">
        <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{data.name}}</span>
            <span v-if='data.valueTotal != 0'>{{ handleCurrency(data.valueTotal)  }}</span>
            <span v-else>{{ handleCurrency(data.total)  }}</span>
        </span>
    </el-tree>

    <el-tree :data="listKewajiban" default-expand-all node-key="id" ref="tree" highlight-current :props="defaultProps">
        <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{data.name}}</span>
            <span v-if='data.valueTotal != 0'>{{ handleCurrency(data.valueTotal)  }}</span>
            <span v-else>{{ handleCurrency(data.total)  }}</span>
        </span>
    </el-tree>

    <div style="display:flex; justify-content:space-between; background:yellow">
        <h4 style="padding:0; margin:0">Modal & Kewajiban</h4>
        <p style="padding:0; margin:0">{{handleCurrency(modal.valueTotal + kewajiban.valueTotal)}}</p>
    </div>

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
            defaultProps: {
                children: 'children',
                label: 'name',
                total: 'total'
            },
            labaTahunBerjalan : '',
            start : '',
            end: '',
            biaya: '',
            listBiaya: '',
            HPP: '',
            listHPP: '',
            pendapatan: '',
            listPendapatan: '',
            modal: '',
            biaya: '',
            kewajiban: '',
            listModal: [],
            listKewajiban: [],
            listHarta: [],
            from: '',
            harta: '',
            to_item: '',
            total_kasIn: '',
            keterangan: '',
            total_transfer: '',
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
                desc: '',
                date: '',
                timestamp: new Date(),
                from: '',
                to: '',
                chasin: ''
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
            downloadLoading: false
        }
    },
    async created() {
        await this.getLaba()
        await this.getList()
    },
    methods: {
        async getLaba() {
            this.listLoading = true

            await axios.post('/report/neraca/Pendapatan').then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listPendapatan = [names]
                this.pendapatan = names
            });

            await axios.post('/report/neraca/HPP').then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (parseInt(a.total) || 0) + (parseInt(a.valueTotal) || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listHPP = [names]
                this.HPP = names
            });

            await axios.post('/report/neraca/Biaya').then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (parseInt(a.total) || 0) + (parseInt(a.valueTotal) || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listBiaya = [names]
                this.biaya = names
            });
            const setLaba = await this.pendapatan.valueTotal - this.HPP.valueTotal - this.biaya.valueTotal
            this.labaTahunBerjalan = setLaba
            console.log(setLaba)
        },

        async getLabaWhenFilter() {
            this.listLoading = true
            const data = {
                start_date : this.start,
                end_date : this.end
            }
            await axios.post('/report/neraca/Pendapatan', data).then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listPendapatan = [names]
                this.pendapatan = names
            });

            await axios.post('/report/neraca/HPP', data).then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listHPP = [names]
                this.HPP = names
            });

            await axios.post('/report/neraca/Biaya', data).then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (parseInt(a.total) || 0) + (parseInt(a.valueTotal) || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listBiaya = [names]
                this.biaya = names
            });
            const setLaba = await this.pendapatan.valueTotal - this.HPP.valueTotal - this.biaya.valueTotal
            this.labaTahunBerjalan = setLaba
            console.log(setLaba)
        },
        async getList() {
            this.listLoading = true

            await axios.get('/report/neraca/Harta').then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listHarta = [names]
                this.harta = names
            });

            await axios.get('/report/neraca/Modal').then((response) => {

                function calculateValues(o, lbt) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a, lbt);
                        
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);

                    if(o.name == 'Laba Tahun Berjalan'){
                        o.total = lbt
                    }
                }
                let names = response.data.akun[0]
                calculateValues(names, this.labaTahunBerjalan)
                this.listModal = [names]
                this.modal = names
            });

            await axios.get('/report/neraca/Kewajiban').then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listKewajiban = [names]
                this.kewajiban = names
            });

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

            const desc = []
            const total = []
            const akun_id = []
            this.kasIn.all.map((val, index) => {
                desc.push(val.desc)
                total.push(parseInt(val.total))
                akun_id.push(val.modal)
            })
            const data = {
                from: this.from,
                to: this.to_item,
                desc: this.keterangan,
                total: this.total_transfer
            }

            var encodedValues = qs.stringify(
                data, {
                    allowDots: true
                }
            )
            console.log(encodedValues)
            axios.post('/cash/transfer/create', encodedValues)
                .then((response) => {
                    this.getList()
                    this.dialogFormVisible = false
                    this.$notify({
                        title: 'Success',
                        message: 'Created Successfully',
                        type: 'success',
                        duration: 2000
                    })
                    this.kasIn.all = [{
                        modal: '',
                        desc: '',
                        total: ''
                    }]
                })
                .catch((err) => err)
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
            axios.delete(`/cash/transaction/delete/${row.id}`)
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



        async handleFilterByDate(){
            let data = {
                start_date : this.start,
                end_date : this.end,
            }
            
            this.listLoading = true
            await this.getLabaWhenFilter();

            await axios.post('/report/neraca/Harta', data).then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listHarta = [names]
                this.harta = names
            });

            await axios.post('/report/neraca/Modal', data).then((response) => {

                function calculateValues(o, lbt) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a, lbt);
                        
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);

                    if(o.name == 'Laba Tahun Berjalan'){
                        o.total = lbt
                    }
                }
                let names = response.data.akun[0]
                calculateValues(names, this.labaTahunBerjalan)
                this.listModal = [names]
                this.modal = names
            });

            await axios.post('/report/neraca/Kewajiban', data).then((response) => {
                console.log(response)

                function calculateValues(o) {
                    o.valueTotal = (o.children || []).reduce(function (r, a) {
                        calculateValues(a);
                        return r + (a.total || 0) + (a.valueTotal || 0);
                    }, 0);
                }
                let names = response.data.akun[0]
                calculateValues(names)
                this.listKewajiban = [names]
                this.kewajiban = names
            });
            
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

<style>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>
