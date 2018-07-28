<style lang="less">
@import "shopGoodsManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Form inline :label-width="70" class="search-form">
                      <Form-item label="搜索">
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
      <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable='false' :width="1000" :transfer="false">
        <Form ref="roleForm" :model="roleForm" :label-width="80" :rules="roleFormValidate">
          <FormItem label="商品名称" prop="name">
            <Input v-model="roleForm.name" placeholder="商品名称"/>
          </FormItem>
          <FormItem label="商品简介" prop="goodsBrief">
            <Input v-model="roleForm.goodsBrief" placeholder="商品简介" />
          </FormItem>
          <FormItem label="是否在售" prop="isOnSale">
            <Select v-model="roleForm.isOnSale" filterable placeholder="请选择" >
              <Option v-for="item in yesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="零售价格" prop="retailPrice">
            <InputNumber :max="100000" :min="0" v-model="roleForm.retailPrice"></InputNumber>
          </FormItem>
          <FormItem label="实际价格" prop="extraPrice">
            <InputNumber :max="100000" :min="0" v-model="roleForm.extraPrice"></InputNumber>
          </FormItem>
          <FormItem label="排序值" prop="sortOrder">
            <InputNumber :max="1000" :min="0" v-model="roleForm.sortOrder"></InputNumber>
          </FormItem>
          <FormItem label="是否新品" prop="isNew">
            <Select v-model="roleForm.isNew" filterable placeholder="请选择" >
              <Option v-for="item in yesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="库存单位" prop="goodsUnit">
            <Input v-model="roleForm.goodsUnit" placeholder="条/件"/>
          </FormItem>
          <FormItem label="促销描述" prop="name">
            <Input v-model="roleForm.promotionDesc" placeholder="促销描述"/>
          </FormItem>
          <FormItem label="列表图片" prop="listPicUrl">
            <qiniu
              @handleSuccess = "(url) => this.roleForm.listPicUrl = url" :imgUrl="this.listPicUrl">
            </qiniu>
          </FormItem>
          <FormItem label="详情主图片" prop="primaryPicUrl">
            <qiniu
              @handleSuccess = "(url) => this.roleForm.primaryPicUrl = url" :imgUrl="this.primaryPicUrl">
            </qiniu>
          </FormItem>
          <FormItem label="所属分类" prop="name">
            <Cascader :data="parentTypes"  :load-data="load" v-model="roleForm.categoryIds" placeholder="请选择" :render-format="formatType"></Cascader>
          </FormItem>
          <FormItem label="是否限购" prop="name">
            <Select v-model="roleForm.isLimited" filterable placeholder="请选择" >
              <Option v-for="item in yesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="是否热销" prop="name">
            <Select v-model="roleForm.isHot" filterable placeholder="请选择" >
              <Option v-for="item in yesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="销售量" prop="name">
            <Input v-model="roleForm.sellVolume" placeholder="销售量"/>
          </FormItem>
          <FormItem label="库存量" prop="name">
            <Input v-model="roleForm.goodsNumber" placeholder="库存量"/>
          </FormItem>
          <FormItem>
            <texteditor :id="roleForm.id+' '"></texteditor>
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
  import FormItem from "iview/src/components/form/form-item";
  import texteditor from "../../my-components/text-editor/text-editor"
export default {
  name: "shop-goods-manage",
  components:{
    FormItem,
    qiniu,
    texteditor

  },
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
      roleFormValidate:{
        name: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
        goodsBrief: [{ required: true, message: "不能为空", trigger: "blur" }],
        retailPrice: [{ required: true, message: "不能为空", trigger: "blur" ,type:'number'}],
        primaryPicUrl: [{ required: true, message: "不能为空", trigger: "blur" }],
        listPicUrl: [{ required: true, message: "不能为空", trigger: "blur" }],
        goodsUnit: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
      yesOptions:[{label:"是",value:1},{label:"否",value:0}],
      parentTypes:[],
      parentTypesMap:{},
      roleForm:{
        id:1,
        name:undefined,
        goodsNumber:undefined,
        sellVolume:undefined,
        isLimited:undefined,
        isHot:undefined,
        categoryId:undefined,
        primaryProductId:1,
        promotionDesc:undefined,
        goodsUnit:undefined,
        isNew:undefined,
        extraPrice:undefined,
        retailPrice:undefined,
        isOnSale:undefined,
        goodsBrief:undefined,
        categoryIds:undefined,
      },
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
          key: "id",
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
          align: "center",
          render: (h, params) => {
            if (params.row.isOnSale==1) {
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
                        this.offSale(params.row);
                      }
                    }
                  },
                  "下架"
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
                        this.onSale(params.row);
                      }
                    }
                  },
                  "上架"
                )
              ]);
            }
          }
        },
        {
          title: "是否删除",
          key: "isDelete",
          width: 110,
          align: "center",
          render: (h, params) => {
            if (params.row.isDelete==0) {
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
                        this.delete(params.row);
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
                        this.cancelDelete(params.row);
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
          title: "零售价格",
          key: "retailPrice",
          width: 110,
          sortable: true
        },
        {
          title: "库存",
          key: "goodsNumber",
          width: 110,
          sortable: true
        },
        {
          title: "销售量",
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
          title: "创建时间",
          key: "addTime",
          sortable: true,
          width: 105,
          sortType: "desc"
        },
    {
      title: "图片链接",
        key: "primaryPicUrl",
      align: "center",
      width: 105,
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
            src: params.row.primaryPicUrl, style: 'width: 80px;height: 80px;border-radius: 2px;'
          },
          style: {
          },
        }),
      ]);
    }

    },
        {
          title: "分类",
          key: "categoryId",
          sortable: true,
          width: 105,
          render:(h,params)=>{
            return h('div',
              this.parentTypesMap[params.row.categoryId]
            );
          }
        },
        {
          title: "操作",
          key: "action",
          width: 300,
          align: "center",
          render: (h, params) => {
            return h("div", [h(
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
            ),h(
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
                    this.$router.push({
                      name: "shop-goods-attribute-detail-manage",
                      query: {id:params.row.id}
                    });
                  }
                }
              },
              "参数编辑"
            ),h(
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
                    this.$router.push({
                      name: "shop-goods-gallery-detail-manage",
                      query: {id:params.row.id}
                    });
                  }
                }
              },
              "图片编辑"
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
        if (res.status == 200) {
          this.data = res.data.records;
          this.total = res.data.total;
        }
      });
      this.getRequest("/categorys", {current:1,size:1000,descs:"sortOrder",parentId:0}).then(res => {
        if (res.status === 200) {
          this.parentTypes=[];
          this.parentTypesMap={}
          res.data.records.forEach(item=>{
            this.parentTypes.push({value:item.id,label:item.name,children: [], loading: false})
          })
        }
      });
      this.getRequest("/categorys", {current:1,size:1000,descs:"sortOrder"}).then(res => {
        if (res.status === 200) {
          this.parentTypesMap={}
          res.data.records.forEach(item=>{
            this.parentTypesMap[item.id]=item.name
          })
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
          this.deleteRequest("/goods", { id: v.id }).then(res => {
            if (res.status == 200) {
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
        this.modalTitle = "添加商品";
        this.roleForm={};
        this.primaryPicUrl=undefined
        this.listPicUrl=undefined
        this.roleModalVisible = true;
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          let url = "/goods";
          this.submitLoading = true;
          this.roleForm.goodsDesc=localStorage.editorContent
          this.postBodyRequest(url, this.roleForm).then(res => {
            this.submitLoading = false;
          if (res.status == 200) {
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
      this.modalTitle = "添加商品";
      this.$refs.roleForm.resetFields();
      this.primaryPicUrl=undefined
      this.listPicUrl=undefined
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "商品";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.primaryPicUrl=this.roleForm.primaryPicUrl
      this.listPicUrl=this.roleForm.listPicUrl
      localStorage.editorContent=this.roleForm.goodsDesc
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.name + " ?",
        onOk: () => {
        this.deleteRequest("/goods", { id: v.id }).then(res => {
        if (res.status == true) {
        this.$Message.success("删除成功");
        this.init();
      }
    });
    }
    });
    },
    load (item, callback) {
      item.loading = true;
      setTimeout(() => {
        this.getRequest("/categorys", {current:1,size:1000,descs:"sortOrder",parentId:item.value}).then(res => {
          if (res.status === 200) {
            for(let j=0;j<res.data.records.length;j++){
              item.children.push({value:res.data.records[j].id,label:res.data.records[j].name})
            }
            item.loading = false;
            callback();
          }
        });
      }, 1000);
    },
    offSale(v) {
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架商品 " + v.name + " ?",
        onOk: () => {
          this.postBodyRequest("/goods",{id:v.id,isOnSale:0}).then(res => {
            if (res.status == 200) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    onSale(v) {
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架商品 " + v.name + " ?",
        onOk: () => {
          this.postBodyRequest("/goods",{id:v.id,isOnSale:1}).then(res => {
            if (res.status == 200) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    delete(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认删除商品 " + v.name + " ?",
        onOk: () => {
          this.postBodyRequest("/goods",{id:v.id,isDelete:1}).then(res => {
            if (res.status == 200) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    cancelDelete(v) {
      this.$Modal.confirm({
        title: "确认恢复",
        content: "您确认要恢复商品 " + v.name + " ?",
        onOk: () => {
          this.postBodyRequest("/goods",{id:v.id,isDelete:0}).then(res => {
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.init();
            }
          });
        }
      });
    },
    formatType(labels, selectedData) {
      console.log(selectedData)
      const index = labels.length - 1;
      const data = selectedData[index] || false;
      if (data && data.code) {
        return labels[index] + ' - ' + data.code;
      }
      if(selectedData.length>1){
        this.roleForm.categoryId=selectedData[1].value
      }
      return labels[index];
    }
  },
  mounted() {
    this.init();
  }
};
</script>
