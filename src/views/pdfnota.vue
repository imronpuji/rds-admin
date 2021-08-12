<template>
	<div>

	<b><hr></b>
<h3 style="text-align: center;">CV EKO BESI</h3>
<b><hr></b>
	<div style="display: inline-block; float:left;">		
	<h4 style="margin:0">SURAT JALAN</h4>
	<pre>
NO transaksi  : T{{trans}}
TGL Transaksi : {{list[0]['created_at']}}
NO Kendaraan  : 
	</pre>
	</div>
<div style="display: inline; float:right;">		
	<h4 style="margin:0">KEPADA</h4>
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
    </tr>
   </thead>
   <tbody>
     <tr v-for="(test, index) in list">
       <td style="padding:10px;text-align: right;">{{index + 1}}</td>
       <td style="text-align: left;">{{test['product']['name']}}</td>
       <td style="text-align: left;">{{test['qty']}}</td>
       <td style="text-align: right;">{{test['product']['unit']}}</td>
     </tr>
     <tr>
     	<td style="text-align: center; padding: 8px; font-weight: bold" colspan="2" >TOTAL</td>
     	<td style="text-align: center; padding: 8px; font-weight: bold" colspan="2" >{{jumlah_barang}}</td>
     </tr>
  </tbody>
</table>
<div style="display: inline-block; border: 0px solid; width:40%">		
	<pre>
				
			TTD


	(	  			  )
		           
		  PERW.CV.EKO BESI
	</pre>
	</div>
<div style="display: inline-block; margin-left:10px; float:right; border: 0px solid; width:40%">		
	<pre>
								
	TTD


	(	  			  )
		            
		    PENERIMA
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
        	jumlah_barang : '',
        	 contact : [], 
        	 trans : ''
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
          this.contact = await response.data.stocktransaction[0].contact})
  	    const jumlah_barang = await this.list.reduce((acc, val) => {
  	    	return acc + val.qty
  	    },0)

  	    this.jumlah_barang = await jumlah_barang

  	    this.trans = await this.$route.params.id

  	    this.total = this.list[0]['total'] * jumlah_barang



  },

     handleCurrency(number){
     const idr = new Intl.NumberFormat('in-IN', { style: 'currency', currency: 'IDR' }).format(number)
     return idr
   },

  async print() {
  	await window.print()
  	await this.$router.push('/stok/keluar')
  }

 }
 
}

</script>
