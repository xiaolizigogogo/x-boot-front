<style lang="less">
@import "shopParamManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                  <Row>
                    <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
                      <Form-item label="名称" prop="username">
                        <Input type="text" v-model="searchForm.name" clearable placeholder="请输入名称" style="width: 200px"/>
                      </Form-item>
                      <Form-item label="有效" prop="sex">
                        <Select v-model="searchForm.enable" placeholder="请选择" clearable style="width: 200px">
                          <Option value=1>有效</Option>
                          <Option value=0>无效</Option>
                        </Select>
                      </Form-item>
                      <span v-if="drop">
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
                        <Button @click="addRole" type="primary" icon="plus-round">添加</Button>
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
          <Form ref="serviceForm" :model="serviceForm" :label-width="80" :rules="serviceFormValidate">
            <FormItem label="编码" prop="paramCode">
              <Input v-model="serviceForm.paramCode" placeholder="编码"/>
            </FormItem>
            <FormItem label="值" prop="paramValue">
              <Input v-model="serviceForm.paramValue" placeholder="值"/>
            </FormItem>
            <FormItem label="描述" prop="paramDesc">
              <Input v-model="serviceForm.paramDesc" placeholder="描述"/>
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
  import qiniu from '../../my-components/image-upload/qiniu'
  import {formatDate,fmoney} from '../../../utils/global'
export default {
  name: "shop-param-manage",
  components:{
    qiniu
  },
  data() {
    return {
      searchForm:{
        name:undefined,
        enable:undefined
      },
      parentTypes:[],
      loading: true,
      treeLoading: true,
      submitPermLoading: false,
      sortColumn: "createTime",
      sortType: "desc",
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      modalTitle: "",
      imageUrl:'',
      serviceForm: {
        name: undefined,
        code: undefined,
        memo:undefined,
        img:undefined,
        id:undefined,
        enable:1,
        operator:undefined,
        orderBy:0,
        type:undefined,
        price:0
      },
      serviceFormValidate: {
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }]
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "chevron-down",
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "描述",
          key: "paramDesc",
          sortable: true
        },
        {
          title: "编码",
          key: "paramCode",
          sortable: true
        },
        {
          title: "值",
          key: "paramValue",
          sortable: true
        },
        {
          title: "创建时间",
          key: "gmtCreate",
          sortable: true,
          sortType: "desc",
          render:(h,params)=>{
            return h('div',
              params.row.gmtCreate?
                formatDate(new Date(params.row.gmtCreate)):"-");/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "是否有效",
          key: "paramEnable",
          align: "center",
          render: (h, params) => {
            if (params.row.paramEnable) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.cancelDefault(params.row);
                      }
                    }
                  },
                  "设为无效"
                )
              ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.setDefault(params.row);
                      }
                    }
                  },
                  "设为有效"
                )
              ]);
            }
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
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
    parentTypesMap:{},
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectPermList: [],
      selectAllFlag: false,
    };
  },
  methods: {
    init() {
      this.loadData();
      // 获取所有菜单权限树
    },
    changePage(v) {
      this.pageNumber = v;
      this.getRoleList();
    },
    changePageSize(v) {
      this.pageSize = v;
      this.getRoleList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order === "normal") {
        this.sortType = "";
      }
      this.getRoleList();
    },
    loadData() {
      this.loading = true;
      let params = {
        current: this.pageNumber,
        size: this.pageSize,
        asc: false,
        descs:"id",
        name:this.searchForm.name,
        enable:this.searchForm.enable
      };
      this.getRequest("/params", params).then(res => {
        this.loading = false;
        if (res.status == 200) {
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
      this.$refs.serviceForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.postBodyRequest("/params", this.serviceForm).then(res => {
            this.submitLoading = false;
            if (res.status === 200) {
              this.$Message.success("操作成功");
              this.init();
              this.roleModalVisible = false;
            }
            else{
              this.$Message.success("操作失败,原因:"+res.error);
            }
          });
        }
      });
    },
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.serviceForm={
          name: undefined,
          id:undefined,
          paramEnable:1,
          orderBy:0,
      },
        this.imageUrl="";
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let serviceInfo = JSON.parse(str);
      this.serviceForm=serviceInfo;
      this.imageUrl=this.serviceForm.imageUrl+"?"+Math.random();
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.name + " ?",
        onOk: () => {
          this.deleteRequest("/params", { id: v.id }).then(res => {
            if (res.status == 200) {
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
        content: "您确认要设置所选的 " + v.name + " 有效?",
        onOk: () => {
          let params = {
            id: v.id,
            paramEnable: 1
          };
          this.postBodyRequest("/productTypes", params).then(res => {
            if (res.status == 200) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    cancelDefault(v) {
      this.$Modal.confirm({
        title: "确认设为无效",
        content: "您确认要设置所选的 " + v.name + "无效?",
        onOk: () => {
          let params = {
            id: v.id,
            enable: false
          };
          this.postBodyRequest("/productTypes", params).then(res => {
            if (res.status == 200) {
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
    enable(v){
      this.$Modal.confirm({
        title: "确认显示",
        content: "您确认要显示栏目 " + v.name + " ?",
        onOk: () => {
        this.postBodyRequest("/params",{id:v.id,enable:1}).then(res => {
        if (res.status == 200) {
        this.$Message.success("操作成功");
        this.init();
      }
    });
    }
    });
    },
    unEnable(v){
      this.$Modal.confirm({
        title: "确认不显示",
        content: "您确认要不显示栏目 " + v.name + " ?",
        onOk: () => {
        this.postBodyRequest("/params",{id:v.id,enable:0}).then(res => {
        if (res.status == 200) {
        this.$Message.success("操作成功");
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
