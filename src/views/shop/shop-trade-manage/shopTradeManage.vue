<style lang="less">
@import "shopTradeManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>

                  <Row>
                    <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
                      <Form-item label="交易编号" prop="cardNo">
                      <Input type="text" v-model="searchForm.cardNo" clearable placeholder="请输入交易编号" style="width: 200px"/>
                    </Form-item>
                      <Form-item label="客户名" prop="memberName">
                        <Input type="text" v-model="searchForm.memberName" clearable placeholder="请输入客户名" style="width: 200px"/>
                      </Form-item>
                      <Form-item label="客户手机" prop="phoneNumber">
                        <Input type="text" v-model="searchForm.memberPhoneNumber" clearable placeholder="客户手机" style="width: 200px"/>
                      </Form-item>
                      <span v-if="drop">
                              <Form-item label="交易类型" prop="tradeType">
                                <Select v-model="searchForm.tradeType" placeholder="交易类型" clearable style="width: 200px">
                                  <Option value="线下充值">线下充值</Option>
                                  <Option value="线下消费">线下消费</Option>
                                   <Option value="线上买单">线上买单</Option>
                                   <Option value="订单支付">订单支付</Option>
                                   <Option value="余额支付">余额支付</Option>
                                </Select>
                              </Form-item>
                            </span>
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
      <Modal :title="editTitle" v-model="editModalVisible" :mask-closable='false' :width="500">
        <Form ref="editForm" :model="editForm" :label-width="80" :rules="editFormValidate">
          <FormItem label="用户名" prop="memberName">
            <Input  v-model="editForm.nideshopTrade.memberName" :readonly="true" :maxlength="7"></Input>
          </FormItem>
          <FormItem label="交易金额" prop="tradeMoney">
            <InputNumber :max="1000000" :min="1" v-model="editForm.nideshopTrade.tradeMoney"  placeholder="输入交易金额" ></InputNumber>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="cancelEdit">取消</Button>
          <Button type="primary" :loading="submitLoading" @click="submitEdit">提交</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
import {formatDate,fmoney} from '../../../utils/global'
export default {
  name: "shop-member-manage",
  data() {
    return {
      loading: true,
      treeLoading: true,
      submitPermLoading: false,
      sortColumn: "gmtCreate",
      sortType: "desc",
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      editModalVisible: false,
      editTitle: "",
      editForm:{
        nideshopTrade:{
          memberName:"",
          birthday:"",
          tradeMoney:1
        }
      },
      editFormValidate: {
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }]
      },
      modalTitle: "",
      roleForm: {
        name: ""
      },
      roleFormValidate: {
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }]
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      isAscs:false,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "用户名",
          key: "memberName",
          sortable: true
        },
        {
          title: "交易类别",
          key: "tradeType",
          sortable: true,
          sortType: "desc"
        },
        {
          title: "手机号",
          key: "memberPhoneNumber",
          sortable: true,
          sortType: "desc",
        },
        {
          title: "交易金额",
          key: "tradeMoney",
          sortable: true,
          render:(h,params)=>{
            return h('div',
              fmoney(params.row.tradeMoney,2));/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "交易余额",
          key: "tradeAfterMoney",
          sortable: true,
          render:(h,params)=>{
            return h('div',
              fmoney(params.row.tradeAfterMoney,2));/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "交易时间",
          key: "gmtCreate",
          sortable: true,
          render:(h,params)=>{
            return h('div',
              params.row.gmtCreate?
                formatDate(new Date(params.row.gmtCreate)):"-");/*这里的this.row能够获取当前行的数据*/
          }},
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectPermList: [],
      selectAllFlag: false,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "chevron-down",
      searchForm: {
        current: this.pageNumber,
        size: this.pageSize,
        asc: false,
        descs:"gmtCreate",
        memberName:undefined,
        cardNo:undefined,
        memberPhoneNumber:undefined,
        tradeType:undefined
      },
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
      console.log(e)
      if (e.order === "desc") {
        this.sortColumn = e.key;
        this.isAscs = false;
      }else if(e.order ==="normal"){
        this.sortColumn = "";
        this.isAscs =false;
      }
      this.loadData();
    },
    loadData() {
      this.loading = true;
           this.searchForm.current=this.pageNumber;
      this.searchForm.size=this.pageSize;
      this.getRequest("/trades", this.searchForm).then(res => {
        console.log(res)
        this.loading = false;
        if (res.status === 200) {
          this.data = res.data.trades.records;
          this.total = res.data.trades.total;
        }
      });
    },
    // 递归删除禁用节点
    deleteDisableNode(permData) {
      let that = this;
      permData.forEach(function(e) {
        if (e.status === 1) {
          e.title += "(已禁用)"
          e.disabled = true
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children);
        }
      });
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.postBodyRequest("/trades/trade", this.roleForm).then(res => {
            this.submitLoading = false;
            if (res.data.status === 200) {
              this.$Message.success("操作成功");
              this.init();
              this.roleModalVisible = false;
            }
          });
        }
      });
    },
    cancelEdit() {
      this.editModalVisible = false;
    },
    submitEdit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.postBodyRequest("/trades", this.editForm).then(res => {
            this.submitLoading = false;
            if (res.status === 200) {
              this.$Message.success("操作成功");
              this.init();
              this.editModalVisible = false;
              this.editForm.nideshopTrade.tradeMoney=1
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
    edit(v,n) {
      this.modalType = 1;
      this.editTitle = n;
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      this.editForm.nideshopTrade.memberName=v.memberName;
      this.editForm.nideshopTrade.memberId=v.id;
      this.editForm.nideshopTrade.tradeType=n;
      this.editModalVisible = true;
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
    setDefault(v) {
      this.$Modal.confirm({
        title: "确认设置",
        content: "您确认要设置所选的 " + v.name + " 为注册用户默认角色?",
        onOk: () => {
          let params = {
            id: v.id,
            isDefault: true
          };
          this.postRequest("/role/setDefault", params).then(res => {
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    cancelDefault(v) {
      this.$Modal.confirm({
        title: "确认取消",
        content: "您确认要取消所选的 " + v.name + " 角色为默认?",
        onOk: () => {
          let params = {
            id: v.id,
            isDefault: false
          };
          this.postRequest("/role/setDefault", params).then(res => {
            if (res.success === true) {
              this.$Message.success("操作成功");
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
          this.deleteRequest("/role/delAllByIds", { ids: ids }).then(res => {
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.init();
            }
          });
        }
      });
    },
    editPerm(v) {
      this.editRolePermId = v.id;
      // 匹配勾选
      let rolePerms = v.permissions;
      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms);
      this.permModalVisible = true;
    },
    // 递归判断子节点
    checkPermTree(permData, rolePerms) {
      let that = this;
      permData.forEach(function(p) {
        if (that.hasPerm(p, rolePerms)) {
          p.selected = true;
        } else {
          p.selected = false;
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms);
        }
      });
    },
    // 判断角色拥有的权限节点勾选
    hasPerm(p, rolePerms) {
      let flag = false;
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].id) {
          flag = true;
          break;
        }
      }
      if (flag) {
        return true;
      }
      return false;
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
    cancelPermEdit() {
      this.permModalVisible = false;
    },
    //搜索相关函数
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.init();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
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
  },
  mounted() {
    this.init();
  }
};
</script>
