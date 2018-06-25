<style lang="less">
@import "shopGoodsManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Form inline :label-width="70" class="search-form">
                      <Form-item label="搜索日志">
                        <Input type="text" v-model="searchKey" clearable placeholder="请输入搜索关键词" style="width: 300px"/>
                      </Form-item>
                      <Form-item style="margin-left:-35px;">
                        <Button @click="loadData"  type="primary" icon="search">搜索</Button>
                        <Button @click="loadData" type="ghost" >重置</Button>
                      </Form-item>
                    </Form>
                    <Row class="operation">
                      <Button @click="clearAll" type="primary" icon="ivu-icon ivu-icon-plus-round">添加商品</Button>
                      <Button @click="delAll" type="error" icon="trash-a">批量删除</Button>
                      <Button @click="loadData" type="ghost" icon="refresh">刷新</Button>
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
export default {
  name: "shop-goods-manage",
  data() {
    return {
      loading: true,
      selectList: [],
      selectCount: 0,
      searchKey: "",
      sortColumn: "createTime",
      sortType: "desc",
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "商品编号",
          key: "goodsSn",
          width: 110,
          sortable: true
        },
        {
          title: "商品名称",
          key: "name",
          width: 110,
          sortable: true
        },
        {
          title: "是否在售",
          key: "isOnSale",
          width: 110,
          sortable: true
        },
        {
          title: "是否删除",
          key: "isOnSale",
          width: 110,
          sortable: true
        },
        {
          title: "零售价格",
          key: "retailPrice",
          width: 110,
          sortable: true
        },
        {
          title: "销售库存",
          key: "sellVolume",
          width: 110,
          sortable: true
        },
        {
          title: "请求类型",
          key: "requestType",
          width: 120,
          align: "center",
          sortable: true,
          filters: [
            {
              label: "GET",
              value: "GET"
            },
            {
              label: "POST",
              value: "POST"
            },
            {
              label: "PUT",
              value: "PUT"
            },
            {
              label: "DELETE",
              value: "DELETE"
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === "GET") {
              return row.requestType === "GET";
            } else if (value === "POST") {
              return row.requestType === "POST";
            } else if (value === "PUT") {
              return row.requestType === "PUT";
            } else if (value === "DELETE") {
              return row.requestType === "DELETE";
            }
          }
        },
        {
          title: "请求路径",
          width: 150,
          key: "requestUrl"
        },
        {
          title: "请求参数",
          width: 200,
          key: "requestParam"
        },
        {
          title: "登录用户",
          key: "username",
          width: 105,
          sortable: true
        },
        {
          title: "IP",
          key: "ip",
          width: 100,
          sortable: true
        },
        {
          title: "IP信息",
          key: "ipInfo",
          width: 90,
          sortable: true
        },
        {
          title: "耗时(毫秒)",
          key: "costTime",
          width: 125,
          sortable: true,
          align: "center",
          filters: [
            {
              label: "≤1000毫秒",
              value: 0
            },
            {
              label: ">1000毫秒",
              value: 1
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 0) {
              return row.costTime <= 1000;
            } else if (value === 1) {
              return row.costTime > 1000;
            }
          }
        },
        {
          title: "创建时间",
          key: "addTime",
          sortable: true,
          width: 105,
          sortType: "desc"
        },
        {
          title: "操作",
          key: "action",
          width: 98,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0
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
    loadData() {
      this.loading = true;
      let params = {
        current: this.pageNumber,
        size: this.pageSize,
        asc: false,
        descs:"addTime"
      };
      this.getRequest("/goods", params).then(res => {
        this.loading = false;
        if (res.status === 200) {
          this.data = res.data.records;
          this.total = res.data.total;
        }
      });
    },
    handleReset() {
      this.searchKey = "";
      this.getLogList();
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该条数据?",
        onOk: () => {
          this.deleteRequest("/log/delByIds", { ids: v.id }).then(res => {
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.init();
            }
          });
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
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order === "normal") {
        this.sortType = "";
      }
      this.getLogList();
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.deleteRequest("/log/delByIds", { ids: ids }).then(res => {
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.init();
            }
          });
        }
      });
    },
    clearAll() {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要彻底清空删除所有条数据?",
        onOk: () => {
          this.loading = true;
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.deleteRequest("/log/delAll").then(res => {
            this.loading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.init();
            }
          });
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
