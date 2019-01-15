<style lang="less">
@import "shopOrderManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                  <Row>
                    <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
                      <Form-item label="编号" prop="orderSn">
                        <Input type="text" v-model="searchForm.orderSn" clearable placeholder="请输入编号" style="width: 200px"/>
                      </Form-item>
                      <Form-item label="客户" prop="userName">
                        <Input type="text" v-model="searchForm.userName" clearable placeholder="请输入名称" style="width: 200px"/>
                      </Form-item>
                      <Form-item label="客户手机" prop="mobile">
                        <Input type="text" v-model="searchForm.mobile" clearable placeholder="客户手机" style="width: 200px"/>
                      </Form-item>
                      <span v-if="drop">
                              <Form-item label="支付状态" prop="subscribeStatus">
                                <Select v-model="searchForm.payStatus" placeholder="支付状态" clearable style="width: 200px">
                                  <Option value="">全部</Option>
                                  <Option value=0>未支付</Option>
                                  <Option value=1>已支付</Option>
                                </Select>
                              </Form-item>
                               <Form-item label="物流状态" prop="subscribeStatus">
                                <Select v-model="searchForm.orderStatus" placeholder="物流状态" clearable style="width: 200px">
                                   <Option value="">全部</Option>
                                  <Option value=0>未发货</Option>
                                  <Option value=1>已发货</Option>
                                </Select>
                              </Form-item>
                              <Form-item label="订单状态" prop="subscribeStatus">
                                <Select v-model="searchForm.shippingStatus" placeholder="订单状态" clearable style="width: 200px">
                                   <Option value="">全部</Option>
                                  <Option value=0>待确认</Option>
                                  <Option value=1>已确认</Option>
                                   <Option value=2>已完成</Option>
                                   <Option value=-1>已取消</Option>
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
                        <!--<Button @click="addRole" type="primary" icon="plus-round">添加角色</Button>-->
                        <!--<Button @click="delAll" type="ghost" icon="trash-a">批量删除</Button>-->
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
        <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable='false' :width="500">
          <Form ref="roleForm" :model="roleForm" :label-width="80" :rules="roleFormValidate">
            <FormItem label="快递公司" prop="name">
              <Input v-model="roleForm.shipperName" placeholder="快递公司"/>
            </FormItem>
            <FormItem label="快递单号" prop="name">
              <Input v-model="roleForm.logisticCode" placeholder="快递单号"/>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelRole">取消</Button>
            <Button type="primary" :loading="submitLoading" @click="submitRole">提交</Button>
          </div>
        </Modal>
        <Modal title="分配权限(点击选择)" v-model="permModalVisible" :mask-closable='false' :width="500">
          <Tree ref="tree" :data="permData" multiple></Tree>
          <Spin size="large" v-if="treeLoading"></Spin>
          <div slot="footer">
            <Button type="text" @click="cancelPermEdit">取消</Button>
            <Button type="ghost" @click="selectTreeAll">全选/反选</Button>
            <Button type="primary" :loading="submitPermLoading" @click="submitPermEdit">提交</Button>
          </div>
        </Modal>
    </div>
</template>

<script>
import {formatDate} from '../../../utils/global'
export default {
  name: "shop-order-manage",
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
          title: "订单编号",
          key: "orderSn",
          sortable: true
        },
        {
          title: "创建时间",
          key: "addTime",
          sortable: true,
          sortType: "desc",
          render:(h,params)=>{
            return h('div',
              formatDate(new Date(params.row.addTime*1000)));/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "确认时间",
          key: "confirmTime",
          sortable: true,
          render:(h,params)=>{
            return h('div',
              params.row.confirmTime?
              formatDate(new Date(params.row.confirmTime*1000)):"-");/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "客户",
          key: "userName",
          align: "center",
        },
        {
          title: "客户手机",
          key: "mobile",
          align: "center",
        },
        {
          title: "支付状态",
          key: "payStatus",
          align: "center",
          render:(h,params)=>{
            return h('div', this.payStatusMap[params.row.payStatus]);/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "订单状态",
          key: "orderStatus",
          align: "center",
          render:(h,params)=>{
            return h('div',
              this.orderStatusMap[params.row.orderStatus]);/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "快递状态",
          key: "shippingStatus",
          align: "center",
          render:(h,params)=>{
            return h('div',
              this.shippingStatus[params.row.shippingStatus]);/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "订单金额",
          key: "orderPrice",
          align: "center",
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
              ),
              h('Dropdown',{
                on:{
                  'on-click':(value)=>{
                    this.editOrderStatus(params.row,value);
                  }
                }
              },[
                h('div',{
                  class:{
                    member_operate_div: true
                  }
                },[h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    }
                  },["状态修改",
                    h('Icon',{
                      props:{
                        type: 'arrow-down-b'
                      }
                    })]
                )]),
                h('DropdownMenu',{
                  slot:'list'
                },[
                  h('DropdownItem',{
                    props:{
                      name: '确认订单',
                      disabled:!(params.row.orderStatus==0),
                      value:1,
                    }
                  },'确认订单'),
                  h('DropdownItem',{
                    props:{
                      name: '确认发货',
                      disabled:!(params.row.shippingStatus==0),
                      value:2,
                    }
                  },'确认发货'),
                  h('DropdownItem',{
                    props:{
                      name: '确认完成',
                      disabled:!(params.row.orderStatus==1&&params.row.shippingStatus==1),
                      value:3,
                    }
                  },'确认完成'),
                  h('DropdownItem',{
                    props:{
                      name: '取消订单',
                      disabled:!(params.row.subscribeStatus!=-1),
                      value:-1
                    }
                  },'取消订单'),
                ])
              ])
            ])
          }
        }
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
        descs:"addTime",
        mobile:undefined,
        userName:undefined,
        orderSn:undefined,
        shippingStatus:undefined,
        payStatus:undefined,
        orderStatus:undefined
      },
      orderStatusMap:{
        "0":"待确认",
        "1":"已确认",
        "2":"已完成",
        "-1":"已取消"
      },
      payStatusMap:{
        "0":"未支付",
        "1":"已支付",
      },
      shippingStatus:{
        "0":"未发货",
        "1":"已发货"
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
           this.searchForm.current=this.pageNumber;
      this.searchForm.size=this.pageSize;
      this.getRequest("/orders", this.searchForm).then(res => {
        console.log(res)
        this.loading = false;
        if (res.status === 200) {
          this.data = res.data.records;
          this.total = res.data.total;
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
          this.submitLoading = true;
          this.putBodyRequest("/orders/ship", this.roleForm).then(res => {
            this.submitLoading = false;
      if (res.status ==200) {
        this.$Message.success("操作成功");
        this.init();
        this.roleModalVisible = false;
      }
    });
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

    editOrderStatus(v,n){
      let params={
            id:v.id
      }
      if(n=="确认发货"){
        this.modalType = 1;
        this.modalTitle='确认发货';
        this.roleModalVisible=true;
        this.roleForm.orderId=v.id
        params.shippingStatus=1
        return
      }
      else if(n=="确认订单"){
        params.orderStatus=1
      }
      else if(n=="确认完成"){
        params.orderStatus=2
      }
      else if(n=="取消订单"){
        params.orderStatus=-1
      }
      this.$Modal.confirm({
        title: n,
        content: "您确认要"+n+ v.orderSn + " ?",
        onOk: () => {
          this.putBodyRequest("/orders",params).then(res=>{
            if (res.status === 200) {
              this.$Message.success("操作成功");
              this.init();
            }
            else{
              this.$Message.success("操作失败");
              this.init();
            }
          })
        }
      });

    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.name + " ?",
        onOk: () => {
          this.deleteRequest("/role/delAllByIds", { ids: v.id }).then(res => {
            if (res.status === true) {
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
            if (res.status === true) {
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
    orderInfo(i){
      this.$router.push({path:"/shopping",query:{orderId:i.id}});
    }

  },
  mounted() {
    this.init();
  }
};
</script>
