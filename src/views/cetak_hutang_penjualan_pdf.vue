<template>
<div class="app-container">
    <div class="filter-container" style="background:yellow; display:flex; align-items:center; justify-content:center" >
        <h4>TOTAL HUTANG BEREDAR : {{handleCurrency(total_hutang)}}</h4>
    </div>
    <br>
        <br>
        <br>
    <el-table :key="tableKey" v-loading="listLoading" :data="list.filter(({contact}) => !search || contact.name.toLowerCase().includes(search.toLowerCase()))" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
        <el-table-column  prop="cashin" label="ID" align="center" width="80">
            <template slot-scope="{row}">
                <span>{{ row.id }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Customer" min-width="150px">
            <template slot-scope="{row}">
                <span v-if="row.contact != null" class="link-type" @click="handleUpdate(row)">{{ row.contact.name }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Total Tagihan" width="150px">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.total) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Piutang" width="150px">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.total - row.paid) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Jatuh Tempo" width="150px">
            <template slot-scope="{row}">
                <span>{{ row.payment_due }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Jumlah Bayar" width="150px">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.paid) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Potongan" width="150px">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.discount) }}</span>
            </template>
        </el-table-column>
        <el-table-column width="150px" align="center" prop="date" label="Date">
            <template slot-scope="{row}">
                <span>{{ row.date }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Staff" width="150px" align="center">
            <template slot-scope="{row}">
                <span>{{ row.staff }}</span>
            </template>
        </el-table-column>
    </el-table>
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
import checkPermission from '@/utils/permission' // 权限判断函数
import {
    mapGetters
} from 'vuex'

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
    computed: {
        ...mapGetters([
            'name',
            'avatar',
            'roles'
        ]),

    },

    data() {
        return {
            total_hutang : 0,
            start: '',
            end: '',
            dates: '',
            discount : 0,
            jatuh_tempo: '',
            qty_before: '',
            index_before: '',
            Pembayaran_sebelum: '',
            jumlah_bayar: 0,
            kurang_bayar: '',
            sisa_bayar: '',
            kembalian: '',
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
            category: '',
            kontak: [],
            kas: [],
            search: '',
            product: [],
            contact_id: "",
            cashout_id: "",
            satuan: '',
            producttype: '',
            hutang: '',
            jenis_barang: '',
            keterangan: '',
            selling_price: '',
            purchase_price: '',
            qty: '',
            unit: '',
            from: '',
            to_item: '',
            total_kasIn: '',
            pemasukan: '',
            kasIn: {
                all: [{
                    product_id: '',
                    total: '',
                    qty: '',
                    harga: 0
                }]
            },
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            loading: false,
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
            downloadLoading: false,
        }
    },
    async created() {
        await this.getList()
        await print()
        let DD = new Date().getDate()
        let MM = new Date().getMonth() + 1
        let YYYY = new Date().getFullYear()
        this.jatuh_tempo = `${YYYY}-${MM}-${DD}`
        this.dates = `${YYYY}-${MM}-${DD}`

    },
    methods: {
        checkPermission,

        handleChangeText(i) {
            this.onChangeQty(this.index_before)
            this.onChangeQty
            if (this.dialogStatus == 'create') {

                if (this.jumlah_bayar > this.total_kasIn) {
                    this.sisa_bayar = (this.jumlah_bayar + this.discount) - this.total_kasIn 
                    this.kurang_bayar = ''

                } else {
                    this.kurang_bayar = this.total_kasIn - (this.jumlah_bayar + this.discount)
                    this.sisa_bayar = ''

                }
            } else {
                this.kurang_bayar = this.total_kasIn - (this.jumlah_bayar + this.Pembayaran_sebelum)
            }
        },
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
        deleteFormProdukByIndex(i){
            this.kasIn.all = this.kasIn.all.filter((val, index) => {
                if(i != index){
                    return val;
                }
            })

        },
        async getList() {
            this.listLoading = true
            await axios.get('/stock/out').then(async response => {

                console.log(response)
                let total_hutang = 0
                this.list = await response.data.stocktransaction.filter((val, i) => {
                    if(val.total > val.paid){
                        total_hutang += (val.total - val.paid)
                        this.total_hutang = total_hutang

                        return val;
                    }
                    
                })
                this.total = response.data.stocktransaction.length

                // Just to simulate the time of the request
                setTimeout(() => {
                    this.listLoading = false
                }, 1.5 * 1000)
            })
            axios.get('/akun/iscash').then(response => {
                if (this.roles == 'kasir') {
                    this.kas = response.data.akun.filter((val) => val.name == "Kas Besar")
                } else {
                    this.kas = response.data.akun

                }
            })

            axios.get('/contact/customer').then(response => {
                console.log(response.data);
                this.kontak = response.data.contact
            })

            axios.get('/product').then(response => {

                this.product = response.data.product.filter((val) => {
                    if (val.qty > 0) {
                        return val
                    }
                })
            })
        },
        async print() {
            await window.print()
            await this.$router.push('/laporan/piutang/beredar')
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
        confirm() {
            alert('kkj')
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
            this.kasIn.all = [{
                product_id: '',
                total: '',
                qty: '',
                harga: 0
            }]
            this.kurang_bayar = ''
            this.sisa_bayar = ''
            this.jumlah_bayar = 0
            this.index_before = ''
            this.total_kasIn = ''
        },
        createData() {
            // this.$refs['dataForm'].validate((valid) => {
            //   if (valid) {
            //     this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
            //     this.temp.author = 'vue-element-admin'
            //     createArticle(this.temp).then(() => {
            //
            this.loading = true

            const total = []
            const qty = []
            const product_id = []
            this.kasIn.all.map((val, index) => {
                qty.push(val.qty)
                total.push(parseInt(val.total))
                product_id.push(val.product_id)
            })
            const data = {
                contact_id: this.contact_id,
                cashin_id: this.cashout_id,
                product_id,
                qty,
                date: this.dates,
                total,
                payment_due: this.jatuh_tempo,
                paid: this.jumlah_bayar > this.total_kasIn ? this.total_kasIn : this.jumlah_bayar,
                staff: this.name
            }
            var encodedValues = qs.stringify(
                data, {
                    allowDots: true
                }
            )

            axios.post('/stock/out/create', encodedValues)
                .then((response) => {
                    this.getList()
                    this.dialogFormVisible = false
                    this.loading = false
                    this.$notify({
                        title: 'Success',
                        message: 'Created Successfully',
                        type: 'success',
                        duration: 2000
                    })
                })
                .catch((err) => {
                    this.listLoading = false
                    this.loading = false
                    if(err.response.status == 400){
                         this.$notify({
                            title: 'Gagal',
                            message: err.response.data.error,
                            type: 'warning',
                            duration: 2000
                        })   
                    } else {
                        
                        this.$notify({
                            title: 'Error',
                            message: 'Server Error',
                            type: 'warning',
                            duration: 2000
                        })

                    }

                })
            // }
            // })
        },
        handleUpdate(row) {
            // this.name = row.contact.name
            this.id = row.id
            // this.unit = row.unit
            // this.producttype = row.producttype.id == '' ? row.producttype : row.producttype.id
            // this.qty = row.qty

            this.total_kasIn = row.total
            this.cashin_id = row.cashin_id
            this.jatuh_tempo = row.payment_due
            this.total_kasIn = row.total
            this.kurang_bayar = row.total - row.paid
            this.dialogStatus = 'update'
            this.Pembayaran_sebelum = row.paid
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {
            if (this.kurang_bayar < this.jumlah_bayar) {
                this.$notify({
                    title: 'Gagal',
                    message: 'Jumlah Pembayaran Melebihi Jumlah Hutang',
                    type: 'warning',
                    duration: 2000
                })
                return false
            }
            this.listLoading = true
            this.loading = true
            const data = {
                payment_due: this.jatuh_tempo,
                cashin_id: this.cashin_id,
                total: this.jumlah_bayar,
            }
            console.log(data)
            axios.put(`/stock/out/paid/${this.id}`, data)
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
                const tHeader = ['id', 'Customer', 'Total Tagihan', 'Jumlah Bayar', 'Hutang', 'Jatuh Tempo', 'staff', 'tanggal']
                const filterVal = ['id', 'name', 'total', 'paid', 'hutang', 'payment_due', 'staff', 'created_at']
                const data = this.formatJson(filterVal)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: 'Laporan Piutang Beredar'
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal) {
            let total_hutang = 0
            window.print()
            return this.list.map(v => filterVal.map(j => {
                total_hutang += (v.total - v.paid)
                v['average'] =total_hutang
                v['name'] = v.contact.name
                v['hutang'] = v.total - v.paid
                return v[j]
            }))
        },
        getSortClass: function (key) {
            const sort = this.listQuery.sort
            return sort === `+${key}` ? 'ascending' : 'descending'
        },
        onChangeCash(event) {

        },
        onChangeModal(event) {

        },
        addFind() {

            this.kasIn.all.push({
                product_id: '',
                total: '',
                qty: '',
                harga: 0
            })

        },
        deleteFind() {
            this.kasIn.all.pop();
        },
        onChangeTotal() {
            const total = this.kasIn.all.reduce(function (accumulator, item) {

                return accumulator + parseInt(item.total)
            }, 0)
            this.total_kasIn = total
        },
        onChangeProduct(index) {
            const produk = this.product.filter((val) => {
                if (val.id == this.kasIn.all[index]['product_id']) {
                    this.qty_before = val.qty
                    this.index_before = index
                    return val
                }
            })
            this.kasIn.all[index]['qty'] = 0
            this.kasIn.all[index]['harga'] = produk[0]['selling_price']
            this.kasIn.all[index]['total'] = 0
            // parseInt(produk[0]['selling_price'])
        },

        handleFilterByDate() {
            this.listLoading = true
            let data = {
                start_date: this.start,
                end_date: this.end
            }
            axios.post(`/stock/out`, data).then(response => {
                console.log(response)
                let total_hutang = 0
                this.list = response.data.stocktransaction.filter((val, i) => {
                    if(val.total > val.paid){
                        total_hutang += (val.total - val.paid)
                        this.total_hutang = total_hutang
                        return val;
                    }
                })
                this.total = response.data.stocktransaction.length

                // Just to simulate the time of the request

                    this.listLoading = false

            })

        },
        filterProductPrice(){
            axios.get(`/product?contact_id=${this.contact_id}`).then(response => {
                console.log(response.data);
                this.kasIn.all = {}
                this.kasIn.all = 
                [{
                    product_id: '',
                    total: 0,
                    qty: 0,
                    harga: 0
                }];
  
                this.product = response.data.product
            })
        },

        onChangeQty(index) {
            if (this.kasIn.all[index]['qty'] > this.qty_before) {
                this.kasIn.all[index]['qty'] = 0
            } else {

                let qty = parseFloat(
                    this.kasIn.all[index]['qty'].replace(/,/g, ".")
                ).toFixed(2);
                this.kasIn.all[index]['qty'] = parseFloat(
                    this.kasIn.all[index]['qty'].replace(/,/g, ".")
                ).toFixed(2)
                const result = qty * parseInt(this.kasIn.all[index]['harga'])
                this.kasIn.all[index]['total'] = result
                const total = this.kasIn.all.reduce(function (accumulator, item) {
                    console.log(item.total)
                    return accumulator + parseInt(item.total)
                }, 0)
                this.total_kasIn = total
            }
        }

    }
}
</script>
