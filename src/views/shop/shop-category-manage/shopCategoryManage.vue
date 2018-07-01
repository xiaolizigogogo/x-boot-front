<style lang="less">
@import "shopCategoryManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row>
                        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
                            <Form-item label="编号" prop="id">
                              <Input type="text" v-model="searchForm.id" clearable placeholder="请输入编号" style="width: 200px"/>
                            </Form-item>
                            <Form-item label="名称" prop="name">
                              <Input type="text" v-model="searchForm.name" clearable placeholder="请输入名称" style="width: 200px"/>
                            </Form-item>
                            <span v-if="drop">
                              <Form-item label="父类型" prop="parentId">
                                <Input type="text" v-model="searchForm.parentId" clearable placeholder="请输入父类型" style="width: 200px"/>
                              </Form-item>
                              <Form-item label="是否显示" prop="sex">
                                <Select v-model="searchForm.isShow" placeholder="请选择" clearable style="width: 200px">
                                  <Option value="0">不显示</Option>
                                  <Option value="1">显示</Option>
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
                        <Button @click="addUser" type="primary" icon="plus-round">添加分类</Button>
                        <Button @click="delAll" type="ghost" icon="trash-a">批量删除</Button>
                        <Dropdown @on-click="handleDropdown">
                          <Button type="ghost">
                              更多操作
                              <Icon type="arrow-down-b"></Icon>
                          </Button>
                          <DropdownMenu slot="list">
                              <DropdownItem name="refresh">刷新</DropdownItem>
                              <DropdownItem name="exportData">导出所选数据</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                    </Row>
                    <Row>
                        <Alert show-icon>
                            已选择 <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row>
                    <Row class="margin-top-10 searchable-table-con1">
                        <Table :loading="loading" border :columns="columns" :data="data" sortable="custom" @on-sort-change="changeSort" @on-selection-change="showSelect" ref="table"></Table>
                        <Table :columns="columns" :data="exportData" ref="exportTable" style="display:none"></Table>
                    </Row>
                    <Row type="flex" justify="end" class="code-row-bg page">
                        <Page :current="this.searchForm.pageNumber" :total="total" :page-size="this.searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50,100]" size="small" show-total show-elevator show-sizer></Page>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal :title="modalTitle" v-model="userModalVisible" :mask-closable='false' :width="500">
            <Form ref="createForm" :model="createForm" :label-width="70" :rules="userFormValidate">
              <Form-item label="名称" prop="name">
                <Input type="text" v-model="createForm.name" clearable placeholder="请输入名称" style="width: 200px"/>
              </Form-item>
                              <Form-item label="父类型" prop="parentId">
                                <Input type="text" v-model="createForm.parentId" clearable placeholder="请输入父类型" style="width: 200px"/>
                              </Form-item>
                              <Form-item label="是否显示" prop="sex">
                                <Select v-model="createForm.isShow" placeholder="请选择" clearable style="width: 200px">
                                  <Option value="0">不显示</Option>
                                  <Option value="1">显示</Option>
                                </Select>
                              </Form-item>
              <Form-item label="图标" prop="bannerUrl">
                <Input type="text" v-model="createForm.bannerUrl" clearable placeholder="请输入图标" style="width: 200px"/>
              </Form-item>
              <Form-item label="显示索引" prop="showIndex">
                <Input type="text" v-model="createForm.showIndex" clearable placeholder="请输入显示索引" style="width: 200px"/>
              </Form-item>
              <Form-item label="前台名称" prop="frontName">
                <Input type="text" v-model="createForm.frontName" clearable placeholder="请输入前台名称" style="width: 200px"/>
              </Form-item>
              <Form-item label="前台描述" prop="frontDesc">
                <Input type="text" v-model="createForm.frontDesc" clearable placeholder="请输入前台描述" style="width: 200px"/>
              </Form-item>
              <Form-item label="图片路径" prop="imgUrl">
                <Input type="text" v-model="createForm.imgUrl" clearable placeholder="请输入图片路径" style="width: 200px"/>
              </Form-item>
              <Form-item label="网页图片" prop="wapBannerUrl">
                <Input type="text" v-model="createForm.wapBannerUrl" clearable placeholder="请输入父类型" style="width: 200px"/>
              </Form-item>

              <qiniu
                @handleSuccess = "(url) => this.createForm.litpic = url" :imgUrl="this.createForm.img">
              </qiniu>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelUser">取消</Button>
                <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
  import qiniu from '../../my-components/image-upload/qiniu'
export default {
  name: "shop-category-manage",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码长度不得小于6位"));
      } else {
        callback();
      }
    };
    const validateMobile = (rule, value, callback) => {
      var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error("手机号格式错误"));
      } else {
        callback();
      }
    };
    return {
      loading: true,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "chevron-down",
      selectCount: 0,
      selectList: [],
      searchForm: {
        id: "",
        name: "",
        parentId: "",
        isShow: "",
        sortOrder: "",
        wapBannerUrl: "",
        pageNumber: 1,
        pageSize: 10,
      },
      createForm:{
        name:"",
        parentId:"",
        isShow:"",
        sortOrder:"",
        wapBannerUrl:"",
        frontDesc:"",
        frontName:"",
        iconUrl:"1",
        level:"V1",
        showIndex:"",
        type:0,
        imgUrl:"",
        bannerUrl:""
      },
      modalType: 0,
      userModalVisible: false,
      modalTitle: "",
      userForm: {
        sex: 1,
        roles: [],
        img:''
      },
      userRoles: [],
      roleList: [],
      errorPass: "",
      userFormValidate: {
        username: [
          { required: true, message: "账号不能为空", trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: validateMobile, trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱地址" },
          { type: "email", message: "邮箱格式不正确" }
        ]
      },
      asc: true,
      descs:"sortOrder",
      submitLoading: false,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "编号",
          key: "id",
          width: 150,
          sortable: true
        },
        {
          title: "名称",
          key: "name",
          width: 110,
          sortable: true
        },
        {
          title: "父类型",
          key: "parentId",
          width: 110,
          sortable: true
        },
        {
          title: "是否显示",
          key: "isShow",
          width: 110,
          sortable: true,
          render: (h, params) => {
          if (params.row.isShow) {
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
      "设为不显示"
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
      "设为显示"
    )
    ]);
    }
  }
        },
        {
          title: "排序值",
          key: "sortOrder",
          width: 200,
          sortable: true
        },
        {
          title: "图片链接",
          key: "wapBannerUrl",
          width: 200,
          sortable: true,
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
                  src: params.row.wapBannerUrl, style: 'width: 80px;height: 80px;border-radius: 2px;'
                },
                style: {
                },
              }),
            ]);
          }

        },
        {
          title: "操作",
          key: "action",
          width: 260,
          align: "center",
          render: (h, params) => {
            if (params.row.status === 0) {
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
                      type: "ghost",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.disable(params.row);
                      }
                    }
                  },
                  "禁用"
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
            } else {
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
        }
      ],
      data: [],
      exportData: [],
      total: 0
    };
  },
  components:{
    qiniu
  },
  methods: {
    init() {
      this.loadData();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.init();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.init();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    loadData() {
      this.loading = true;
      this.searchForm.current=this.searchForm.pageNumber
      this.searchForm.size=this.searchForm.pageSize
      this.getRequest("/categorys", this.searchForm).then(res => {
        this.loading = false;
        if (res.status === 200) {
          this.data = res.data.records;
          this.total = res.data.total;
        }
      });
    },
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
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.init();
    },
    getRoleList() {
      this.getRequest("/role/getAllList").then(res => {
        if (res.success === true) {
          this.roleList = res.result;
        }
      });
    },
    handleDropdown(name) {
      if (name === "exportData") {
        if (this.selectCount <= 0) {
          this.$Message.warning("您还未选择要导出的数据");
          return;
        }
        this.$Modal.confirm({
          title: "确认导出",
          content: "您确认要导出所选 " + this.selectCount + " 条数据?",
          onOk: () => {
            this.$refs.exportTable.exportCsv({
              filename: "用户数据"
            });
          }
        });
      } else if (name === "refresh") {
        this.init();
      }
    },
    selectRoles(v) {},
    cancelUser() {
      this.userModalVisible = false;
    },
    submitUser() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.postBodyRequest("/categorys", this.createForm).then(res => {
            this.submitLoading = false;
            if (res.status === 200) {
              this.$Message.success("操作成功");
              this.init();
              this.userModalVisible = false;
            }
          });
        }
      });
    },
    addUser() {
      this.modalType = 0;
      this.modalTitle = "添加分类";
      this.$refs.createForm.resetFields();
      this.userModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑分类";
      this.$refs.createForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let userInfo = JSON.parse(str);
      this.createForm = userInfo;
      let selectRolesId = [];
      this.createForm.img=v.wapBannerUrl
      this.createForm.roles = selectRolesId;
      this.userModalVisible = true;
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用用户 " + v.username + " ?",
        onOk: () => {
          this.postRequest("/user/admin/enable/" + v.id).then(res => {
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    disable(v) {
      this.$Modal.confirm({
        title: "确认禁用",
        content: "您确认要禁用用户 " + v.username + " ?",
        onOk: () => {
          this.postRequest("/user/admin/disable/" + v.id).then(res => {
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除分类 " + v.name + " ?",
        onOk: () => {
          this.deleteRequest("/categorys", { id: v.id }).then(res => {
            if (res.status === 200) {
              this.$Message.success("删除成功");
              this.init();
            }
          });
        }
      });
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
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
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
          this.deleteRequest("/user/delByIds", { ids: ids }).then(res => {
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
        content: "您确认要设置所选的 " + v.name + " 有效?",
        onOk: () => {
        let params = {
          id: v.id,
          isShow: 1
        };
      this.postBodyRequest("/categorys", params).then(res => {
        if (res.status === 200) {
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
          isShow: 0
        };
      this.postBodyRequest("/categorys", params).then(res => {
        if (res.status === 200) {
        this.$Message.success("操作成功");
        this.init();
      }
    });
    }
    });
    },
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>
