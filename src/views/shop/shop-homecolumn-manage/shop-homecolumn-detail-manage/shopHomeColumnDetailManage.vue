<style lang="less">
@import "shopHomeColumnDetailManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row class="operation">
                        <Button @click="addRole" type="primary" icon="plus-round">添加条目</Button>
                        <Button @click="delAll" type="ghost" icon="trash-a">批量删除</Button>
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
            <FormItem label="类型" prop="type">
              <Select v-model="roleForm.type" placeholder="类型" clearable style="width: 200px">
                <Option value=1>底部单图(60*60)</Option>
                <Option value=2>上部双图(60*60)</Option>
              </Select>
            </FormItem>
            <FormItem label="左标题" prop="titleLeft">
              <Input v-model="roleForm.titleLeft" placeholder="左标题"/>
            </FormItem>
            <FormItem label="左描述" prop="descLeft">
              <Input v-model="roleForm.descLeft" placeholder="左描述"/>
            </FormItem>
            <FormItem label="左图片一" prop="firstImgUrlLeft">
              <qiniu
                @handleSuccess = "(url) => this.roleForm.firstImgUrlLeft = url" :imgUrl="this.firstImgUrlLeft">
              </qiniu>
            </FormItem>
            <FormItem label="左链接" prop="targetUrlLeft">
              <Input v-model="roleForm.targetUrlLeft" placeholder="左链接"/>
            </FormItem>
            <FormItem label="排序值" prop="name">
              <Input v-model="roleForm.orderBy" placeholder="排序值"/>
            </FormItem>
            <div v-if="roleForm.type==2">
              <FormItem label="右标题" prop="name">
                <Input v-model="roleForm.titleRight" placeholder="右标题"/>
              </FormItem>
              <FormItem label="右描述" prop="name">
                <Input v-model="roleForm.descRight" placeholder="右描述"/>
              </FormItem>
              <FormItem label="右图片一" prop="name">
                <qiniu
                  @handleSuccess = "(url) => this.roleForm.firstImgUrlRight = url" :imgUrl="this.firstImgUrlRight">
                </qiniu>
              </FormItem>
              <FormItem label="右链接" prop="name">
                <Input v-model="roleForm.targetUrlRight" placeholder="右链接"/>
              </FormItem>
              <FormItem label="左图片二" prop="name">
                <qiniu
                  @handleSuccess = "(url) => this.roleForm.secondImgUrlLeft = url" :imgUrl="this.secondImgUrlLeft">
                </qiniu>
              </FormItem>
              <FormItem label="右图片二" prop="name">
                <qiniu
                  @handleSuccess = "(url) => this.roleForm.secondImgUrlRight = url" :imgUrl="this.secondImgUrlRight">
                </qiniu>
              </FormItem>
            </div>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelRole">取消</Button>
            <Button type="primary" :loading="submitLoading" @click="submitRole">提交</Button>
          </div>
        </Modal>
    </div>
</template>

<script>
import {formatDate} from '../../../../utils/global'
import qiniu from '../../../my-components/image-upload/qiniu'
export default {
  name: "shop-homecolumn-detail-manage",
  components:{
    qiniu
  },
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
      firstImgUrlLeft:"",
      secondImgUrlLeft:"",
      firstImgUrlRight:"",
      secondImgUrlRight:"",
      modalTitle: "",
      roleForm: {
        name: "",
        imageUrl:"",
        enabled:1,
        link:"",
        endTime:"",
        mediaType:1,
        adPositionId:this.$route.query.id
      },
      imageUrl:undefined,
      roleFormValidate: {
        name: []
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
          title: "类型",
          key: "type",
          align: "center",
          render:(h,params)=>{
            return h('div',
              this.typeMap[params.row.type]);/*这里的this.row能够获取当前行的数据*/
          }
        },
        // {
        //   title: "结束时间",
        //   key: "endTime",
        //   sortable: true,
        //   sortType: "desc",
        //   render:(h,params)=>{
        //     return h('div',
        //       formatDate(new Date(params.row.endTime*1000)));/*这里的this.row能够获取当前行的数据*/
        //   }
        // },
        {
          title: "左图一",
          key: "firstImgUrlLeft",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h('div', {
              attrs: {
                style: 'width: 80px;height: 80px;'
              },
            }, [
              h('img', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                attrs: {
                  src: params.row.firstImgUrlLeft, style: 'width: 80px;height: 80px;border-radius: 2px;'
                },
                style: {
                },
              }),
            ]);
          }
        },
        {
          title: "左图二",
          key: "secondImgUrlLeft",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h('div', {
              attrs: {
                style: 'width: 80px;height: 80px;'
              },
            }, [
              h('img', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                attrs: {
                  src: params.row.secondImgUrlLeft, style: 'width: 80px;height: 80px;border-radius: 2px;'
                },
                style: {
                },
              }),
            ]);
          }
        },
        {
          title: "右图一",
          key: "firstImgUrlRight",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h('div', {
              attrs: {
                style: 'width: 80px;height: 80px;'
              },
            }, [
              h('img', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                attrs: {
                  src: params.row.firstImgUrlRight, style: 'width: 80px;height: 80px;border-radius: 2px;'
                },
                style: {
                },
              }),
            ]);
          }
        },
        {
          title: "右图二",
          key: "secondImgUrlRight",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h('div', {
              attrs: {
                style: 'width: 80px;height: 80px;'
              },
            }, [
              h('img', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                attrs: {
                  src: params.row.secondImgUrlRight, style: 'width: 80px;height: 80px;border-radius: 2px;'
                },
                style: {
                },
              }),
            ]);
          }
        },
        {
          title: "左跳转链接",
          key: "targetUrlLeft",
          align: "center",
        },
        {
          title: "右跳转链接",
          key: "targetUrlRight",
          align: "center",
        },
        {
          title: "是否显示",
          key: "enable",
          width: 110,
          align: "center",
          render: (h, params) => {
            if (params.row.enable==1) {
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
                        this.unEnable(params.row);
                      }
                    }
                  },
                  "不显示"
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
                        this.enable(params.row);
                      }
                    }
                  },
                  "显示"
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
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectPermList: [],
      selectAllFlag: false,
      typeMap:{
        1:"底部单图",
        2:"上部双图"
      }
    };
  },
  methods: {
    init() {
      this.loadData();
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
        columnId: this.$route.query.id,
        enable: 1,
        current:this.pageNumber,
        size:this.pageSize,
        asc: true,
        ascs:"orderBy"
      };
      this.getRequest("/homeDetails/", params).then(res => {
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
          this.roleForm.columnId=this.$route.query.id
          this.postBodyRequest("/homeDetails", this.roleForm).then(res => {
            this.submitLoading = false;
            if (res.status === 200) {
              this.$Message.success("操作成功");
              this.init();
              this.roleModalVisible = false;
            }
            else{
              this.$Message.success("操作失败");
            }
          });
      });
    },
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加栏目";
      this.roleForm = {
        name: "",
        gmtCreate:new Date(),
        enable:1
      };
      this.firstImgUrlLeft="";
      this.secondImgUrlLeft="";
      this.firstImgUrlRight= "";
      this.secondImgUrlRight="";
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑栏目";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      console.log(roleInfo)
      this.roleForm = roleInfo;
      this.firstImgUrlLeft=this.roleForm.firstImgUrlLeft+"?"+Math.random();
      this.secondImgUrlLeft=this.roleForm.secondImgUrlLeft+"?"+Math.random();
      this.firstImgUrlRight= this.roleForm.firstImgUrlRight+"?"+Math.random();
      this.secondImgUrlRight=this.roleForm.secondImgUrlRight+"?"+Math.random();
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.name + " ?",
        onOk: () => {
          this.deleteRequest("/homeDetails", { ids: v.id }).then(res => {
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
    enable(v){
      this.$Modal.confirm({
        title: "确认显示",
        content: "您确认要显示栏目 " + v.titleLeft + " ?",
        onOk: () => {
          this.postBodyRequest("/homeDetails",{id:v.id,enable:1}).then(res => {
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
        content: "您确认要不显示栏目 " + v.titleLeft + " ?",
        onOk: () => {
          this.postBodyRequest("/homeDetails",{id:v.id,enable:0}).then(res => {
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
