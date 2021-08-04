<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              Kas Masuk
            </div>
            <count-to :start-val="0" :end-val="cashIn" :duration="1000" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('messages')">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              Kas Keluar
            </div>
            <count-to :start-val="0" :end-val="cashOut" :duration="1000" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </el-row>
    <h3 v-if="cashes.length > 0" style="margin-left:12px">Akun Kas</h3>
    <el-row :gutter="40" class="panel-group">
      <el-col v-for="cash in cashes" :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleClick(cash)">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              {{ cash.name }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
     <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="Detail" @dragDialog="handleDrag">
      <el-select ref="select" v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-table :data="gridData">
        <el-table-column property="from" label="From" />
        <el-table-column property="to" label="To" />
        <el-table-column property="transfer" label="Transfer" width="100" />
        <el-table-column property="chasin" label="chasin" />
        <el-table-column property="chasout" label="chasout" />
        <el-table-column property="desc" label="Desc" />
        <el-table-column property="date" label="Date" width="150" />
        <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="danger">
            <router-link :to="'/transfer/detail/' + row.id">Detail</router-link>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import axios from '@/api/axios'
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui


export default {
  components: {
    CountTo,
  },
  name: 'DragDialogDemo',
  directives: { elDragDialog },

  data() {
    return {
      cashIn: 0,
      cashOut: 0,
      cashes: [],
      category : [],
      keterangan : '',
      dialogTableVisible: false,
      options: [
        { value: '选项1', label: '黄金糕' },
        { value: '选项2', label: '双皮奶' },
        { value: '选项3', label: '蚵仔煎' },
        { value: '选项4', label: '龙须面' }
      ],
      value: '',
      gridData: []
    
    }
  },
  created() {
    axios.get('/cash/out/total')
      .then((response) => this.cashOut = response.data.cashout[0].total == null ? 0 : parseInt(response.data.cashout[0].total))
      .catch((err) => this.cashOut = 0)

    axios.get('/cash/in/total')
      .then((response) => this.cashIn = response.data.cashin[0].total == null ? 0 : parseInt(response.data.cashin[0].total))
      .catch((err) => this.cashIn = 0)

    axios.get('/akun/cash')
      .then((response) => {
        this.cashes.push(...response.data.menu)
      })
      .catch((err) => console.log(err))
    console.log(this.cashes)

  },
  methods: {
     handleDrag() {
      console.log('kjkj')
      this.$refs.select.blur()
    },

    handleClick(cash){
      this.dialogTableVisible = true
      axios.get(`/cash/akun/detail/${cash.id}`)
      .then((response) => {
        console.log(response)
        this.gridData = response.data.detail
      } )
      .catch((err) => console.log(err))
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
