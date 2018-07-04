<style lang="less">
@import "shopGoodsAttributeDetailManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row class="operation">
                        <Button @click="addRole" type="primary" icon="plus-round">添加参数</Button>
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
            <FormItem label="名称" prop="name">
              <Input v-model="roleForm.name" placeholder="名称"/>
            </FormItem>
            <FormItem label="描述" prop="name">
              <Input v-model="roleForm.content" placeholder="描述"/>
            </FormItem>
            <FormItem label="图片链接" prop="name">
              <qiniu
                @handleSuccess = "(url) => this.roleForm.imageUrl = url" :imgUrl="this.imageUrl">
              </qiniu>
            </FormItem>
            <FormItem label="广告链接" prop="name">
              <Input v-model="roleForm.link" placeholder="广告链接"/>
            </FormItem>
            <FormItem label="结束时间" prop="name">
              <Input v-model="roleForm.endTime" placeholder="结束时间"/>
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
import {formatDate} from '../../../../utils/global'
import qiniu from '../../../my-components/image-upload/qiniu'
export default {
  name: "shop-goods-attribute-detail-manage",
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
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }]
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
          title: "名称",
          key: "name",
          align: "center",
        },
        {
          title: "结束时间",
          key: "endTime",
          sortable: true,
          sortType: "desc",
          render:(h,params)=>{
            return h('div',
              formatDate(new Date(params.row.endTime*1000)));/*这里的this.row能够获取当前行的数据*/
          }
        },
        {
          title: "描述",
          key: "content",
          align: "center",
        },
        {
          title: "图片链接",
          key: "imageUrl",
          align: "center",
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
                src: params.row.imageUrl, style: 'width: 80px;height: 80px;border-radius: 2px;'
              },
              style: {
              },
            }),
          ]);
        }

        },
        {
          title: "广告链接",
          key: "link",
          align: "center",
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
        adPositionId: this.$route.query.id,
        enabled: 1,
        current:this.pageNumber,
        size:this.pageSize,
        asc: false,
        descs:"id"
      };
      this.getRequest("/adPositions/"+this.$route.query.id, params).then(res => {
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
      this.modalTitle = "添加广告";
      this.roleForm = {
        name: "",
        access: null
      };
      this.imgUrl=undefined;
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
      console.log(roleInfo)
      this.roleForm = roleInfo;
      this.imageUrl=this.roleForm.imageUrl
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
    }
  },
  mounted() {
    this.init();
  }
};
</script>
