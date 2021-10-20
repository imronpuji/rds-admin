<template>
<div class="app-container">
    <div class="filter-container">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
            {{uri == 'in' ? 'Proses Pembelian' : 'Proses Penjualan'}}
        </el-button>
    </div>
<!--     <div v-for="data in cashin">
        <h5 style="margin:4px; padding:0">Masuk Ke Akun : {{ data.to.name }}</h5>
        <h5 style="margin:4px; padding:0">Total : {{ handleCurrency(data.cashin) }}</h5>
    </div> -->

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="sortChange">
        <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
            <template slot-scope="{row}">
                <span>{{ row.id }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Nama" min-width="150px">
            <template slot-scope="{row}">
                <span class="link-type" @click="handleUpdate(row)">
                    <span>{{row.product.name}}</span>
                </span>
            </template>
        </el-table-column>
        <el-table-column label="Jumlah barang" width="150px" align="center">
            <template slot-scope="{row}">
                <span>{{row.qty}}</span>
            </template>
        </el-table-column>
        <el-table-column label="Satuan" width="150px" align="center">
            <template slot-scope="{row}">
                <span>{{row.product.unit.name}}</span>
            </template>
        </el-table-column>
        <el-table-column label="Harga Satuan" width="150px" align="center">
            <template slot-scope="{row}">
                <span>{{handleCurrency(row.total / row.qty)}}</span>
            </template>
        </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

     <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top" label-width="180px" style="width: 100% !important; margin-left:50px;" :inline="true">
            <el-form-item class="k" label="Customer" v-if="dialogStatus == 'create'">
                <el-input readonly :value="kontak[0]['name']" required type="text"/>
            </el-form-item>
            <el-form-item class="k" label="Jatuh Tempo">
                <el-date-picker v-model="jatuh_tempo" type="date" placeholder="Jatuh Tempo">
                </el-date-picker>
            </el-form-item>
            <el-form-item class="k" label="Tgl Transaksi" v-if="dialogStatus == 'create'">
                <el-date-picker v-model="dates" type="date" placeholder="Tanggal Transaksi">
                </el-date-picker>
            </el-form-item>
            
            <div v-if="dialogStatus == 'create'" v-for="(all, index) in product" style="display:flex; flex-wrap: wrap; width:100% !important">
                <el-form-item class="k" :label="index == 0 ? ' Barang' : ''">
                    <el-input style="display:none"  v-model="all.product_id" :value="all.id" required/>
                    <el-input readonly :value="all.product.name" required type="text"/>
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Jumlah Barang' : ''">
                    <el-input v-model="all.qty" :value="all.qty" required type="text" placeholder="Jumlah Barang" @change="onChangeQty(index)" />
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Harga Satuan' : ''" >
                    <v-money-spinner v-if="roles == 'admin'" v-bind="config" v-model="all.harga = all.purchase_price" required type="text" placeholder="Rp 0" @change="onChangeQty(index)"></v-money-spinner>
                    <v-money-spinner v-else v-bind="config" v-model="all.harga = all.product.purchase_price" readonly required type="text" placeholder="Rp 0" @change="onChangeQty(index)"></v-money-spinner>
                </el-form-item>
                <el-form-item class="k" :label="index == 0 ? 'Sub Total':''">
                    <v-money-spinner v-bind="config" disabled v-model="all.total" placeholder="Please input" @change="onChangeTotal()"></v-money-spinner>
                </el-form-item>
                <el-form-item class="k" :style="index == 0 ? 'margin-top:50px' : ''">
                    <el-button  style="height:30px"  type="primary" @click="deleteFormProdukByIndex(index)">
                        X
                    </el-button>
                </el-form-item>
            </div>

            <el-form-item class="k" :label="trans.cashin == null ? 'Keluar Dari Kas' : 'Masuk Ke Kas'">
                <el-input readonly :value="cashin" required type="text"/>
            </el-form-item>
            <el-form-item class="k" label="Jumlah Pembayaran">
                <v-money-spinner v-bind="config" v-model="jumlah_bayar" @change="handleChangeText()" type="text" placeholder="Rp 0"></v-money-spinner>
            </el-form-item>
             <el-form-item class="k" label="Potongan" v-if="dialogStatus == 'create'">
                <v-money-spinner v-model="discount" v-bind="config" @change="handleChangeText()" placeholder="Rp 0"></v-money-spinner>
            </el-form-item>


            <h3 v-if="total_kasIn != ''"> Total Tagihan : {{ handleCurrency(total_kasIn) }}</h3>
            <h3 v-if="sisa_bayar != ''"> Kembalian : {{ handleCurrency(sisa_bayar) }}</h3>
            <h3 v-if="paid != ''"> Sudah Dibayar : {{ handleCurrency(paid) }}</h3>
            <h3 v-if="discount != ''"> Potongan : {{ handleCurrency(discount) }}</h3>
            <h3 v-if="jumlah_bayar != ''"> Jumlah Pembayaran : {{ handleCurrency(jumlah_bayar) }}</h3>
            <h3 v-if="kurang_bayar != ''"> Kekurangan : {{ handleCurrency(kurang_bayar) }}</h3>
        </el-form>
        <!-- multiple input -->
        </el-form>
        <div slot="footer" class="dialog-footer" style="display:flex; flex-wrap:wrap; justify-content:center">
<!--             <el-button style="margin:20px 10px" type="primary" @click="addFind" v-if="dialogStatus == 'create'">
                Tambah Produk
            </el-button> -->
            <el-button style="margin:20px 10px" @click="dialogFormVisible = false">
                Cancel
            </el-button>

            <el-button v-if="jumlah_bayar > 0" style="margin:20px 10px" :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">
                Simpan
            </el-button>
            <el-button v-else style="margin:20px 10px" :loading="loading" type="primary" @click="dialogStatus==='create'?createData():updateData()">
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

    <h1 />
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
import {
    mapGetters
} from 'vuex'
import checkPermission from '@/utils/permission'

const calendarTypeOptions = [{
        key: 'CN',
        display_name: 'China'
    },
    {
        key: 'US',
        display_name: 'USA'
    },
    {
        key: 'JP',
        display_name: 'Japan'
    },
    {
        key: 'EU',
        display_name: 'Eurozone'
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
            trans : '',
          start: '',
          paid : [],
          payment_due : '',
            end: '',
            uri : '',
            dates: '',
            discount : [],
            staff  : '',
            jatuh_tempo: '',
            qty_before: '',
            index_before: '',
            Pembayaran_sebelum: '',
            jumlah_bayar: [],
            kurang_bayar: '',
            sisa_bayar: [],
            kembalian: '',
            list: '',
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
                allowBlank : true
            },
            category: '',
            kontak: [],
            kas: [],
            search: '',
            product: [],
            contact_id: "",
            cashout_id: "",
            satuan: '',
            cashin  :'',
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
                create: 'Detail Pesanan'
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
    },

    computed: {
        ...mapGetters([
            'name',
            'avatar',
            'roles'
        ])
    },
    methods: {
         handleChangeText(i) {
             if (this.dialogStatus == 'create') {

                if (this.jumlah_bayar +  this.discount + this.paid > this.total_kasIn || this.jumlah_bayar + this.discount + this.paid == this.total_kasIn ) {
                    this.sisa_bayar = (this.jumlah_bayar + this.discount + this.paid) - this.total_kasIn 
                    this.kurang_bayar = ''

                }

                 else {
                    this.kurang_bayar = this.total_kasIn - (this.jumlah_bayar + this.discount + this.paid) 

                    this.sisa_bayar = ''

                }
            } else {
                this.kurang_bayar = this.total_kasIn - (this.jumlah_bayar + this.Pembayaran_sebelum)
            }
        },
        getList() {
            this.listLoading = true
            axios.get(`/stock/transaction/detail/${this.$route.params.id}`).then(response => {
                console.log(response)
                this.product = response.data.stocktransaction[0].substocktransaction
                this.paid = response.data.stocktransaction[0].paid
                // this.jumlah_bayar = response.data.stocktransaction[0].paid
                this.discount = response.data.stocktransaction[0].discount != null ? response.data.stocktransaction[0].discount : []
                this.trans = response.data.stocktransaction[0]
                console.log(this.product)
                this.cashin = response.data.stocktransaction[0].cashin != null ? response.data.stocktransaction[0].cashin.name : response.data.stocktransaction[0].cashout.name
                this.cashout_id = response.data.stocktransaction[0].cashin != null ? response.data.stocktransaction[0].cashin.id : response.data.stocktransaction[0].cashout.id
                this.uri = response.data.stocktransaction[0].cashin != null ? 'out' : 'in'
                this.list = response.data.stocktransaction[0].substocktransaction
                this.staff = response.data.stocktransaction[0].staff
                this.total = response.data.stocktransaction[0].substocktransaction.length
                this.kontak = [response.data.stocktransaction[0].contact]
                this.jatuh_tempo = response.data.stocktransaction[0].payment_due
                this.dates = response.data.stocktransaction[0].date
                this.contact_id = response.data.stocktransaction[0].contact_id
                this.total_kasIn = response.data.stocktransaction[0].total
                // Just to simulate the time of the request
                this.listLoading = false
                setTimeout(() => {
                }, 1.5 * 1000)
            })

             axios.get('/akun/iscash').then(response => {
                if (this.roles == 'kasir') {
                    this.kas = response.data.akun.filter((val) => val.name == "Kas Besar")
                } else {
                    this.kas = response.data.akun

                }
            })

            // axios.get('/contact/customer').then(response => {
            //     console.log(response.data);
            //     this.kontak = response.data.contact
            // })

            // axios.get('/product').then(response => {

            //     this.product = response.data.product
            // })

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
                harga: []
            }]
            this.kurang_bayar = ''
            this.sisa_bayar = ''
            this.index_before = ''
            this.discount = this.discount > 0 ? this.discount : []
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
            this.product.map((val, index) => {
                qty.push(val.qty)
                total.push(parseInt(val.total))
                product_id.push(val.product_id)
            })
            let data = ''
            if(this.uri == 'in'){
                data = {
                contact_id: this.contact_id,
                cashout_id: this.cashout_id,
                product_id,
                qty,
                date: this.dates,
                total,
                id : this.$route.params.id,
                discount : this.discount,
                payment_due: this.jatuh_tempo,
                paid: this.jumlah_bayar > this.total_kasIn ? this.total_kasIn : this.jumlah_bayar + this.paid - this.sisa_bayar,
                staff: this.name
            }
            } else {
                data = {
                contact_id: this.contact_id,
                cashin_id: this.cashout_id,
                product_id,
                qty,
                date: this.dates,
                total,
                id : this.$route.params.id,
                discount : this.discount,
                payment_due: this.jatuh_tempo,
                paid: this.jumlah_bayar > this.total_kasIn ? this.total_kasIn : this.jumlah_bayar + this.paid - this.sisa_bayar,
                staff: this.name
            }
            }
             
            var encodedValues = qs.stringify(
                data, {
                    allowDots: true
                }
            )
            console.log(data)
            axios.post(`/stock/${this.uri}/create`, encodedValues)
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
                            title: 'Gagal',
                            message: 'Anda Belum Melengkapi Data',
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
            const total = this.product.reduce(function (accumulator, item) {

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
            if (this.product[index]['qty'] < -2000) {
                this.product[index]['qty'] = 0
            } else {
                let qty = 0;
                if(this.product[index]['qty'].length > 3){

                    qty = this.product[index]['qty'].replace('.', "")
                } else {
                    qty = this.product[index]['qty'].replace(/,/g, ".")
                    this.product[index]['qty'] = qty
                }
                
                
                this.product[index]['qty'] = qty
                console.log(this.product)
                const result = qty * parseInt(this.product[index]['harga'])
                this.product[index]['total'] = result

                this.total_kasIn = this.product.reduce(function (accumulator, item) {
                    return accumulator + parseInt(item.total)
                }, 0)
                console.log(this.total_kasIn)
            }
        }

    }
}
</script>
