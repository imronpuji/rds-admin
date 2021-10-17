<template>
	<div>

	<b><hr></b>
<h3 style="text-align: center;">
  CV.PUTRA QIRANA
</h3>
<p style="text-align:center">
  Margosari Patebon Kendal 081326260999 / 08112799958
</p>
<b><hr></b>
	<div style="display: inline-block; float:left;">		
	<h4 style="margin:0">NOTA PENJUALAN</h4>
	<pre>
NO transaksi  : T{{trans}}
TGL Transaksi : {{list[0]['created_at']}}
	</pre>
	</div>
<div style="display: inline; float:right;">		
	<h4 style="margin:0">KEPADA :</h4>
	<pre>
{{contact.name}}
{{contact.contact}}
{{contact.address}}
	</pre>
	</div>

<table border="1" width="100%" style="border-collapse: collapse;">
  <thead style="background: rgba(100,100,100, 0.3);width:100%">
    <tr>
      <th style="width:50px; text-align: left; padding:10px">NO</th>
      <th style="text-align: left">NAMA BARANG</th>
      <th style="text-align: left">JUMLAH</th>
      <th style="text-align: left">SATUAN</th>
      <th style="text-align: left">HARGA SATUAN</th>
      <th style="text-align: left">SUB TOTAL</th>
    </tr>
   </thead>
   <tbody>
     <tr v-for="(test, index) in list">
       <td style="padding:10px;text-align: right;">{{index + 1}}</td>
       <td style="text-align: left;">{{test['product']['name']}}</td>
       <td style="text-align: left;">{{test['qty']}}</td>
       <td style="text-align: right;">{{test['product']['unit']}}</td>
       <td style="text-align: right;">{{handleCurrency(test['total'] / test['qty'])}}</td>
       <td style="text-align: right;">{{handleCurrency(test['total'])}}</td>
     </tr>
     <tr>
     	<td style="text-align: center; padding: 8px; font-weight: bold" colspan="5" >TOTAL TAGIHAN</td>
     	<td style="text-align: center; padding: 8px; font-weight: bold" colspan="1" >{{handleCurrency(total)}}</td>
     </tr>
     <tr>
      <tr>
        <th style="text-align: center; padding: 8px; font-weight: bold" colspan="5">PEMBAYARAN</th>
        <td style="text-align: center; padding: 8px; font-weight: bold" colspan="1" >{{handleCurrency(listCredit['paid'])}}</td>
      </tr>
      <tr>
        <th style="text-align: center; padding: 8px; font-weight: bold" colspan="5">KEKURANGAN</th>
        <td style="text-align: center; padding: 8px; font-weight: bold" colspan="1" >{{handleCurrency(listCredit['total'] - listCredit['paid'])}}</td>
      </tr>
  </tbody>
</table>
 
<div style="display: inline-block; border: 0px solid; width:40%">		
	<pre>
				



	(	  			  )
		           
	       PERW.CV.PUTRA QIRANA
	</pre>
	</div>
<div style="display: inline-block; margin-left:10px; float:right; border: 0px solid; width:40%">		
	<pre>
								



	(	  			  )
		            
	              PEMBELI
	</pre>
	</div>
	
  
  </div>
</template>


<script>
 // secondary package based on el-pagination
import axios from '@/api/axios'


export default {

data() {
      return {
        	
        	list : [], 
        	total : '',
        	 contact : [], 
        	 trans : '',
           listCredit : []
		}
},
async created() {
  await this.getList()
   await this.print();
},

methods: {
  async getList() {
  
  	    await axios.get(`/stock/transaction/detail/${this.$route.params.id}`).then(async response => {
          console.log(response)
          this.list = await response.data.stocktransaction[0].substocktransaction
          this.listCredit = await response.data.stocktransaction[0]
          this.contact = await response.data.stocktransaction[0].contact})
  	    const total = await this.list.reduce((acc, val) => {
  	    	return acc + parseInt(val.total)
  	    },0)

  	   

  	    this.trans = await this.$route.params.id
  	    this.total = total



  },

     handleCurrency(number){
     const idr = new Intl.NumberFormat('in-IN', { style: 'currency', currency: 'IDR' }).format(number)
     return idr
   },

  async print() {
  	await window.print()
  	await this.$router.push('/penjualan')
  }

 }
 
}

</script>
<style>
  @media print { 
    body {
       height: 90%; 
       max-height: 500px; 
    } 
}
</style>