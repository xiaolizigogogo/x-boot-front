<style lang="less">
  @import "shopAnswerManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row>
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
            <Form-item label="名称" prop="name">
              <Input type="text" v-model="searchForm.name" clearable placeholder="请输入名称" style="width: 200px"/>
            </Form-item>
            <Form-item style="margin-left:-35px;">
              <Button @click="handleSearch" type="primary" icon="search">搜索</Button>
              <Button @click="handleReset" type="ghost" >重置</Button>
              <a class="drop-down" @click="dropDown">{{dropDownContent}}
                <Icon :type="dropDownIcon"></Icon>
              </a>
            </Form-item>
          </Form>
        </Row>
        <Row class="operation">
          <Button @click="init" type="ghost" icon="refresh">刷新</Button>
        </Row>
        <Row>
          <Alert show-icon>
            已选择 <span class="select-count">{{selectCount}}</span> 项
            <a class="select-clear" @click="clearSelectAll">清空</a>
          </Alert>
        </Row>
        <Row class="margin-top-10 searchable-table-con1">
          <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
        </Row>
        <Row type="flex" justify="end" class="code-row-bg page">
          <Page :current="this.pageNumber" :total="total" :page-size="this.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50,100]" size="small" show-total show-elevator show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import {formatDate} from '../../../utils/global'
  export default {
    name: "shop-answer-manage",
    data() {
      return {
        loading: true,
        treeLoading: true,
        submitPermLoading: false,
        sortColumn: "createTime",
        sortType: "desc",
        modalType: 0,
        roleModalVisible: false,
        permModalVisible: false,
        modalTitle: "",
        roleForm: {
          shipperName: "",
          logisticCode:"",
          orderId:"",
          shipperCode:"-",
          traces:"-",
          isFinish:0,
          requestCount:0,

        },
        roleFormValidate: {
        },
        submitLoading: false,
        selectList: [],
        selectCount: 0,
        columns: [
          {
            type: "selection",
            width: 60,
            align: "center"
          },
          {
            title: "编号",
            key: "id",
            sortable: true
          },
          {
            title: "创建时间",
            key: "gmtCreate",
            sortable: true,
            sortType: "desc",
            render:(h,params)=>{
              return h('div',
                formatDate(new Date(params.row.gmtCreate)));/*这里的this.row能够获取当前行的数据*/
            }
          },
          {
            title: "答案内容",
            key: "answer",
            align: "center",
          },
          {
            title: "创建人",
            key: "createBy",
            align: "center",
            render:(h,params)=>{
              return h('div',
                params.row.createBy);/*这里的this.row能够获取当前行的数据*/
            }
          },
          {
            title: "操作",
            key: "action",
            align: "center",
            width: 300,
            render:(h,params) => {
              return ('div',[
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.orderInfo(params.row);
                      }
                    }
                  },
                  "查看"
                )
              ])
            }
          }
        ],
        data: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        permData: [],
        drop: false,
        dropDownContent: "展开",
        dropDownIcon: "chevron-down",
        searchForm: {
          current: this.pageNumber,
          size: this.pageSize,
          asc: true,
          ascs:"sortBy",
          isdelete:undefined,
          name:undefined
        },
        deleteMap:{
          "0":"有效",
          "1":"无效",
        }
      };
    },
    methods: {
      init() {
        this.loadData();
      },
      changePage(v) {
        this.pageNumber = v;
        this.loadData();
      },
      changePageSize(v) {
        this.pageSize = v;
        this.loadData();
      },
      changeSort(e) {
        this.sortColumn = e.key;
        this.sortType = e.order;
        if (e.order === "normal") {
          this.sortType = "";
        }
        this.loadData();
      },
      loadData() {
        this.loading = true;
        this.searchForm.current=this.pageNumber
        this.searchForm.size=this.pageSize
        this.getRequest("/nideshopAnswers", this.searchForm).then(res => {
          console.log(res)
          this.loading = false;
          if (res.status === 200) {
            this.data = res.data.records;
            this.total = res.data.total;
          }
        });
      },
      clearSelectAll() {
        this.$refs.table.selectAll(false);
      },
      changeSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },
      // 全选反选
      selectTreeAll() {
        this.selectAllFlag = !this.selectAllFlag
        let select = this.selectAllFlag
        this.selectedTreeAll(this.permData, select)
      },
      // 递归全选节点
      selectedTreeAll(permData, select) {
        let that = this;
        permData.forEach(function(e) {
          e.selected = select
          if (e.children && e.children.length > 0) {
            that.selectedTreeAll(e.children, select);
          }
        });
      },
      submitPermEdit() {
        this.submitPermLoading = true;
        let permIds = "";
        let selectedNodes = this.$refs.tree.getSelectedNodes();
        selectedNodes.forEach(function(e) {
          permIds += e.id + ",";
        });
        permIds = permIds.substring(0, permIds.length - 1);
        this.postRequest("/role/editRolePerm/" + this.editRolePermId, {
          permIds: permIds
        }).then(res => {
          this.submitPermLoading = false;
          if (res.success === true) {
            this.$Message.success("操作成功");
            this.init();
            this.permModalVisible = false;
          }
        });
      },
      //搜索相关函数
      handleSearch() {
        this.pageNumber = 1;
        this.pageSize = 10;
        this.init();
      },
      handleReset() {
        this.$refs.searchForm.resetFields();
        this.pageNumber = 1;
        this.pageSize = 10;
        // 重新加载数据
        this.init();
      },
      dropDown() {
        if (this.drop) {
          this.dropDownContent = "展开";
          this.dropDownIcon = "chevron-down";
        } else {
          this.dropDownContent = "收起";
          this.dropDownIcon = "chevron-up";
        }
        this.drop = !this.drop;
      },
      orderInfo(i){
        this.$router.push({path:"/shopping",query:{orderId:i.id}});
      }

    },
    mounted() {
      this.init();
    }
  };
</script>
