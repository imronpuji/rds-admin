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
        <div class="block"></div>
        <el-date-picker v-model="start" class="filter-item" type="date" placeholder="Dari">
        </el-date-picker>
        <el-date-picker style="margin-left:8px" v-model="end" class="filter-item" type="date" placeholder="Sampai">
        </el-date-picker>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleFilterByDate">
            Filter
        </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list.filter(({contact}) => !search || contact.name.toLowerCase().includes(search.toLowerCase()))" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
        <el-table-column sortable prop="id" label="ID" align="center" width="80">
            <template slot-scope="{row}">
                <span>{{ row.id }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Customer" min-width="150px" prop="name" sortable>
            <template slot-scope="{row}">
                <span v-if="row.contact != null" class="link-type" @click="handleUpdate(row)">{{ row.contact.name }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Total Tagihan" width="150px" align="center" sortable prop="total">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.total) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Jumlah Bayar" width="150px" align="center" sortable prop="paid">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.paid) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Potongan" width="150px" align="center" sortable prop="discount">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.discount) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Piutang" width="150px" align="center" sortable prop="debt">
            <template slot-scope="{row}">
                <span>{{ handleCurrency(row.debt) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Actions" align="left" width="80" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">

                <el-popover trigger="hover" placement="top">
                    <el-button v-if="row.total != row.paid" type="primary" size="mini" @click="handleUpdate(row)">
                        Bayar
                    </el-button>
                    <div slot="reference" class="name-wrapper">
                        <el-tag size="medium">Aksi</el-tag>
                    </div>
                    <el-button type="primary" size="mini" @click="handleDelete(row)" v-if="checkPermission(['admin'])">
                        Delete
                    </el-button>
                    <br>
                    <br>
                    <el-button size="mini" type="warning">
                        <router-link :to="'penjualan/detail/' + row.id">Detail</router-link>
                    </el-button>

                    <el-button size="mini" type="warning">
                        <router-link :to="'/kredit/detail/' + row.id">Detail Kredit</router-link>
                    </el-button>
                </el-popover>

            </template>
        </el-table-column>
        <el-table-column label="Cetak" width="80px" align="center">
            <template slot-scope="{row}">

                <el-popover trigger="hover" placement="top">
                    <el-button type="primary" size="mini">
                        <router-link target="_blank" :to="'/penjualan/surat/jalan/' + row.id"> Surat Jalan</router-link>
                    </el-button>
                    <el-button type="warning" size="mini">
                        <router-link target="_blank" :to="'/penjualan/nota/' + row.id"> Nota</router-link>
                    </el-button>
                    <div slot="reference" class="name-wrapper">
                        <el-tag size="medium">Cetak</el-tag>
                    </div>
                </el-popover>

            </template>
        </el-table-column>
        <el-table-column label="Jatuh Tempo" width="150px" align="center" sortable prop="payment_due">
            <template slot-scope="{row}">
                <span>{{ row.payment_due }}</span>
            </template>
        </el-table-column>
        <el-table-column width="150px" align="center" prop="date" label="Date" sortable column-key="date" :filters="[{text: '2016-05-01', value: '2016-05-01'}, {text: '2016-05-02', value: '2016-05-02'}, {text: '2016-05-03', value: '2016-05-03'}, {text: '2016-05-04', value: '2016-05-04'}]" :filter-method="filterHandler">
            <template slot-scope="{row}">
                <span>{{ row.date }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Staff" width="150px" align="center" sortable prop="staff">
            <template slot-scope="{row}">
                <span>{{ row.staff }}</span>
            </template>
        </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top" label-width="180px" style="width: 100% !important; margin-left:50px;" :inline="true">
            <el-form-item class="k" label="Customer" v-if="dialogStatus == 'create'">
                <el-select filterable v-model="contact_id" required class="filter-item" placeholder="Please select" @change="filterProductPrice()">
                    <el-option v-for="item in kontak" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item class="k" label="Jatuh Tempo">
                <el-date-picker v-model="jatuh_tempo" type="date" placeholder="Jatuh Tempo">
                </el-date-picker>
            </el-form-item>
            <el-form-item class="k" label="Tgl Transaksi" v-if="dialogStatus == 'create'">
                <el-date-picker v-model="dates" type="date" placeholder="Tanggal Transaksi">
                </el-date-picker>
            </el-form-item>
            
            <div v-if="dialogStatus == 'create'" v-for="(all, index) in kasIn.all" style="display:flex; flex-wrap: wrap; width:100% !important">
                <el-form-item class="k" :label="index == 0 ? 'Produk' : ''">
                    <el-select v-model="all.product_id" filterable placeholder="Select" @change="onChangeProduct(index)">
                        <el-option v-for="item in product" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Jumlah Barang' : ''">
                    <el-input v-model="all.qty" :value="all.qty" required type="text" placeholder="Jumlah Barang" @change="onChangeQty(index)" />
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Harga Satuan' : ''" >
                    <v-money-spinner v-if="roles == 'admin'" v-bind="config" v-model="all.harga" required type="text" placeholder="Harga Satuan" @change="onChangeQty(index)"></v-money-spinner>
                    <v-money-spinner v-else v-bind="config" v-model="all.harga" readonly required type="text" placeholder="Harga Satuan" @change="onChangeQty(index)"></v-money-spinner>
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Sub Total':''">
                    <v-money-spinner v-bind="config" disabled v-model="all.total" type="numeric" min="0.01" step="0.01" max="2500" placeholder="Please input" @change="onChangeTotal()"></v-money-spinner>
                </el-form-item>
                <el-form-item class="k" :style="index == 0 ? 'margin-top:50px' : ''">
                    <el-button style="height:30px"  type="primary" @click="deleteFormProdukByIndex(index)">
                        X
                    </el-button>
                </el-form-item>
            </div>

            <el-form-item class="k" label="Masuk Ke Kas">
                <el-select v-model="cashout_id" required class="filter-item" placeholder="Please select" @change="onChangeModal($event)">
                    <el-option v-for="item in kas" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item class="k" label="Jumlah Pembayaran">
                <v-money-spinner v-model="jumlah_bayar" v-bind="config" @change="handleChangeText()"></v-money-spinner>
            </el-form-item>
             <el-form-item class="k" label="Potongan" v-if="dialogStatus == 'create'">
                <v-money-spinner v-model="discount" v-bind="config" @change="handleChangeText()"></v-money-spinner>
            </el-form-item>


            <h3 v-if="total_kasIn != ''"> Total Tagihan : {{ handleCurrency(total_kasIn) }}</h3>
            <h3 v-if="kurang_bayar != ''"> Kekurangan : {{ handleCurrency(kurang_bayar) }}</h3>
            <h3 v-if="sisa_bayar != ''"> Kembalian : {{ handleCurrency(sisa_bayar) }}</h3>
        </el-form>
        <!-- multiple input -->
        </el-form>
        <div slot="footer" class="dialog-footer" style="display:flex; flex-wrap:wrap; justify-content:center">
            <el-button style="margin:20px 10px" type="primary" @click="addFind" v-if="dialogStatus == 'create'">
                Tambah Produk
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
                allowBlank : true,
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
    created() {
        this.getList()
        let DD = new Date().getDate() 
        let MM = new Date().getMonth() + 1
        let YYYY = new Date().getFullYear()
        this.jatuh_tempo = `${YYYY}-${MM}-${DD}`
        this.dates = `${YYYY}-${MM}-${DD}`
    },
    methods: {
        checkPermission,
        handleChangeText(i) {

            if (this.dialogStatus == 'create') {

                if (this.jumlah_bayar +  this.discount > this.total_kasIn || this.jumlah_bayar + this.discount == this.total_kasIn ) {
                    this.sisa_bayar = (this.jumlah_bayar + this.discount) - this.total_kasIn 
                    this.kurang_bayar = ''

                }

                 else {
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
        getList() {
            this.listLoading = true
            axios.get('/stock/out').then(response => {
                console.log(response)
                this.list = response.data.stocktransaction.map((val) => {
                    val['debt'] = (val.total - val.paid - val.discount) < 0 ? 0 : val.total - val.paid - val.discount 
                    return val;
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
                discount : this.discount,
                payment_due: this.jatuh_tempo,
                paid: this.jumlah_bayar > this.total_kasIn ? this.total_kasIn : this.jumlah_bayar - this.sisa_bayar,
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
            this.cashout_id = row.cashin_id
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
                cashin_id: this.cashout_id,
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
                    filename: 'penjualan'
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal) {
            return this.list.map(v => filterVal.map(j => {
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
            console.log(data)
            axios.post(`/stock/out`, data).then(response => {
                console.log(response)

                this.list = response.data.stocktransaction.map(val => {
                    val['debt'] = (val.total - val.paid - val.discount) < 0 ? 0 : val.total - val.paid - val.discount 
                    return val
                })
                this.total = response.data.stocktransaction.length

                // Just to simulate the time of the request
                setTimeout(() => {
                    this.listLoading = false
                }, 1.5 * 1000)
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
                let qty = 0;
                if(this.kasIn.all[index]['qty'].length > 3){

                    qty = this.kasIn.all[index]['qty'].replace('.', "")
                } else {
                    qty = this.kasIn.all[index]['qty'].replace(/,/g, ".")
                    this.kasIn.all[index]['qty'] = qty
                }
                
                
                this.kasIn.all[index]['qty'] = qty
                
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
