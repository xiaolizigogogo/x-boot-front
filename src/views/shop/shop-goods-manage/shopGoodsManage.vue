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
                      <Button @click="addGoods" type="primary" icon="ivu-icon ivu-icon-plus-round">添加商品</Button>
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
      <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable='false' :width="500">
        <Form ref="roleForm" :model="roleForm" :label-width="80" :rules="roleFormValidate">
          <FormItem label="商品名称" prop="name">
            <Input v-model="roleForm.name" placeholder="商品名称"/>
          </FormItem>
          <FormItem label="商品简介" prop="goodsBrief">
            <Input v-model="roleForm.goodsBrief" placeholder="商品简介" />
          </FormItem>
          <FormItem label="是否在售" prop="name">
            <Select v-model="roleForm.isOnSale" placeholder="请选择" clearable style="width: 200px">
              <Option value=0>不显示</Option>
              <Option value=1>显示</Option>
            </Select>
          </FormItem>
          <FormItem label="零售价格" prop="name">
            <InputNumber :max="1000" :min="0" v-model="roleForm.retailPrice"></InputNumber>
          </FormItem>
          <FormItem label="实际价格" prop="name">
            <InputNumber :max="1000" :min="0" v-model="roleForm.extraPrice"></InputNumber>
          </FormItem>
          <FormItem label="排序值" prop="name">
            <InputNumber :max="1000" :min="0" v-model="roleForm.sortOrder"></InputNumber>
          </FormItem>
          <FormItem label="是否新品" prop="name">
            <Select v-model="roleForm.isNew" placeholder="请选择" clearable style="width: 200px">
              <Option value=0>否</Option>
              <Option value=1>是</Option>
            </Select>
          </FormItem>
          <FormItem label="库存单位" prop="name">
            <Input v-model="roleForm.goodsUnit" placeholder="条/件"/>
          </FormItem>
          <FormItem label="促销描述" prop="name">
            <Input v-model="roleForm.promotionDesc" placeholder="促销描述"/>
          </FormItem>
          <FormItem label="列表图片" prop="name">
            <qiniu
              @handleSuccess = "(url) => this.roleForm.listPicUrl = url" :imgUrl="this.listPicUrl">
            </qiniu>
          </FormItem>
          <FormItem label="详情主图片" prop="name">
            <qiniu
              @handleSuccess = "(url) => this.roleForm.primaryPicUrl = url" :imgUrl="this.primaryPicUrl">
            </qiniu>
          </FormItem>
          <FormItem label="详情主产品" prop="name">
            <Input v-model="roleForm.primaryProductId" placeholder="详情主产品"/>
          </FormItem>
          <FormItem label="所属分类" prop="name">
            <Input v-model="roleForm.categoryId" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
          </FormItem>
          <FormItem label="是否限购" prop="name">
            <Input v-model="roleForm.isLimited" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
          </FormItem>
          <FormItem label="是否热销" prop="name">
            <Input v-model="roleForm.isHot" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
          </FormItem>
          <FormItem label="销售量" prop="name">
            <Input v-model="roleForm.sellVolume" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
          </FormItem>
          <FormItem label="库存量" prop="name">
            <Input v-model="roleForm.goodsNumber" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="cancelRole">取消</Button>
          <Button type="primary" :loading="submitLoading" @click="submitRole">提交</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
  import qiniu from '../../my-components/image-upload/qiniu'
  import {formatDate,fmoney} from '../../../utils/global'
export default {
  name: "shop-goods-manage",
  data() {
    return {
      primaryPicUrl:undefined,
      listPicUrl:undefined,
      loading: true,
      selectList: [],
      selectCount: 0,
      searchKey: "",
      sortColumn: "createTime",
      sortType: "desc",
      modalTitle:"0 ",
      roleFormValidate:{},
      roleForm:{},
      roleModalVisible:false,
      submitLoading: false,
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
      total: 0,
      rules:{},
    title:""
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
    },
    addGoods(){
        this.modalType = 0;
        this.modalTitle = "添加角色";
        this.roleForm = {
          name: "",
          access: null
        };
        this.roleModalVisible = true;
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          let url = "/role/save";
          if (this.modalType === 1) {
            // 编辑用户
            url = "/role/edit";
          }
          this.submitLoading = true;
          this.postRequest(url, this.roleForm).then(res => {
            this.submitLoading = false;
          if (res.success === true) {
            this.$Message.success("操作成功");
            this.init();
            this.roleModalVisible = false;
          }
        });
        }
      });
    },
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加角色";
      this.roleForm = {
        name: "",
        access: null
      };
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑角色";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.name + " ?",
        onOk: () => {
        this.deleteRequest("/role/delAllByIds", { ids: v.id }).then(res => {
        if (res.success === true) {
        this.$Message.success("删除成功");
        this.init();
      }
    });
    }
    });
    },
  },
  mounted() {
    this.init();
  }
};
</script>
